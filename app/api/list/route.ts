import { list } from "@vercel/blob"
import { NextResponse } from "next/server"
import { getLinksMap } from "@/lib/short-links"

export async function GET() {
  try {
    const [{ blobs }, linksMap] = await Promise.all([
      list({ prefix: "apk/" }),
      getLinksMap(),
    ])

    // Build reverse lookup: blobUrl -> shortCode
    const urlToCode: Record<string, string> = {}
    for (const [code, entry] of Object.entries(linksMap)) {
      urlToCode[entry.url] = code
    }

    const files = blobs.map((blob) => ({
      url: blob.url,
      pathname: blob.pathname,
      filename: blob.pathname.replace("apk/", "").replace(/-[a-zA-Z0-9]+\.apk$/, ".apk"),
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      shortCode: urlToCode[blob.url] || null,
    }))

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error listing files:", error)
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 })
  }
}
