'use client'

import dynamic from 'next/dynamic'

const CameraView = dynamic(() => import('@/components/CameraView'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-indigo-400 animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm">Loading camera...</p>
      </div>
    </div>
  ),
})

export default function CameraPage() {
  return (
    <div className="h-full">
      <CameraView />
    </div>
  )
}
