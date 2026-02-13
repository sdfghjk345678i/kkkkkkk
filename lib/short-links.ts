import { put, list } from "@vercel/blob"

const LINKS_PATH = "apk-meta/short-links.json"

export interface ShortLinkMap {
  [code: string]: {
    url: string
    filename: string
    createdAt: string
  }
}

export function generateCode(length = 4): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789"
  let code = ""
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function getLinksMap(): Promise<ShortLinkMap> {
  try {
    const { blobs } = await list({ prefix: "apk-meta/" })
    const linksBlob = blobs.find((b) => b.pathname === LINKS_PATH)
    if (!linksBlob) return {}
    const res = await fetch(linksBlob.url, { cache: "no-store" })
    return await res.json()
  } catch {
    return {}
  }
}

export async function saveLinksMap(links: ShortLinkMap) {
  await put(LINKS_PATH, JSON.stringify(links), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  })
}

export async function createShortLink(
  blobUrl: string,
  filename: string
): Promise<string> {
  const links = await getLinksMap()
  let code = generateCode()
  // Ensure uniqueness
  while (links[code]) {
    code = generateCode()
  }
  links[code] = {
    url: blobUrl,
    filename,
    createdAt: new Date().toISOString(),
  }
  await saveLinksMap(links)
  return code
}

export async function removeShortLink(blobUrl: string) {
  const links = await getLinksMap()
  const codeToRemove = Object.keys(links).find((c) => links[c].url === blobUrl)
  if (codeToRemove) {
    delete links[codeToRemove]
    await saveLinksMap(links)
  }
}
