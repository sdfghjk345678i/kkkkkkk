import { put, list } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

const STATS_PATH = "apk-stats/download-counts.json"

async function getStats(): Promise<Record<string, number>> {
  try {
    const { blobs } = await list({ prefix: "apk-stats/" })
    const statsBlob = blobs.find((b) => b.pathname === STATS_PATH)
    if (!statsBlob) return {}
    const res = await fetch(statsBlob.url, { cache: "no-store" })
    return await res.json()
  } catch {
    return {}
  }
}

async function saveStats(stats: Record<string, number>) {
  await put(STATS_PATH, JSON.stringify(stats), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  })
}

// POST: increment download count for a file URL
export async function POST(request: NextRequest) {
  try {
    const { fileUrl } = await request.json()
    if (!fileUrl) {
      return NextResponse.json({ error: "No fileUrl provided" }, { status: 400 })
    }

    const stats = await getStats()
    stats[fileUrl] = (stats[fileUrl] || 0) + 1
    await saveStats(stats)

    return NextResponse.json({ downloads: stats[fileUrl] })
  } catch (error) {
    console.error("Download tracking error:", error)
    return NextResponse.json({ error: "Failed to track download" }, { status: 500 })
  }
}

// GET: return all download counts
export async function GET() {
  try {
    const stats = await getStats()
    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ stats: {} })
  }
}
