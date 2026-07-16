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
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#faf9f7] border-t border-[#e6e4e0]">
      <div className="flex justify-around items-center h-16">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className="relative flex flex-col items-center justify-center flex-1 h-full">
              {active && (
                <motion.div layoutId="nav" className="absolute top-2 bottom-2 inset-x-2 rounded-xl bg-[#f0efec]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <Icon className={`w-5 h-5 relative z-10 ${active ? 'text-[#1a1a1a]' : 'text-[#a3a3a3]'}`} />
              <span className={`text-[10px] mt-0.5 relative z-10 font-medium ${active ? 'text-[#1a1a1a]' : 'text-[#a3a3a3]'}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
