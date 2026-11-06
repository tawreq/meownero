// Receives X posts from the StonkDash repo's "Meownero depot sync" workflow (GitHub OIDC, no shared password).
//   POST /api/ingest { action: "state" }                      → { sinceId, lastSync }
//   POST /api/ingest { action: "add", items: [...], sinceId } → { added, skipped, errors }
//   (with no items, "add" just records that a sync ran and moves the bookmark forward)
import { put } from "@vercel/blob";
import { verifyGithubOidc } from "../lib/ghoidc.js";
import { ingest } from "../lib/ingest.js";
import { readIndex, updateIndex } from "../lib/store.js";
import { readJson } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try { await verifyGithubOidc(String(req.headers.authorization || "").replace(/^Bearer\s+/i, "")); }
  catch { return res.status(401).json({ error: "Not allowed" }); }
  try {
    const body = await readJson(req);
    if (body.action === "state") {
      const { index } = await readIndex();
      return res.status(200).json({ sinceId: index.state.sinceId || null, lastSync: index.state.lastSync || null });
    }
    if (body.action === "add") {
      const report = await ingest({
        items: body.items, sinceId: body.sinceId, fetch: globalThis.fetch, readIndex, updateIndex,
        putBlob: (pathname, buf, contentType) => put(pathname, buf, { access: "public", addRandomSuffix: true, contentType }),
      });
      return res.status(200).json(report);
    }
    return res.status(400).json({ error: "Unknown action" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || "Ingest failed" });
  }
}
