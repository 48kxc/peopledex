'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Camera, Grid3X3, ScrollText, Trophy, BarChart3, ArrowUpRight } from 'lucide-react'

const items = [
  { href: '/', icon: Home, label: 'Overview' },
  { href: '/camera', icon: Camera, label: 'Scan' },
  { href: '/collection', icon: Grid3X3, label: 'Collection' },
  { href: '/quests', icon: ScrollText, label: 'Quests' },
  { href: '/achievements', icon: Trophy, label: 'Milestones' },
  { href: '/stats', icon: BarChart3, label: 'Insights' },
]

export default function NavigationBar() {
  const pathname = usePathname()
  return (
    <>
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-white/10 bg-[#151814]/90 px-5 py-6 backdrop-blur-xl">
        <Link href="/" className="mb-12 flex items-center gap-3 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d8f36a] text-xl font-black text-[#111310] shadow-[0_0_30px_rgba(216,243,106,.12)]">P</span>
          <span><span className="block text-lg font-bold tracking-[-0.04em] text-[#f4f1e8]">PeopleDex</span><span className="eyebrow !text-[9px] !tracking-[.12em] !text-[#92988a]">personal field guide</span></span>
        </Link>
        <p className="eyebrow mb-3 px-3 !text-[#6f7569]">Workspace</p>
        <nav className="space-y-1">
          {items.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return <Link key={href} href={href} className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active ? 'text-[#111310]' : 'text-[#9da497] hover:bg-white/[.05] hover:text-[#f4f1e8]'}`}>
              {active && <motion.span layoutId="desktop-nav" className="absolute inset-0 rounded-xl bg-[#d8f36a]" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              <Icon className="relative z-10 h-[18px] w-[18px]" /><span className="relative z-10">{label}</span>
              {active && <ArrowUpRight className="relative z-10 ml-auto h-4 w-4" />}
            </Link>
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-[#1d211b] p-4">
          <p className="mono text-[10px] uppercase tracking-[.14em] text-[#92988a]">Field note 001</p>
          <p className="mt-2 text-sm leading-5 text-[#d6d9ca]">Every person is a story waiting to be catalogued.</p>
          <Link href="/profile" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#d8f36a]">Open profile <ArrowUpRight className="h-3 w-3" /></Link>
        </div>
      </aside>
      <nav className="fixed bottom-0 inset-x-0 z-40 px-3 pb-safe lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
        <div className="glass flex h-[68px] items-center justify-around px-1" style={{ background: 'rgba(26,29,24,.94)' }}>
          {items.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return <Link key={href} href={href} className="relative flex h-full flex-1 flex-col items-center justify-center gap-1">
              {active && <motion.div layoutId="mobile-nav" className="absolute inset-x-2 top-2 bottom-2 rounded-xl bg-[#d8f36a]/10" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              <Icon className={`relative z-10 h-[18px] w-[18px] ${active ? 'text-[#d8f36a]' : 'text-[#747b70]'}`} />
              <span className={`relative z-10 text-[9px] font-semibold ${active ? 'text-[#d8f36a]' : 'text-[#747b70]'}`}>{label}</span>
            </Link>
          })}
        </div>
      </nav>
    </>
  )
}
