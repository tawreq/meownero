// Accounts the sync job watches, and what counts as a Meownero post.
export const ACCOUNTS = ["lowreswiz", "imnogue", "LFilistin"];
export const MATCH = /meownero|\$mnero|\bmnero\b|ミャウネロ/i;

// On the first run for an account, look back this far.
export const BACKFILL_DAYS = 3;

// The X API bearer token. Uses whichever of these names is set, so a shared
// variable from another project (e.g. StonkDash) works without renaming.
export function xToken() {
  for (const k of ["X_BEARER_TOKEN", "TWITTER_BEARER_TOKEN", "X_API_BEARER_TOKEN", "TWITTER_API_BEARER_TOKEN", "BEARER_TOKEN"]) {
    if (process.env[k]) return process.env[k];
  }
  return null;
}

export const BLOB_HOST = /\.public\.blob\.vercel-storage\.com$/;
