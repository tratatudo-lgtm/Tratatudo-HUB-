import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = 3000;

// Environment Variables
const SESSION_SECRET = process.env.SESSION_SECRET || "tratatudo-hub-secret-key-2026";
const EVO_URL = process.env.EVO_URL;
const EVO_KEY = process.env.EVO_KEY;
const EVO_INSTANCE = process.env.EVO_INSTANCE_DEFAULT || "TrataTudo bot";

// Supabase Admin Client (for secure operations)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

app.use(express.json());
app.use(cookieParser());

// Evolution API Helper
async function sendWhatsAppMessage(number: string, text: string) {
  if (!EVO_URL || !EVO_KEY) {
    console.error("Evolution API credentials missing");
    throw new Error("Evolution API not configured");
  }

  // Remove + from number for Evolution API
  const cleanNumber = number.replace("+", "");
  
  try {
    const response = await axios.post(
      `${EVO_URL}/message/sendText/${EVO_INSTANCE}`,
      {
        number: cleanNumber,
        text: text,
      },
      {
        headers: {
          "Content-Type": "application/json",
          apikey: EVO_KEY,
        },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Evolution API error:", error.response?.data || error.message);
    throw new Error("Failed to send WhatsApp message");
  }
}

// API: Request OTP Code
app.post("/api/auth/request-code", async (req, res) => {
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
      // For security, don't reveal if number exists, but the user asked for a message if not found
      return res.status(404).json({ error: "Não foi possível validar o acesso com este número. Contacta o suporte." });
    }

    // 2. Check for recent OTP to prevent spam
    const { data: recentOtp } = await supabaseAdmin
      .from("auth_otps")
      .select("*")
      .eq("phone_e164", phone_e164)
      .eq("purpose", "hub_login")
      .gt("created_at", new Date(Date.now() - 60 * 1000).toISOString()) // last 60 seconds
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (recentOtp) {
      return res.status(429).json({ error: "Aguarda um minuto antes de pedir novo código." });
    }

    // 3. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

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
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
      });

    if (insertError) throw insertError;

    // 6. Send via Evolution API
    const message = `🔐 Código de acesso ao Hub TrataTudo: ${otp}\nVálido por 5 minutos.\nSe não foste tu, ignora esta mensagem.`;
    await sendWhatsAppMessage(phone_e164, message);

    res.json({ ok: true, message: "Código enviado com sucesso." });
  } catch (error: any) {
    console.error("Request code error:", error);
    res.status(500).json({ error: "Não foi possível enviar o código. Tenta novamente." });
  }
});

// API: Verify OTP Code
app.post("/api/auth/verify-code", async (req, res) => {
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
    
    // Increment attempts regardless
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
    res.cookie("hub_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ ok: true, message: "Sessão iniciada com sucesso." });
  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({ error: "Erro ao validar acesso. Tenta novamente." });
  }
});

// API: Logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("hub_session");
  res.json({ ok: true });
});

// API: Get Current Session
app.get("/api/auth/session", (req, res) => {
  const token = req.cookies.hub_session;
  
  if (!token) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  try {
    const decoded = jwt.verify(token, SESSION_SECRET);
    res.json({ ok: true, session: decoded });
  } catch (error) {
    console.error("Session verification error:", error);
    res.status(401).json({ error: "Sessão inválida ou expirada" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
