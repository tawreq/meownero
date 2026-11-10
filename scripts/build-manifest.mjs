// Rebuilds public/memes/manifest.json from the files in public/memes/{references,images,gifs,videos}.
// The folder decides the section, in that order; files of an unsupported type are skipped.
//
//   node scripts/build-manifest.mjs
import { readdirSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../public/memes/", import.meta.url).pathname;
const DIRS = { references: "reference", images: "image", gifs: "gif", videos: "video" };
const ORDER = { reference: 0, image: 1, gif: 2, video: 3 };
const OK = { reference: /\.(jpe?g|png|webp|gif)$/i, image: /\.(jpe?g|png|webp)$/i, gif: /\.gif$/i, video: /\.(mp4|webm)$/i };

// Optional credits.json: { "videos/06-ab12cd34.mp4": { "handle": "LFilistin", "xUrl": "https://x.com/…/status/…" } }
let credits = {};
try { credits = JSON.parse(readFileSync(join(ROOT, "credits.json"), "utf8")); } catch {}

const memes = [];
for (const [dir, kind] of Object.entries(DIRS)) {
  let names = [];
  try { names = readdirSync(join(ROOT, dir)); } catch { continue; }
  for (const name of names) {
    if (!OK[kind].test(name) || !statSync(join(ROOT, dir, name)).isFile()) continue;
    const file = `${dir}/${name}`;
    memes.push({ file, kind, ...(credits[file] || {}) });
  }
}
memes.sort((a, b) => ORDER[a.kind] - ORDER[b.kind] || a.file.localeCompare(b.file, "en", { numeric: true }));
writeFileSync(join(ROOT, "manifest.json"), JSON.stringify({ memes }, null, 2) + "\n");
const n = k => memes.filter(m => m.kind === k).length;
console.log(`manifest.json: ${n("reference")} references, ${n("image")} images, ${n("gif")} GIFs, ${n("video")} videos`);
