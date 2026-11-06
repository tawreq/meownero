# Meownero ($MNERO)

Meme depot + ghost-cat PFP generator. Static page in `public/`, Vercel Functions in `api/`, media in Vercel Blob.

## How the depot fills up
- **X sync** (`api/sync.js`, daily via Vercel Cron): checks @lowreswiz, @imnogue and @LFilistin for posts that
  mention Meownero / $MNERO / ミャウネロ and carry images or video, saves the media to Blob, and adds it to the depot
  with the creator's handle and a link to the post. First run looks back 3 days. Edit accounts in `lib/config.js`.
- **Manual uploads**: open the site, click **Admin** in the footer, sign in, drop files.
- Removing a synced meme keeps it from coming back on the next sync.

## Environment variables
| Name | What |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Added automatically when a Blob store is connected to the project |
| `X_BEARER_TOKEN` (or `TWITTER_BEARER_TOKEN`) | X API app bearer token, shared from StonkDash |
| `ADMIN_PASSWORD` | Password for the Admin panel |
| `CRON_SECRET` | Lets Vercel Cron call `/api/sync` |

## Dev
`npm i`, `node scripts/test-sync.mjs` (offline sync tests), `npm run build:client` (rebuilds `public/blob-client.js`).
