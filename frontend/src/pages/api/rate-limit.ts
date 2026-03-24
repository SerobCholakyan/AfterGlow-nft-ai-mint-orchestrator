import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimit } from "../../lib/rateLimit";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  const ok = rateLimit(`rate-limit:${ip}`);

  if (!ok) {
    return res.status(429).json({ error: "Too many requests" });
  }

  return res.status(200).json({ ok: true });
}
