import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const SESSION_SECRET = process.env.SESSION_SECRET || "tratatudo-hub-secret-key-2026";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone_e164, code } = req.body;

  if (!phone_e164 || !code) {
    return res.status(400).json({ error: "Número e código são obrigatórios." });
  }

  try {
    // 1. Find latest valid OTP
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from("auth_otps")
      .select("*")
      .eq("phone_e164", phone_e164)
      .eq("purpose", "hub_login")
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpRecord) {
      return res.status(401).json({ error: "Código inválido ou expirado." });
    }

    // 2. Check attempts
    if (otpRecord.attempts >= 5) {
      await supabaseAdmin
        .from("auth_otps")
        .update({ used_at: new Date().toISOString() })
        .eq("id", otpRecord.id);
      return res.status(401).json({ error: "Máximo de tentativas excedido. Pede um novo código." });
    }

    // 3. Verify code
    const isValid = await bcrypt.compare(code, otpRecord.code_hash);
    
    // Increment attempts
    await supabaseAdmin
      .from("auth_otps")
      .update({ attempts: otpRecord.attempts + 1 })
      .eq("id", otpRecord.id);

    if (!isValid) {
      return res.status(401).json({ error: "Código inválido ou expirado." });
    }

    // 4. Mark as used
    await supabaseAdmin
      .from("auth_otps")
      .update({ used_at: new Date().toISOString() })
      .eq("id", otpRecord.id);

    // 5. Get client ID
    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("phone_e164", phone_e164)
      .single();

    if (!client) {
      return res.status(404).json({ error: "Erro ao validar acesso. Tenta novamente." });
    }

    // 6. Create Session Token
    const sessionToken = jwt.sign(
      {
        client_id: client.id,
        phone_e164: phone_e164,
        authenticated_at: new Date().toISOString(),
      },
      SESSION_SECRET,
      { expiresIn: "7d" }
    );

    // 7. Set Cookie
    const cookie = serialize("hub_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({ ok: true, message: "Sessão iniciada com sucesso." });
  } catch (error) {
    console.error("Verify code error:", error);
    return res.status(500).json({ error: "Erro ao validar acesso. Tenta novamente." });
  }
}
