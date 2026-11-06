// Verify a GitHub Actions OIDC token, so the StonkDash repo's sync workflow can deliver X posts
// without a shared password. Same approach as StonkDash's own api/_lib/ghoidc.js.
// Accepts only tokens GitHub issued to the tawreq/stonkdash repository for the "meownero" audience.
import crypto from "node:crypto";

const ISS = "https://token.actions.githubusercontent.com";
export const AUDIENCE = "meownero";
export const REPO = (process.env.SYNC_REPO || "tawreq/stonkdash").trim();
let JWKS = null, JWKS_AT = 0;
const b64u = (s) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

export async function verifyGithubOidc(token, { fetchImpl = globalThis.fetch, now = Date.now() } = {}) {
  const [h, p, sig] = String(token || "").split(".");
  if (!h || !p || !sig) throw new Error("no token");
  const header = JSON.parse(b64u(h).toString()), claims = JSON.parse(b64u(p).toString());
  if (header.alg !== "RS256") throw new Error("bad alg");
  if (!JWKS || now - JWKS_AT > 3600_000) {
    JWKS = (await (await fetchImpl(`${ISS}/.well-known/jwks`)).json()).keys; JWKS_AT = now;
  }
  const jwk = JWKS.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("unknown key");
  const ok = crypto.verify("RSA-SHA256", Buffer.from(`${h}.${p}`), crypto.createPublicKey({ key: jwk, format: "jwk" }), b64u(sig));
  if (!ok) throw new Error("bad signature");
  const t = now / 1000;
  if (claims.iss !== ISS || claims.aud !== AUDIENCE || claims.repository !== REPO || !(claims.exp > t) || claims.nbf > t + 60) throw new Error("claims not accepted");
  return claims;
}
export function _resetJwksCache() { JWKS = null; JWKS_AT = 0; }
