// Pulls Meownero media posts from the watched X accounts into the depot.
// Dependencies are passed in so the job can be tested without X or Vercel.
import { ACCOUNTS, MATCH, BACKFILL_DAYS } from "./config.js";

const API = "https://api.x.com/2";

function cleanText(t) {
  return String(t || "").replace(/https?:\/\/t\.co\/\S+/g, "").replace(/\s+/g, " ").trim();
}
function postText(tw) { return tw.note_tweet?.text || tw.text || ""; }

function pickMedia(m) {
  if (m.type === "photo" && m.url) {
    const ext = (m.url.match(/\.(jpe?g|png|webp|gif)(?:$|\?)/i)?.[1] || "jpg").toLowerCase().replace("jpeg", "jpg");
    const u = new URL(m.url); u.searchParams.set("name", "orig");
    return { kind: "image", src: u.toString(), ext, contentType: ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "gif" ? "image/gif" : "image/jpeg" };
  }
  if ((m.type === "video" || m.type === "animated_gif") && Array.isArray(m.variants)) {
    const mp4 = m.variants.filter(v => v.content_type === "video/mp4" && v.url).sort((a, b) => (b.bit_rate || 0) - (a.bit_rate || 0));
    if (mp4[0]) return { kind: "video", src: mp4[0].url, ext: "mp4", contentType: "video/mp4" };
  }
  return null;
}

export async function runSync({ fetch, putBlob, readIndex, updateIndex, token, now = () => Date.now(), maxBytes = 45 * 1024 * 1024 }) {
  const report = { checked: [], added: 0, skipped: 0, errors: [] };
  if (!token) { report.errors.push("No X API token is set on this project."); return report; }
  const x = async (path) => {
    const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 429) throw new Error("X API rate limit reached; the next run will catch up.");
    if (!res.ok) throw new Error(`X API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return res.json();
  };

  const { index } = await readIndex();
  const known = new Set([...index.memes.map(m => m.mediaKey).filter(Boolean), ...(index.blocked || [])]);
  const users = { ...index.state.users };

  // Resolve user ids we don't have yet (one call for all).
  const missing = ACCOUNTS.filter(a => !users[a.toLowerCase()]?.id);
  if (missing.length) {
    try {
      const r = await x(`/users/by?usernames=${missing.join(",")}`);
      for (const u of r.data || []) users[u.username.toLowerCase()] = { ...(users[u.username.toLowerCase()] || {}), id: u.id, username: u.username };
      for (const e of r.errors || []) report.errors.push(`@${e.value || "?"}: ${e.detail || e.title}`);
    } catch (e) { report.errors.push(e.message); return report; }
  }

  const fresh = [];      // new depot entries, media already stored
  const sinceUpdates = {};
  for (const handle of ACCOUNTS) {
    const u = users[handle.toLowerCase()];
    if (!u?.id) continue;
    const params = new URLSearchParams({
      max_results: "100",
      exclude: "retweets",
      expansions: "attachments.media_keys",
      "media.fields": "type,url,variants,width,height",
      "tweet.fields": "created_at,text,note_tweet,attachments",
    });
    if (u.sinceId) params.set("since_id", u.sinceId);
    else params.set("start_time", new Date(now() - BACKFILL_DAYS * 864e5).toISOString().replace(/\.\d+Z$/, "Z"));
    let r;
    try { r = await x(`/users/${u.id}/tweets?${params}`); }
    catch (e) { report.errors.push(`@${u.username || handle}: ${e.message}`); continue; }
    report.checked.push(u.username || handle);
    let failed = false;
    const media = new Map((r.includes?.media || []).map(m => [m.media_key, m]));
    const posts = (r.data || []).slice().sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
    for (const tw of posts) {
      const text = postText(tw);
      if (!MATCH.test(text)) continue;
      const keys = tw.attachments?.media_keys || [];
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (known.has(key)) { report.skipped++; continue; }
        const pick = pickMedia(media.get(key) || {});
        if (!pick) continue;
        try {
          const res = await fetch(pick.src);
          if (!res.ok) throw new Error(`download ${res.status}`);
          const len = Number(res.headers.get("content-length") || 0);
          if (len > maxBytes) { report.errors.push(`Skipped a large video from @${u.username}: over ${Math.round(maxBytes / 1048576)} MB`); continue; }
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length > maxBytes) { report.errors.push(`Skipped a large video from @${u.username}`); continue; }
          const stored = await putBlob(`depot/media/x-${tw.id}-${i}.${pick.ext}`, buf, pick.contentType);
          fresh.push({
            id: `x-${tw.id}-${i}`, url: stored.url, pathname: stored.pathname, kind: pick.kind,
            caption: cleanText(text).slice(0, 140), handle: u.username || handle,
            xUrl: `https://x.com/${u.username || handle}/status/${tw.id}`,
            addedAt: Date.parse(tw.created_at) || now(), source: "x", mediaKey: key,
          });
          known.add(key);
        } catch (e) { failed = true; report.errors.push(`@${u.username}: couldn't save media from post ${tw.id} (${e.message})`); }
      }
    }
    // Only move the bookmark forward when everything saved, so failures get retried next run.
    if (r.meta?.newest_id && !failed) sinceUpdates[handle.toLowerCase()] = r.meta.newest_id;
  }

  await updateIndex(idx => {
    const have = new Set(idx.memes.map(m => m.mediaKey).filter(Boolean));
    const blocked = new Set(idx.blocked || []);
    let added = 0;
    for (const m of fresh) if (!have.has(m.mediaKey) && !blocked.has(m.mediaKey)) { idx.memes.push(m); added++; }
    idx.memes.sort((a, b) => b.addedAt - a.addedAt);
    for (const [k, v] of Object.entries(users)) idx.state.users[k] = { ...(idx.state.users[k] || {}), id: v.id, username: v.username };
    for (const [k, id] of Object.entries(sinceUpdates)) {
      const cur = idx.state.users[k]?.sinceId;
      if (!cur || BigInt(id) > BigInt(cur)) idx.state.users[k] = { ...idx.state.users[k], sinceId: id };
    }
    idx.state.lastSync = now();
    report.added = added;
  });
  return report;
}
