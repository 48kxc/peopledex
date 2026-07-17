'use client'

import dynamic from 'next/dynamic'

const CameraView = dynamic(() => import('@/components/CameraView'), { ssr: false })

export default function CameraPage() {
  return (
    <div className="h-full w-full">
      <CameraView />
    </div>
  )
}