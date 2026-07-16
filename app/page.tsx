'use client'

import { motion } from 'framer-motion'
import { usePeopleDex } from '@/lib/peopledex-context'
import { levelFromXp, xpForLevel } from '@/lib/game-engine'
import Link from 'next/link'
import { Camera, ArrowRight, Trophy, ScrollText, TrendingUp, Zap, Users, Calendar } from 'lucide-react'

export default function HomePage() {
  const { profile, people, quests, achievements } = usePeopleDex()
  if (!profile) return null

  const lvl = levelFromXp(profile.xp)
  const pct = (lvl.currentXp / lvl.nextLevelXp) * 100
  const today = new Date().toISOString().slice(0, 10)
  const todayCount = people.filter(p => p.capturedAt.startsWith(today)).length
  const unclaimed = quests.filter(q => q.completed && !q.claimed).length
  const completedAch = achievements.filter(a => a.completed).length
  const recent = [...people].sort((a,b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()).slice(0, 4)

  const rLookup: Record<string,string> = { common:'#737373',uncommon:'#16a34a',rare:'#2563eb',epic:'#7c3aed',legendary:'#ea580c',mythic:'#db2777',ultrarare:'#0891b2',secret:'#ca8a04' }
  const rLabel: Record<string,string> = { common:'Common',uncommon:'Uncommon',rare:'Rare',epic:'Epic',legendary:'Legendary',mythic:'Mythic',ultrarare:'Ultra Rare',secret:'Secret' }

  return (
    <div className="px-4 pt-10 pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">PeopleDex</h1>
          <p className="text-sm text-[#737373]">Your personal collection</p>
        </div>
        <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f5f4f1] border border-[#e6e4e0] text-sm font-medium text-[#1a1a1a] hover:bg-[#f0efec] transition-colors">
          <span>{profile.avatarEmoji}</span> Lv.{profile.level}
        </Link>
      </div>

      {/* XP */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#737373]">Level {profile.level}</span>
          <span className="text-xs text-[#a3a3a3]">{lvl.currentXp.toLocaleString()} / {lvl.nextLevelXp.toLocaleString()} XP</span>
        </div>
        <div className="h-2 rounded-full bg-[#f5f4f1] overflow-hidden">
          <motion.div className="h-full rounded-full bg-[#1a1a1a]" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-[#a3a3a3] flex items-center gap-1"><Zap className="w-3 h-3" />{profile.xp.toLocaleString()} total</span>
          {profile.currentStreak > 0 && <span className="text-[11px] text-[#ea580c] font-medium">🔥 {profile.currentStreak}d streak</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card p-3 text-center">
          <Users className="w-4 h-4 text-[#737373] mx-auto mb-1" />
          <div className="text-xl font-bold text-[#1a1a1a]">{profile.totalCaptures}</div>
          <div className="text-[10px] text-[#a3a3a3] font-medium">Captures</div>
        </div>
        <div className="card p-3 text-center">
          <GridIcon className="w-4 h-4 text-[#737373] mx-auto mb-1" />
          <div className="text-xl font-bold text-[#1a1a1a]">{people.length}</div>
          <div className="text-[10px] text-[#a3a3a3] font-medium">Unique</div>
        </div>
        <div className="card p-3 text-center">
          <Calendar className="w-4 h-4 text-[#737373] mx-auto mb-1" />
          <div className="text-xl font-bold text-[#1a1a1a]">{todayCount}</div>
          <div className="text-[10px] text-[#a3a3a3] font-medium">Today</div>
        </div>
      </div>

      {/* Camera CTA */}
      <Link href="/camera">
        <motion.div className="card card-hover p-6 text-center cursor-pointer relative overflow-hidden" whileTap={{ scale: 0.99 }}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#2563eb]/[0.04] to-transparent" />
          <div className="w-12 h-12 rounded-2xl bg-[#f5f4f1] flex items-center justify-center mx-auto mb-3">
            <Camera className="w-6 h-6 text-[#2563eb]" />
          </div>
          <h2 className="text-base font-semibold text-[#1a1a1a]">Start Scanning</h2>
          <p className="text-sm text-[#737373] mt-0.5">Open camera to detect and collect</p>
          <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-[#2563eb]">Open Camera <ArrowRight className="w-3 h-3" /></span>
        </motion.div>
      </Link>

      {/* Quest alert */}
      {unclaimed > 0 && (
        <Link href="/quests">
          <motion.div className="card p-3.5 flex items-center gap-3 border-[#fde68a]" initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <ScrollText className="w-5 h-5 text-[#f59e0b]" />
            <div className="flex-1"><div className="text-sm font-medium text-[#1a1a1a]">Quest rewards ready</div><div className="text-xs text-[#f59e0b]">{unclaimed} to claim</div></div>
            <ArrowRight className="w-4 h-4 text-[#a3a3a3]" />
          </motion.div>
        </Link>
      )}

      {/* Recent captures */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#1a1a1a]">Recent</h2>
            <Link href="/collection" className="text-xs font-medium text-[#2563eb] flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {recent.map(p => (
              <div key={p.id} className="card overflow-hidden group cursor-pointer card-hover">
                <div className="aspect-square bg-[#f5f4f1]"><img src={p.thumbnailData} alt={p.nickname} className="w-full h-full object-cover" /></div>
                <div className="p-1.5"><p className="text-[10px] font-medium text-[#1a1a1a] truncate">{p.nickname}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-2">
        <Link href="/achievements" className="card card-hover p-4 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-[#f59e0b]" />
          <div><div className="text-sm font-medium text-[#1a1a1a]">Achievements</div><div className="text-xs text-[#a3a3a3]">{completedAch}/{achievements.length}</div></div>
        </Link>
        <Link href="/stats" className="card card-hover p-4 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-[#16a34a]" />
          <div><div className="text-sm font-medium text-[#1a1a1a]">Statistics</div><div className="text-xs text-[#a3a3a3]">View insights</div></div>
        </Link>
      </div>
    </div>
  )
}

function GridIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
}
