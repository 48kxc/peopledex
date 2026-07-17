'use client'

import { motion } from 'framer-motion'
import { usePeopleDex } from '@/lib/peopledex-context'
import { levelFromXp, xpForLevel } from '@/lib/game-engine'
import Link from 'next/link'
import { Camera, ArrowRight, Trophy, ScrollText, TrendingUp, Zap, Users, Calendar, Sparkle } from 'lucide-react'

export default function HomePage() {
  const { profile, people, quests, achievements } = usePeopleDex()
  if (!profile) return null

  const lvl = levelFromXp(profile.xp)
  const pct = (lvl.currentXp / lvl.nextLevelXp) * 100
  const today = new Date().toISOString().slice(0, 10)
  const todayCount = people.filter(p => p.capturedAt.startsWith(today)).length
  const unclaimed = quests.filter(q => q.completed && !q.claimed).length
  const completedAch = achievements.filter(a => a.completed).length
  const recent = [...people].sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()).slice(0, 4)

  return (
    <div className="px-4 pt-12 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-shimmer">PeopleDex</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Your personal collection</p>
        </div>
        <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#C7D2FE' }}>
          <span>{profile.avatarEmoji}</span> Lv.{profile.level}
        </Link>
      </div>

      {/* XP Bar */}
      <div className="glass p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400">Level {profile.level}</span>
          <span className="text-xs text-zinc-500">{lvl.currentXp.toLocaleString()} / {lvl.nextLevelXp.toLocaleString()} XP</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #6366F1, #818CF8)' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-zinc-500 flex items-center gap-1"><Zap className="w-3 h-3 text-indigo-400" />{profile.xp.toLocaleString()} total</span>
          {profile.currentStreak > 0 && <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">🔥 {profile.currentStreak}d streak</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Users, value: profile.totalCaptures, label: 'Captures' },
          { icon: GridIcon, value: people.length, label: 'Unique' },
          { icon: Calendar, value: todayCount, label: 'Today' },
        ].map(s => (
          <div key={s.label} className="glass p-3 text-center glass-hover">
            <s.icon className="w-4 h-4 text-zinc-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-zinc-100">{s.value}</div>
            <div className="text-[10px] text-zinc-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Camera CTA */}
      <Link href="/camera">
        <motion.div
          className="glass p-6 text-center cursor-pointer relative overflow-hidden glass-hover gradient-border"
          whileTap={{ scale: 0.99 }}
          style={{ borderRadius: 'var(--radius-xl)' }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center relative"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 0 30px rgba(99,102,241,0.15)' }}>
            <Camera className="w-7 h-7 text-indigo-400" />
            <motion.div className="absolute inset-0 rounded-2xl" animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ boxShadow: '0 0 20px rgba(99,102,241,0.3)', borderRadius: 'var(--radius-lg)' }} />
          </div>
          <h2 className="text-base font-semibold text-zinc-100">Start Scanning</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Open camera to detect and collect</p>
          <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-indigo-400">Open Camera <ArrowRight className="w-3 h-3" /></span>
        </motion.div>
      </Link>

      {/* Quest alert */}
      {unclaimed > 0 && (
        <Link href="/quests">
          <motion.div className="glass p-3.5 flex items-center gap-3 cursor-pointer" initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            style={{ borderColor: 'rgba(251,191,36,0.25)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.1)' }}>
              <ScrollText className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1"><div className="text-sm font-medium text-zinc-100">Quest rewards ready</div><div className="text-xs text-amber-400">{unclaimed} to claim</div></div>
            <ArrowRight className="w-4 h-4 text-zinc-600" />
          </motion.div>
        </Link>
      )}

      {/* Recent captures */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300">Recent</h2>
            <Link href="/collection" className="text-xs font-medium text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {recent.map(p => {
              const rarityColors: Record<string, string> = {
                common: '#A1A1AA', uncommon: '#10B981', rare: '#6366F1', epic: '#A855F7',
                legendary: '#F59E0B', mythic: '#EC4899', ultrarare: '#06B6D4', secret: '#FBBF24',
              }
              return (
                <div key={p.id} className="glass overflow-hidden group cursor-pointer glass-hover">
                  <div className="aspect-square" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <img src={p.thumbnailData} alt={p.nickname} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-1.5">
                    <p className="text-[10px] font-medium text-zinc-300 truncate">{p.nickname}</p>
                  </div>
                  <div className="h-0.5" style={{ background: rarityColors[p.rarity] || '#A1A1AA' }} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-2 pb-2">
        <Link href="/achievements" className="glass p-4 flex items-center gap-3 glass-hover">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.1)' }}>
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-200">Achievements</div>
            <div className="text-xs text-zinc-500">{completedAch}/{achievements.length}</div>
          </div>
        </Link>
        <Link href="/stats" className="glass p-4 flex items-center gap-3 glass-hover">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-200">Statistics</div>
            <div className="text-xs text-zinc-500">View insights</div>
          </div>
        </Link>
      </div>
    </div>
  )
}

function GridIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
}