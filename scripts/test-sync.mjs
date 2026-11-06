// Offline test of lib/sync.js with a fake X API and an in-memory depot.
import assert from "node:assert/strict";
import { runSync } from "../lib/sync.js";

const NOW = Date.parse("2026-11-06T08:00:00Z");
let index = { memes: [], blocked: [], state: { users: {}, lastSync: null } };
const readIndex = async () => ({ index: structuredClone(index), etag: "e" });
const updateIndex = async fn => { const i = structuredClone(index); await fn(i); index = i; };
const stored = [];
const putBlob = async (pathname, body, contentType) => { stored.push({ pathname, size: body.length, contentType }); return { url: `https://abc.public.blob.vercel-storage.com/${pathname}`, pathname }; };

const calls = [];
const tweets = {
  "1": { data: [
      { id: "101", text: "gm $MNERO fam https://t.co/x", created_at: "2026-11-05T10:00:00Z", attachments: { media_keys: ["3_a"] } },
      { id: "102", text: "random cat pic, nothing to see", created_at: "2026-11-05T11:00:00Z", attachments: { media_keys: ["3_b"] } },
      { id: "103", text: "Meownero video drop", created_at: "2026-11-05T12:00:00Z", attachments: { media_keys: ["7_c"] } },
      { id: "104", text: "ミャウネロ text only", created_at: "2026-11-05T13:00:00Z" },
    ],
    includes: { media: [
      { media_key: "3_a", type: "photo", url: "https://pbs.twimg.com/media/AAA.jpg" },
      { media_key: "3_b", type: "photo", url: "https://pbs.twimg.com/media/BBB.png" },
      { media_key: "7_c", type: "video", variants: [
        { content_type: "application/x-mpegURL", url: "https://video.twimg.com/x.m3u8" },
        { content_type: "video/mp4", bit_rate: 256000, url: "https://video.twimg.com/low.mp4" },
        { content_type: "video/mp4", bit_rate: 2176000, url: "https://video.twimg.com/high.mp4" } ] },
    ] },
    meta: { newest_id: "104" } },
  "2": { meta: { result_count: 0 } },
  "3": { data: [ { id: "301", text: "short", note_tweet: { text: "long post about $mnero memes" }, created_at: "2026-11-04T09:00:00Z", attachments: { media_keys: ["16_g"] } } ],
    includes: { media: [ { media_key: "16_g", type: "animated_gif", variants: [ { content_type: "video/mp4", bit_rate: 0, url: "https://video.twimg.com/gif.mp4" } ] } ] },
    meta: { newest_id: "301" } },
};
const fakeFetch = async (url, opts = {}) => {
  calls.push(url);
  const u = new URL(url);
  const json = b => ({ ok: true, status: 200, json: async () => b, text: async () => JSON.stringify(b), headers: new Map() });
  if (u.hostname === "api.x.com") {
    assert.equal(opts.headers?.Authorization, "Bearer TEST");
    if (u.pathname === "/2/users/by") return json({ data: [ { id: "1", username: "lowreswiz" }, { id: "2", username: "imnogue" }, { id: "3", username: "LFilistin" } ] });
    const m = u.pathname.match(/^\/2\/users\/(\d)\/tweets$/);
    if (m) {
      if (u.searchParams.get("since_id")) return json({ meta: { result_count: 0 } });
      assert.match(u.searchParams.get("start_time"), /^2026-11-0[34]T08:00:00Z$/, "looks back 3 days from the run time");
      return json(tweets[m[1]]);
    }
  }
  if (/twimg\.com/.test(u.hostname)) return { ok: true, status: 200, headers: { get: () => "1000" }, arrayBuffer: async () => new ArrayBuffer(1000) };
  throw new Error("unexpected fetch " + url);
};

const r1 = await runSync({ fetch: fakeFetch, putBlob, readIndex, updateIndex, token: "TEST", now: () => NOW });
console.log("run 1:", r1);
assert.deepEqual(r1.errors, []);
assert.equal(r1.added, 3, "photo + video + gif, not the off-topic or text-only posts");
assert.deepEqual(index.memes.map(m => m.id), ["x-103-0", "x-101-0", "x-301-0"]);
const vid = index.memes.find(m => m.id === "x-103-0");
assert.equal(vid.kind, "video");
assert.ok(stored.some(s => s.pathname === "depot/media/x-101-0.jpg" && s.contentType === "image/jpeg"));
assert.ok(calls.includes("https://pbs.twimg.com/media/AAA.jpg?name=orig"));
assert.ok(calls.includes("https://video.twimg.com/high.mp4"), "highest-bitrate mp4");
assert.equal(index.memes.find(m => m.id === "x-101-0").caption, "gm $MNERO fam");
assert.equal(index.memes.find(m => m.id === "x-101-0").xUrl, "https://x.com/lowreswiz/status/101");
assert.equal(index.state.users.lowreswiz.sinceId, "104");
assert.equal(index.state.users.imnogue.sinceId, undefined);

// Second run: uses since_id, adds nothing, keeps existing.
const r2 = await runSync({ fetch: fakeFetch, putBlob, readIndex, updateIndex, token: "TEST", now: () => NOW + 864e5 });
console.log("run 2:", r2);
assert.equal(r2.added, 0);
assert.equal(index.memes.length, 3);

// Deleted synced items stay deleted.
index.blocked = ["3_a"]; index.memes = index.memes.filter(m => m.mediaKey !== "3_a");
index.state.users = {}; // force a fresh backfill
const r3 = await runSync({ fetch: fakeFetch, putBlob, readIndex, updateIndex, token: "TEST", now: () => NOW });
assert.equal(index.memes.some(m => m.mediaKey === "3_a"), false, "blocked media not re-added");
console.log("run 3:", r3);

// No token.
const r4 = await runSync({ fetch: fakeFetch, putBlob, readIndex, updateIndex, token: null });
assert.match(r4.errors[0], /No X API token/);
console.log("all sync tests passed");
