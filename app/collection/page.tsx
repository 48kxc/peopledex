'use client'

import CollectionGrid from '@/components/CollectionGrid'
import { usePeopleDex } from '@/lib/peopledex-context'

export default function CollectionPage() {
  const { people } = usePeopleDex()
  return (
    <div className="px-4 pt-10 pb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">Collection</h1>
          <p className="text-sm text-[#737373]">{people.length} unique</p>
        </div>
      </div>
      <CollectionGrid />
    </div>
  )
}
