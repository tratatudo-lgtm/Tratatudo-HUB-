import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import axios from "axios";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone_e164 } = req.body;

  if (!phone_e164 || !phone_e164.startsWith("+")) {
    return res.status(400).json({ error: "Número de telefone inválido. Use formato E.164 (ex: +351...)" });
  }

  try {
    // 1. Check if client exists
    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("phone_e164", phone_e164)
      .single();

    if (clientError || !client) {
      return res.status(404).json({ error: "Não foi possível validar o acesso com este número. Contacta o suporte." });
    }

    // 2. Check for recent OTP to prevent spam
    const { data: recentOtp } = await supabaseAdmin
      .from("auth_otps")
      .select("*")
      .eq("phone_e164", phone_e164)
      .eq("purpose", "hub_login")
      .gt("created_at", new Date(Date.now() - 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (recentOtp) {
      return res.status(429).json({ error: "Aguarda um minuto antes de pedir novo código." });
    }

    // 3. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 4. Invalidate old OTPs
    await supabaseAdmin
      .from("auth_otps")
      .update({ used_at: new Date().toISOString() })
      .eq("phone_e164", phone_e164)
      .eq("purpose", "hub_login")
      .is("used_at", null);

    // 5. Save to auth_otps
    const { error: insertError } = await supabaseAdmin
      .from("auth_otps")
      .insert({
        phone_e164,
        code_hash: codeHash,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        user_agent: req.headers["user-agent"],
      });

    if (insertError) throw insertError;

    // 6. Send via Evolution API
    const EVO_URL = process.env.EVO_URL;
    const EVO_KEY = process.env.EVO_KEY;
    const EVO_INSTANCE = process.env.EVO_INSTANCE_DEFAULT || "TrataTudo bot";

    const cleanNumber = phone_e164.replace("+", "");
    await axios.post(
      `${EVO_URL}/message/sendText/${EVO_INSTANCE}`,
      {
        number: cleanNumber,
        text: `🔐 Código de acesso ao Hub TrataTudo: ${otp}\nVálido por 5 minutos.\nSe não foste tu, ignora esta mensagem.`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          apikey: EVO_KEY,
        },
        timeout: 10000,
      }
    );

    return res.status(200).json({ ok: true, message: "Código enviado com sucesso." });
  } catch (error: any) {
    console.error("Request code error:", error);
    return res.status(500).json({ error: "Não foi possível enviar o código. Tenta novamente." });
  }
}
