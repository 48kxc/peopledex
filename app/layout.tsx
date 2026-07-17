import type { Metadata, Viewport } from "next"
import "./globals.css"
import ClientLayout from "./ClientLayout"

export const viewport: Viewport = {
  themeColor: "#111310",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "PeopleDex — Collect the People You See",
  description: "Build your personal PeopleDex by capturing encounters. No facial recognition, just collecting.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "PeopleDex" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="h-full overflow-hidden bg-[#111310]"><ClientLayout>{children}</ClientLayout></body>
    </html>
  )
}
