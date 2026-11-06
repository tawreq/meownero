// Depot index kept as one JSON blob in Vercel Blob storage.
// Writes use the blob's ETag so the sync job and manual uploads can't overwrite each other.
import { put, head } from "@vercel/blob";

export const INDEX_PATH = "depot/index.json";
const EMPTY = () => ({ memes: [], blocked: [], state: { users: {}, lastSync: null } });

function notFound(e) {
  return e && e.name === "BlobNotFoundError";
}

export async function readIndex() {
  let meta;
  try { meta = await head(INDEX_PATH); }
  catch (e) { if (notFound(e)) return { index: EMPTY(), etag: null }; throw e; }
  const res = await fetch(`${meta.url}?v=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Index fetch failed: ${res.status}`);
  const index = { ...EMPTY(), ...(await res.json()) };
  index.state = { ...EMPTY().state, ...index.state, users: { ...(index.state?.users || {}) } };
  return { index, etag: meta.etag };
}

async function writeIndex(index, etag) {
  const opts = { access: "public", addRandomSuffix: false, contentType: "application/json", cacheControlMaxAge: 60 };
  if (etag) opts.ifMatch = etag; else opts.allowOverwrite = false;
  await put(INDEX_PATH, JSON.stringify(index), opts);
}

// Read, apply `mutate`, write back; retry if someone else wrote in between.
export async function updateIndex(mutate, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const { index, etag } = await readIndex();
    const result = await mutate(index);
    try { await writeIndex(index, etag); return result; }
    catch (e) {
      const conflict = e?.name === "BlobPreconditionFailedError" || /precondition|already exists/i.test(String(e?.message));
      if (!conflict || i === tries - 1) throw e;
      await new Promise(r => setTimeout(r, 300 + Math.random() * 700));
    }
  }
}
