import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Supabase Admin Client (for secure operations)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

app.use(express.json());

// API: Generate Magic Link
app.post("/api/magic-link/generate", async (req, res) => {
  const { clientId } = req.body;

  if (clientId === undefined || clientId === null) {
    return res.status(400).json({ error: "clientId is required" });
  }

  const numericClientId = Number(clientId);
  if (isNaN(numericClientId)) {
    return res.status(400).json({ error: "clientId must be a number" });
  }

  try {
    // 1. Validate client exists
    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("id, email, whatsapp_number")
      .eq("id", numericClientId)
      .single();

    if (clientError || !client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // 2. Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // 3. Save to magic_links table
    // Note: We assume the table exists. If not, this will fail.
    const { error: insertError } = await supabaseAdmin
      .from("magic_links")
      .insert({
        client_id: numericClientId,
        token: token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error inserting magic link:", insertError);
      return res.status(500).json({ error: "Failed to generate magic link" });
    }

    // 4. Return the URL
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const magicUrl = `${appUrl}/magic-access?token=${token}`;

    res.json({ ok: true, url: magicUrl });
  } catch (error) {
    console.error("Magic link generation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API: Verify Magic Link and get Supabase Session
app.post("/api/magic-link/verify", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "token is required" });
  }

  try {
    // 1. Find and validate token
    const { data: magicLink, error: linkError } = await supabaseAdmin
      .from("magic_links")
      .select("*")
      .eq("token", token)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (linkError || !magicLink) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // 2. Mark as used
    await supabaseAdmin
      .from("magic_links")
      .update({ used_at: new Date().toISOString() })
      .eq("id", magicLink.id);

    // 3. Get client details to find their Supabase User
    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("email, whatsapp_number")
      .eq("id", Number(magicLink.client_id))
      .single();

    if (clientError || !client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // 4. Generate a Supabase OTP link (Abordagem A)
    // We use the email to generate a magic link.
    // If the user doesn't have an email, we might need a different strategy.
    const identifier = client.email || client.whatsapp_number;
    
    if (!identifier) {
        return res.status(400).json({ error: "Client has no email or phone" });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: client.email, // generateLink currently only supports email for magiclink type
      options: {
        redirectTo: `${process.env.APP_URL}/dashboard`
      }
    });

    if (authError) {
      console.error("Auth link generation error:", authError);
      return res.status(500).json({ error: "Failed to create auth session" });
    }

    // Return the properties needed for the client to sign in
    // The client can use the hashed_token to verify
    res.json({ 
      ok: true, 
      email: client.email,
      hashedToken: (authData as any).properties?.hashed_token,
      action: 'verify'
    });

  } catch (error) {
    console.error("Magic link verification error:", error);
    res.status(500).json({ error: "Internal server error" });
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
