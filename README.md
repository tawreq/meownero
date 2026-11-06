# Meownero ($MNERO)

Meme depot + ghost-cat PFP generator. Static page in `public/`, Vercel Functions in `api/`, media in Vercel Blob.

## How the depot fills up
- **X sync** runs in the StonkDash repo (`tawreq/stonkdash`, workflow "Meownero depot sync", every two hours or by hand),
  using StonkDash's existing X keys. It searches @lowreswiz, @imnogue and @LFilistin for posts mentioning
  Meownero / $MEOWNERO / ミャウネロ with images or video and sends them to `POST /api/ingest`, which accepts only GitHub OIDC
  tokens issued to tawreq/stonkdash for the "meownero" audience (no shared password). First run looks back 3 days.
- **Manual uploads**: open the site, click **Admin** in the footer, sign in, drop files.
- Removing a synced meme keeps it from coming back.

## Environment variables
| Name | What |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Added automatically by the connected Blob store |
| `ADMIN_PASSWORD` | Password for the Admin panel |
| `SYNC_REPO` | Optional; repo allowed to send X posts (default `tawreq/stonkdash`) |

## Dev
`npm i`, `node scripts/test-ingest.mjs ../stonkdash` (offline end-to-end sync test), `npm run build:client` (rebuilds `public/blob-client.js`).
