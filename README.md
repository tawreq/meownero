# Meownero ($MNERO)

Meme depot + ghost-cat PFP generator. Static page in `public/`, curated memes in `public/memes/`, Vercel Functions in `api/`, admin uploads in Vercel Blob.

## How the depot fills up
The depot has four sections, in this order: **References**, **Images**, **GIFs** and **Videos**. The folder a file is in decides its section.
- **Curated collection** ships with the site in `public/memes/{references,images,gifs,videos}/`. To change it, add or remove
  files there, run `node scripts/build-manifest.mjs`, and push. Videos should be H.264 MP4 (HEVC won't play in
  most browsers): `ffmpeg -i in.mp4 -c:v libx264 -preset veryfast -crf 22 -pix_fmt yuv420p -c:a copy -movflags +faststart out.mp4`.
- **Manual uploads**: open the site, click **Admin** in the footer, sign in, drop files. They go to Vercel Blob
  (index `depot/index-v2.json`) and can be removed from the Admin panel.
- There is no automatic X sync; it was switched off on 2026-11-10.

## Meme generator outfits
Jackets live in `public/outfits/` as 1000 × 1000 WebP files framed like the plain ghost; each one has a line in the
`STEPS` outfit list in `public/index.html` (id, label, file).

## Environment variables
| Name | What |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Added automatically by the connected Blob store |
| `ADMIN_PASSWORD` | Password for the Admin panel |

## Dev
`npm i`, `node scripts/build-manifest.mjs` (rebuilds the depot list), `npm run build:client` (rebuilds `public/blob-client.js`).
