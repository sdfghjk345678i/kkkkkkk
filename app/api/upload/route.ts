import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createShortLink } from "@/lib/short-links"

export async function POST(request: NextRequest) {
  try {
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
