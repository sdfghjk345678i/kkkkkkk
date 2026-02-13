"use client"

import { useState } from "react"
import { Download, Trash2, FileDown, Loader2, Package, Eye, Copy, Check, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface ApkFile {
  url: string
  pathname: string
  filename: string
  size: number
  uploadedAt: string
  shortCode: string | null
}

interface ApkFileListProps {
  files: ApkFile[]
  isLoading: boolean
  onDelete: (url: string) => Promise<void>
  onDownload: (fileUrl: string) => Promise<void>
  downloadStats: Record<string, number>
}

export function ApkFileList({ files, isLoading, onDelete, onDownload, downloadStats }: ApkFileListProps) {
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyShortLink = async (code: string) => {
    const shortUrl = `${window.location.origin}/d/${code}`
    await navigator.clipboard.writeText(shortUrl)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDelete = async (url: string) => {
    setDeletingUrl(url)
    try {
      await onDelete(url)
    } finally {
      setDeletingUrl(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg">Hosted Files</CardTitle>
          <Badge variant="secondary" className="font-mono text-xs">
            {files.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              No APK files uploaded yet
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Upload your first APK file using the form above.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead className="hidden sm:table-cell">Short Link</TableHead>
                <TableHead className="hidden sm:table-cell">Size</TableHead>
                <TableHead className="hidden md:table-cell">Uploaded</TableHead>
                <TableHead className="hidden sm:table-cell">Downloads</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.url}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <FileDown className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate max-w-[200px] lg:max-w-[300px]">
                          {file.filename}
                        </p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {formatSize(file.size)} &middot; {downloadStats[file.url] ?? 0} downloads
                          {file.shortCode && <> &middot; /d/{file.shortCode}</>}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {file.shortCode ? (
                      <button
                        onClick={() => copyShortLink(file.shortCode!)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        aria-label={`Copy short link /d/${file.shortCode}`}
                      >
                        {copiedCode === file.shortCode ? (
                          <Check className="h-3 w-3 text-primary" />
                        ) : (
                          <Link className="h-3 w-3" />
                        )}
                        /d/{file.shortCode}
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground font-mono">
                      {formatSize(file.size)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(file.uploadedAt)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-mono text-muted-foreground">
                        {downloadStats[file.url] ?? 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          onDownload(file.url)
                          window.open(file.url, "_blank")
                        }}
                        aria-label={`Download ${file.filename}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(file.url)}
                        disabled={deletingUrl === file.url}
                        aria-label={`Delete ${file.filename}`}
                      >
                        {deletingUrl === file.url ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
