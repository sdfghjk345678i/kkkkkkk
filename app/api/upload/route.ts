import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createShortLink } from "@/lib/short-links"

// Allow large APK uploads (up to 25 MB)
export const config = {
  api: {
    bodyParser: false,
  },
}

// Increase the body size limit for this route (Next.js App Router)
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get("content-length")
    if (contentLength && parseInt(contentLength) > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 25 MB." },
        { status: 413 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith(".apk")) {
      return NextResponse.json(
        { error: "Only APK files are allowed" },
        { status: 400 }
      )
    }

    const blob = await put(`apk/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/vnd.android.package-archive",
    })

    const shortCode = await createShortLink(blob.url, file.name)

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      filename: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      shortCode,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
