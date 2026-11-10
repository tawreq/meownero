import { del } from "@vercel/blob";
import { readIndex, updateIndex } from "../lib/store.js";
import { isAdmin, readJson } from "../lib/auth.js";
import { BLOB_HOST } from "../lib/config.js";

const clean = (v, n) => String(v || "").replace(/\s+/g, " ").trim().slice(0, n);
const handleOf = v => { const h = String(v || "").trim().replace(/^@+/, ""); return /^[A-Za-z0-9_]{1,30}$/.test(h) ? h : ""; };
const xUrlOf = v => { try { const u = new URL(v); return u.protocol === "https:" && /(^|\.)(x\.com|twitter\.com)$/i.test(u.hostname) ? u.href : ""; } catch { return ""; } };

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { index } = await readIndex();
      const memes = index.memes.map(({ id, url, kind, caption, handle, xUrl, addedAt, source }) => ({ id, url, kind, caption, handle, xUrl, addedAt, source }));
      res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=300");
      return res.status(200).json({ memes });
    }
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    if (!isAdmin(req)) return res.status(401).json({ error: "Wrong admin password" });
    const body = await readJson(req);

    if (body.action === "check") return res.status(200).json({ ok: true });

    if (body.action === "add") {
      const items = (Array.isArray(body.items) ? body.items : []).slice(0, 50).flatMap(it => {
        let host; try { host = new URL(it.url).hostname; } catch { return []; }
        if (!BLOB_HOST.test(host)) return [];
        return [{
          id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          url: it.url, pathname: clean(it.pathname, 300), kind: ["video", "gif"].includes(it.kind) ? it.kind : "image",
          caption: clean(it.caption, 140), handle: handleOf(it.handle), xUrl: xUrlOf(it.xUrl),
          addedAt: Date.now(), source: "upload",
        }];
      });
      if (!items.length) return res.status(400).json({ error: "Nothing valid to add" });
      await updateIndex(idx => { idx.memes.unshift(...items); });
      return res.status(200).json({ added: items.length });
    }

    if (body.action === "delete") {
      let removed = null;
      await updateIndex(idx => {
        const i = idx.memes.findIndex(m => m.id === body.id);
        if (i >= 0) {
          removed = idx.memes.splice(i, 1)[0];
        }
      });
      if (!removed) return res.status(404).json({ error: "Meme not found" });
      try { await del(removed.url); } catch (e) { console.error("Blob delete failed", e); }
      return res.status(200).json({ removed: removed.id });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Something went wrong on the server" });
  }
}
