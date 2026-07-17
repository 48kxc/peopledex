'use client'

import CollectionGrid from '@/components/CollectionGrid'
import { usePeopleDex } from '@/lib/peopledex-context'

export default function CollectionPage() {
  const { people } = usePeopleDex()
  return (
    <div className="screen-shell">
      <div className="mb-8 flex items-end justify-between gap-5">
        <div><p className="eyebrow mb-4">Archive / all sightings</p><h1 className="screen-title">The <em>collection.</em></h1><p className="mt-4 text-sm text-[#92988a]">{people.length} unique entries · every one a little different</p></div>
        <div className="hidden text-right sm:block"><div className="mono text-[10px] uppercase tracking-wider text-[#92988a]">Archive capacity</div><div className="mt-1 text-2xl font-bold tracking-[-.08em] text-[#d8f36a]">{Math.min(people.length * 4, 100)}%</div></div>
      </div>
      <CollectionGrid />
    </div>
  )
}
