import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import axios from "axios";

export default async function handler(req: any, res: any) {
  // 1. Defensive Logs & Env Var Checks
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const EVO_URL = process.env.EVO_URL;
  const EVO_KEY = process.env.EVO_KEY;
  const EVO_INSTANCE = process.env.EVO_INSTANCE_DEFAULT || "TrataTudo bot";

  console.log("Checking Environment Variables...");
  const missingVars = [];
  if (!SUPABASE_URL) missingVars.push("SUPABASE_URL");
  if (!SUPABASE_SERVICE_ROLE_KEY) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!EVO_URL) missingVars.push("EVO_URL");
  if (!EVO_KEY) missingVars.push("EVO_KEY");

  if (missingVars.length > 0) {
    console.error("Missing Environment Variables:", missingVars.join(", "));
    return res.status(500).json({ 
      error: "Configuração do servidor incompleta.", 
      details: `Missing: ${missingVars.join(", ")}` 
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone_e164 } = req.body;

  if (!phone_e164 || !phone_e164.startsWith("+")) {
    return res.status(400).json({ error: "Número de telefone inválido. Use formato E.164 (ex: +351...)" });
  }

  try {
    // Initialize Supabase inside handler to ensure env vars are present
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // 1. Check if client exists
    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("phone_e164", phone_e164)
      .single();

    if (clientError || !client) {
      console.log(`Client not found for number: ${phone_e164}`);
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
        ip_address: req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "0.0.0.0",
        user_agent: req.headers["user-agent"],
      });

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      throw new Error("Erro ao guardar código de verificação.");
    }

    // 6. Send via Evolution API
    const cleanNumber = phone_e164.replace("+", "");
    console.log(`Sending WhatsApp message to ${cleanNumber} via ${EVO_URL}`);
    
    try {
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
          timeout: 15000,
        }
      );
    } catch (evoError: any) {
      console.error("Evolution API Error Details:", evoError.response?.data || evoError.message);
      throw new Error("Falha ao enviar mensagem de WhatsApp.");
    }

    return res.status(200).json({ ok: true, message: "Código enviado com sucesso." });
  } catch (error: any) {
    console.error("Request code error:", error.message);
    return res.status(500).json({ 
      error: error.message || "Não foi possível enviar o código. Tenta novamente." 
    });
  }
}
