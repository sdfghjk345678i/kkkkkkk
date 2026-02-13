import { ApkDashboard } from "@/components/apk-dashboard"
import { Package } from "lucide-react"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
              APK Hosting
            </h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed ml-[52px]">
            Upload, manage, and share Android APK files.
          </p>
        </header>
        <ApkDashboard />
      </div>
    </main>
  )
}
