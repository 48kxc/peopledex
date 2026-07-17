'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Camera, Grid3X3, ScrollText, Trophy, BarChart3, User } from 'lucide-react'

const items = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/camera', icon: Camera, label: 'Camera' },
  { href: '/collection', icon: Grid3X3, label: 'Collection' },
  { href: '/quests', icon: ScrollText, label: 'Quests' },
  { href: '/achievements', icon: Trophy, label: 'Achieve' },
  { href: '/stats', icon: BarChart3, label: 'Stats' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function NavigationBar() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
      <div className="glass flex justify-around items-center h-16 px-1 mx-3 rounded-2xl" style={{ background: 'rgba(24, 24, 27, 0.85)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className="relative flex flex-col items-center justify-center flex-1 h-full cursor-pointer">
              {active && (
                <motion.div
                  layoutId="nav"
                  className="absolute top-2 bottom-2 inset-x-2 rounded-xl"
                  style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.25)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                  active ? 'text-indigo-400' : 'text-zinc-500'
                }`}
                style={active ? { filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))' } : undefined}
              />
              <span className={`text-[10px] mt-0.5 relative z-10 font-medium transition-colors duration-200 ${
                active ? 'text-indigo-300' : 'text-zinc-500'
              }`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}