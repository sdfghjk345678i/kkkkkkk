"use client"

import useSWR from "swr"
import { ApkUploadForm } from "@/components/apk-upload-form"
import { ApkFileList } from "@/components/apk-file-list"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ApkDashboard() {
  const { data, isLoading, mutate } = useSWR("/api/list", fetcher)
  const { data: statsData, mutate: mutateStats } = useSWR("/api/download", fetcher)

  const handleUploadComplete = () => {
    mutate()
  }

  const handleDelete = async (url: string) => {
    const response = await fetch("/api/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      throw new Error("Failed to delete file")
    }

    mutate()
    mutateStats()
  }

  const handleDownload = async (fileUrl: string) => {
    await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    })
    mutateStats()
  }

  return (
    <div className="flex flex-col gap-8">
      <ApkUploadForm onUploadComplete={handleUploadComplete} />
      <ApkFileList
        files={data?.files ?? []}
        isLoading={isLoading}
        onDelete={handleDelete}
        onDownload={handleDownload}
        downloadStats={statsData?.stats ?? {}}
      />
    </div>
  )
}
