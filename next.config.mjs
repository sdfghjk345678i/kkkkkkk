/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  // Increase body size limit for API routes (App Router)
  serverExternalPackages: [],
}

export default nextConfig
