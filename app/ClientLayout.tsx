'use client'

import { PeopleDexProvider } from '@/lib/peopledex-context'
import NavigationBar from '@/components/NavigationBar'
import XPPopup, { RarityReveal, Confetti } from '@/components/Effects'
import AsciiBackground from '@/components/AsciiBackground'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PeopleDexProvider>
      <div className="h-full flex flex-col bg-[#111310] relative">
        <AsciiBackground />
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8 lg:ml-64 relative z-10">
          {children}
        </main>
        <NavigationBar />
        <XPPopup />
        <RarityReveal />
        <Confetti />
      </div>
    </PeopleDexProvider>
  )
}
