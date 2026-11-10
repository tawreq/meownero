// Depot index kept as one JSON blob in Vercel Blob storage.
// Holds admin uploads only; the core collection lives in public/memes/. Writes use the blob's ETag so
// two uploads can't overwrite each other.
import { put, head, BlobNotFoundError, BlobPreconditionFailedError } from "@vercel/blob";

// v2 started empty on 2026-11-10 when the depot was reset to the curated Memes folder.
export const INDEX_PATH = "depot/index-v2.json";
const EMPTY = () => ({ memes: [] });

function notFound(e) {
  return e instanceof BlobNotFoundError || e?.constructor?.name === "BlobNotFoundError";
}

export async function readIndex() {
  let meta;
  try { meta = await head(INDEX_PATH); }
  catch (e) { if (notFound(e)) return { index: EMPTY(), etag: null }; throw e; }
  const res = await fetch(`${meta.url}?v=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Index fetch failed: ${res.status}`);
  const index = { ...EMPTY(), ...(await res.json()) };
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
      const conflict = e instanceof BlobPreconditionFailedError || /precondition|already exists/i.test(String(e?.message));
      if (!conflict || i === tries - 1) throw e;
      await new Promise(r => setTimeout(r, 300 + Math.random() * 700));
    }
  }
}
