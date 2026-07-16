'use client'

import { PeopleDexProvider, usePeopleDex } from '@/lib/peopledex-context'
import NavigationBar from '@/components/NavigationBar'
import XPPopup, { RarityReveal, Confetti } from '@/components/Effects'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PeopleDexProvider>
      <div className="h-full flex flex-col bg-background">
        <main className="flex-1 overflow-y-auto pb-20">
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
