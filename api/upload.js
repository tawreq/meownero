import { handleUpload } from "@vercel/blob/client";
import { isAdmin, readJson } from "../lib/auth.js";

// Issues short-lived tokens so the admin's browser can upload straight to Vercel Blob
// (avoids the 4.5 MB function body limit for videos).
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = await readJson(req);
  if (body?.type === "blob.generate-client-token" && !isAdmin(req)) return res.status(401).json({ error: "Wrong admin password" });
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("depot/media/")) throw new Error("Bad upload path");
        return {
          allowedContentTypes: ["image/png", "image/jpeg", "image/gif", "image/webp", "video/mp4", "video/webm"],
          maximumSizeInBytes: 100 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}
