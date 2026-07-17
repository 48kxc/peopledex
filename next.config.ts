import type { NextConfig } from "next"

const isCFPages = !!process.env.CF_PAGES

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  ...(isCFPages ? { output: "export" } : {}),
}

export default nextConfig
