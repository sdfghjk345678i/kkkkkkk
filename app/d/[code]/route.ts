import { NextResponse } from "next/server"
import { getLinksMap } from "@/lib/short-links"
import { put, list } from "@vercel/blob"

const STATS_PATH = "apk-stats/download-counts.json"

async function incrementDownload(fileUrl: string) {
  try {
    const { blobs } = await list({ prefix: "apk-stats/" })
    const statsBlob = blobs.find((b) => b.pathname === STATS_PATH)
    let stats: Record<string, number> = {}
    if (statsBlob) {
      const res = await fetch(statsBlob.url, { cache: "no-store" })
      stats = await res.json()
    }
    stats[fileUrl] = (stats[fileUrl] || 0) + 1
    await put(STATS_PATH, JSON.stringify(stats), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    })
  } catch {
    // silently fail - don't block the redirect
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const links = await getLinksMap()
  const entry = links[code]

  if (!entry) {
    return new NextResponse("File not found", { status: 404 })
  }

  // Track the download in background
  incrementDownload(entry.url)

  // Redirect to the actual blob URL
  return NextResponse.redirect(entry.url)
}
