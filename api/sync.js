import { put } from "@vercel/blob";
import { runSync } from "../lib/sync.js";
import { readIndex, updateIndex } from "../lib/store.js";
import { isAdmin, isCron } from "../lib/auth.js";
import { xToken } from "../lib/config.js";

// Runs on the Vercel Cron schedule in vercel.json, or from the admin "Sync now" button.
export default async function handler(req, res) {
  if (!isCron(req) && !isAdmin(req)) return res.status(401).json({ error: "Not allowed" });
  try {
    const report = await runSync({
      fetch: globalThis.fetch,
      token: xToken(),
      readIndex, updateIndex,
      putBlob: (pathname, body, contentType) => put(pathname, body, { access: "public", addRandomSuffix: true, contentType }),
    });
    res.status(200).json(report);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Sync failed" });
  }
}
