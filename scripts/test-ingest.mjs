// End-to-end offline test: StonkDash's meownero-sync.mjs → Meownero's ingest (GitHub OIDC check + storage).
// Usage: node scripts/test-ingest.mjs <path to stonkdash checkout>
import assert from "node:assert/strict";
import crypto from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { verifyGithubOidc } from "../lib/ghoidc.js";
import { ingest, validItem } from "../lib/ingest.js";

const STONK = process.argv[2] || "../stonkdash";
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256" };
const b64u = o => Buffer.from(JSON.stringify(o)).toString("base64url");
function mint(claims) {
  const h = b64u({ alg: "RS256", kid: "k1" }), p = b64u(claims);
  return `${h}.${p}.${crypto.sign("RSA-SHA256", Buffer.from(`${h}.${p}`), privateKey).toString("base64url")}`;
}
const now = Math.floor(Date.now() / 1000);
const good = { iss: "https://token.actions.githubusercontent.com", aud: "meownero", repository: "tawreq/stonkdash", exp: now + 300, nbf: now - 5 };
const jwksFetch = async () => ({ json: async () => ({ keys: [jwk] }) });

// OIDC checks
await verifyGithubOidc(mint(good), { fetchImpl: jwksFetch });
for (const bad of [{ ...good, repository: "someone/else" }, { ...good, aud: "stonkdash" }, { ...good, exp: now - 10 }]) {
  await assert.rejects(verifyGithubOidc(mint(bad), { fetchImpl: jwksFetch }));
}
await assert.rejects(verifyGithubOidc(mint(good).slice(0, -4) + "AAAA", { fetchImpl: jwksFetch }), /bad signature/);
assert.equal(validItem({ tweetId: "123456", index: 0, ext: "jpg", src: "https://evil.example/x.jpg", handle: "a", mediaKey: "3_1" }), null, "only X media hosts");
console.log("OIDC + validation checks passed");

// Fake depot
let index = { memes: [], blocked: [], state: { users: {}, lastSync: null } };
const readIndex = async () => ({ index: structuredClone(index) });
const updateIndex = async fn => { const i = structuredClone(index); await fn(i); index = i; };
const putBlob = async (p) => ({ url: `https://x.public.blob.vercel-storage.com/${p}`, pathname: p });

let searches = [];
const SITE = "https://meownero-lime.vercel.app";
globalThis.fetch = async (url, opts = {}) => {
  const u = new URL(url);
  const json = (b, status = 200) => ({ ok: status < 400, status, json: async () => b, text: async () => JSON.stringify(b), headers: { get: () => null } });
  if (u.hostname === "oidc.test") return json({ value: mint(good) });
  if (u.hostname === "api.x.com") {
    assert.match(opts.headers.Authorization, /^OAuth /, "uses StonkDash's OAuth keys");
    searches.push(u.searchParams);
    if (u.searchParams.get("since_id")) return json({ meta: { result_count: 0 } });
    return json({
      data: [
        { id: "1854000000000009001", author_id: "u1", text: "gm $MEOWNERO https://t.co/z", created_at: "2026-11-05T10:00:00Z", attachments: { media_keys: ["3_a", "7_v"] } },
        { id: "1854000000000009002", author_id: "u2", text: "Meownero meme", created_at: "2026-11-05T09:00:00Z", attachments: { media_keys: ["3_b"] } },
        { id: "1854000000000009003", author_id: "u2", text: "meownero thoughts, no media", created_at: "2026-11-05T08:00:00Z" },
      ],
      includes: {
        media: [
          { media_key: "3_a", type: "photo", url: "https://pbs.twimg.com/media/A.jpg" },
          { media_key: "3_b", type: "photo", url: "https://pbs.twimg.com/media/B.png" },
          { media_key: "7_v", type: "video", variants: [{ content_type: "video/mp4", bit_rate: 100, url: "https://video.twimg.com/lo.mp4" }, { content_type: "video/mp4", bit_rate: 900, url: "https://video.twimg.com/hi.mp4" }] },
        ],
        users: [{ id: "u1", username: "lowreswiz" }, { id: "u2", username: "imnogue" }],
      },
      meta: { newest_id: "1854000000000009001" },
    });
  }
  if (/twimg\.com$/.test(u.hostname)) return { ok: true, status: 200, headers: { get: () => "100" }, arrayBuffer: async () => new ArrayBuffer(100) };
  if (url === `${SITE}/api/ingest`) {
    try { await verifyGithubOidc(opts.headers.Authorization.replace(/^Bearer /, ""), { fetchImpl: jwksFetch }); }
    catch { return json({ error: "Not allowed" }, 401); }
    const body = JSON.parse(opts.body);
    if (body.action === "state") return json({ sinceId: index.state.sinceId || null });
    const realFetch = globalThis.fetch;
    return json(await ingest({ items: body.items, sinceId: body.sinceId, fetch: realFetch, putBlob, readIndex, updateIndex }));
  }
  throw new Error("unexpected fetch " + url);
};
Object.assign(process.env, { ACTIONS_ID_TOKEN_REQUEST_URL: "https://oidc.test/token?x=1", ACTIONS_ID_TOKEN_REQUEST_TOKEN: "t", X_API_KEY: "k", X_API_SECRET: "s", X_ACCESS_TOKEN: "a", X_ACCESS_SECRET: "b", MEOWNERO_SITE: SITE });

const script = pathToFileURL(path.resolve(STONK, "scripts/social/meownero-sync.mjs")).href;
await import(script + "?run=1");
assert.equal(index.memes.length, 3, "two photos + one video");
assert.deepEqual(index.memes.map(m => m.kind).sort(), ["image", "image", "video"]);
assert.equal(index.state.sinceId, "1854000000000009001");
const q = searches[0].get("query");
assert.match(q, /from:lowreswiz OR from:imnogue OR from:LFilistin/);
assert.ok(searches[0].get("start_time"), "first run backfills by time");
assert.equal(index.memes.find(m => m.kind === "video").url.endsWith(".mp4"), true);
assert.equal(index.memes.find(m => m.id === "x-1854000000000009001-0").xUrl, "https://x.com/lowreswiz/status/1854000000000009001");

await import(script + "?run=2");
assert.equal(searches.at(-1).get("since_id"), "1854000000000009001", "second run continues from the bookmark");
assert.equal(index.memes.length, 3);
console.log("end-to-end sync test passed");
