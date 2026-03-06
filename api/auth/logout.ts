import { serialize } from "cookie";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookie = serialize("hub_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: -1, // Expire immediately
  });

  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ ok: true });
}
