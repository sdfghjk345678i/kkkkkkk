import { type NextRequest, NextResponse } from "next/server"
import { createShortLink } from "@/lib/short-links"

export async function POST(request: NextRequest) {
  try {
    const { url, filename } = await request.json()

    if (!url || !filename) {
      return NextResponse.json(
        { error: "Missing url or filename" },
        { status: 400 }
      )
    }

    const shortCode = await createShortLink(url, filename)

    return NextResponse.json({ shortCode })
  } catch (error) {
    console.error("Short link creation error:", error)
    return NextResponse.json(
      { error: "Failed to create short link" },
      { status: 500 }
    )
  }
}
