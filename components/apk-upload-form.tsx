"use client"

import { useCallback, useState, useRef } from "react"
import { Upload, FileUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ApkUploadFormProps {
  onUploadComplete: () => void
}

export function ApkUploadForm({ onUploadComplete }: ApkUploadFormProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith(".apk")) {
      return "Only APK files are allowed."
    }
    if (file.size > 20 * 1024 * 1024) {
      return "File size must be under 20 MB."
    }
    return null
  }

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      return
    }
    setError(null)
    setSelectedFile(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)
    setProgress(10)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      setProgress(30)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      setProgress(80)

      if (!response.ok) {
        let errorMessage = "Upload failed"
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch {
          // Response was not valid JSON (e.g. "Request Entity Too Large")
          if (response.status === 413) {
            errorMessage = "File is too large. Please upload a smaller APK."
          } else {
            errorMessage = `Upload failed (HTTP ${response.status})`
          }
        }
        throw new Error(errorMessage)
      }

      setProgress(100)

      setTimeout(() => {
        setSelectedFile(null)
        setProgress(0)
        setUploading(false)
        onUploadComplete()
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setUploading(false)
      setProgress(0)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <Card className="border-dashed border-2">
      <CardContent className="p-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg py-10 px-4 transition-colors cursor-pointer",
            isDragging
              ? "bg-primary/5 border-primary"
              : "hover:bg-muted/50",
            uploading && "pointer-events-none opacity-60"
          )}
          onClick={() => !uploading && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          aria-label="Upload APK file"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".apk"
            onChange={handleFileSelect}
            className="sr-only"
            aria-label="Select APK file"
          />

          {!selectedFile ? (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Drop your APK file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                APK files only, up to 20 MB
              </p>
            </>
          ) : (
            <div
              className="flex w-full items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(selectedFile.size)}
                </p>
                {uploading && (
                  <Progress value={progress} className="h-1.5 mt-2" />
                )}
              </div>
              {!uploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFile}
                  className="shrink-0"
                  aria-label="Remove selected file"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive mt-3 text-center">{error}</p>
        )}

        {selectedFile && !uploading && (
          <div className="flex justify-center mt-4">
            <Button onClick={handleUpload} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload APK
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
