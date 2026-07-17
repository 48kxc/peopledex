import type { NextConfig } from "next"

const isProd = process.env.NODE_ENV === "production"

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  ...(isProd ? { output: "export" } : {}),
}

export default nextConfig
