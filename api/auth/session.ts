import jwt from "jsonwebtoken";
import { parse } from "cookie";

const SESSION_SECRET = process.env.SESSION_SECRET || "tratatudo-hub-secret-key-2026";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.hub_session;
  
  if (!token) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  try {
    const decoded = jwt.verify(token, SESSION_SECRET);
    return res.status(200).json({ ok: true, session: decoded });
  } catch (error) {
    console.error("Session verification error:", error);
    return res.status(401).json({ error: "Sessão inválida ou expirada" });
  }
}
