// Rebuilds public/memes/manifest.json from the files in public/memes/{images,gifs,videos}.
// The category comes from the file type, so a GIF dropped in images/ still lands under GIFs.
//
//   node scripts/build-manifest.mjs
import { readdirSync, writeFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = new URL("../public/memes/", import.meta.url).pathname;
const KIND = { ".jpg": "image", ".jpeg": "image", ".png": "image", ".webp": "image", ".gif": "gif", ".mp4": "video", ".webm": "video" };
const ORDER = { image: 0, gif: 1, video: 2 };

const memes = [];
for (const dir of ["images", "gifs", "videos"]) {
  let names = [];
  try { names = readdirSync(join(ROOT, dir)); } catch { continue; }
  for (const name of names) {
    const kind = KIND[extname(name).toLowerCase()];
    if (!kind || !statSync(join(ROOT, dir, name)).isFile()) continue;
    memes.push({ file: `${dir}/${name}`, kind });
  }
}
memes.sort((a, b) => ORDER[a.kind] - ORDER[b.kind] || a.file.localeCompare(b.file, "en", { numeric: true }));
writeFileSync(join(ROOT, "manifest.json"), JSON.stringify({ memes }, null, 2) + "\n");
const n = k => memes.filter(m => m.kind === k).length;
console.log(`manifest.json: ${n("image")} images, ${n("gif")} GIFs, ${n("video")} videos`);
