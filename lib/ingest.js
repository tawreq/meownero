// Stores media from X posts that the StonkDash sync workflow found, and adds them to the depot.
// The workflow does the X API work (it holds the keys); this side only downloads from X's media hosts.

const MEDIA_HOSTS = new Set(["pbs.twimg.com", "video.twimg.com"]);
const TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", mp4: "video/mp4" };
const HANDLE = /^[A-Za-z0-9_]{1,30}$/;

function clean(t) { return String(t || "").replace(/https?:\/\/t\.co\/\S+/g, "").replace(/\s+/g, " ").trim().slice(0, 140); }

export function validItem(it) {
  if (!it || typeof it !== "object") return null;
  const tweetId = String(it.tweetId || ""), idx = Number(it.index) || 0, ext = String(it.ext || "").toLowerCase();
  let host; try { host = new URL(it.src).hostname; } catch { return null; }
  if (!/^\d{5,25}$/.test(tweetId) || !MEDIA_HOSTS.has(host) || !TYPES[ext] || !HANDLE.test(String(it.handle || ""))) return null;
  if (!/^[\w-]{1,40}$/.test(String(it.mediaKey || "")) || idx < 0 || idx > 9) return null;
  return {
    id: `x-${tweetId}-${idx}`, tweetId, index: idx, ext, src: it.src, mediaKey: String(it.mediaKey),
    kind: ext === "mp4" ? "video" : "image", contentType: TYPES[ext], handle: String(it.handle),
    caption: clean(it.text), createdAt: Date.parse(it.createdAt) || Date.now(),
  };
}

export async function ingest({ items, sinceId, fetch, putBlob, readIndex, updateIndex, now = () => Date.now(), maxBytes = 60 * 1024 * 1024 }) {
  const report = { added: 0, skipped: 0, errors: [] };
  const { index } = await readIndex();
  const known = new Set([...index.memes.map(m => m.mediaKey).filter(Boolean), ...(index.blocked || [])]);
  const fresh = [];
  for (const raw of (Array.isArray(items) ? items : []).slice(0, 10)) {
    const it = validItem(raw);
    if (!it) { report.errors.push("Ignored an item that didn't look like X media"); continue; }
    if (known.has(it.mediaKey)) { report.skipped++; continue; }
    try {
      const res = await fetch(it.src);
      if (!res.ok) throw new Error(`download ${res.status}`);
      if (Number(res.headers.get("content-length") || 0) > maxBytes) throw new Error("file too large");
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > maxBytes) throw new Error("file too large");
      const stored = await putBlob(`depot/media/${it.id}.${it.ext}`, buf, it.contentType);
      fresh.push({
        id: it.id, url: stored.url, pathname: stored.pathname, kind: it.kind, caption: it.caption, handle: it.handle,
        xUrl: `https://x.com/${it.handle}/status/${it.tweetId}`, addedAt: it.createdAt, source: "x", mediaKey: it.mediaKey,
      });
      known.add(it.mediaKey);
    } catch (e) { report.errors.push(`Post ${it.tweetId}: ${e.message}`); }
  }
  await updateIndex(idx => {
    const have = new Set(idx.memes.map(m => m.mediaKey).filter(Boolean));
    const blocked = new Set(idx.blocked || []);
    for (const m of fresh) if (!have.has(m.mediaKey) && !blocked.has(m.mediaKey)) { idx.memes.push(m); report.added++; }
    idx.memes.sort((a, b) => b.addedAt - a.addedAt);
    if (sinceId && /^\d{5,25}$/.test(String(sinceId))) {
      const cur = idx.state.sinceId;
      if (!cur || BigInt(sinceId) > BigInt(cur)) idx.state.sinceId = String(sinceId);
    }
    idx.state.lastSync = now();
  });
  return report;
}
