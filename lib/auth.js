import { timingSafeEqual } from "node:crypto";

function same(a, b) {
  const x = Buffer.from(String(a || "")), y = Buffer.from(String(b || ""));
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
}

// Admin: the person managing the depot, via the password in ADMIN_PASSWORD.
export function isAdmin(req) {
  const pw = process.env.ADMIN_PASSWORD;
  return !!pw && same(req.headers["x-admin-key"], pw);
}

export async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}
