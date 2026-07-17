'use client'

import { motion } from 'framer-motion'
import { usePeopleDex } from '@/lib/peopledex-context'
import { levelFromXp } from '@/lib/game-engine'
import Link from 'next/link'
import { ArrowUpRight, Camera, Calendar, Grid3X3, ScanLine, ScrollText, Trophy, Users, Zap } from 'lucide-react'

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
    <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
      <header className="mb-10 flex items-start justify-between gap-5">
        <div>
          <p className="eyebrow mb-3">Personal field guide / 01</p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-[-0.06em] text-[#f4f1e8] sm:text-5xl">Catalog the people<br /><span className="text-[#d8f36a]">who shape your day.</span></h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[#92988a]">A private, playful archive of the encounters worth remembering. No facial recognition — just your eye, your story, your collection.</p>
        </div>
        <Link href="/profile" className="group hidden shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-[#1b1f19] px-3 py-2.5 sm:flex">
          <span className="text-2xl">{profile.avatarEmoji}</span><span className="text-left"><span className="block text-xs font-bold text-[#f4f1e8]">{profile.username}</span><span className="mono block text-[10px] text-[#92988a]">LVL {profile.level}</span></span><ArrowUpRight className="h-4 w-4 text-[#92988a] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <Link href="/camera" className="group relative min-h-[280px] overflow-hidden rounded-[1.6rem] border border-[#d8f36a]/30 bg-[#20261b] p-6 sm:p-8">
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-[#d8f36a]/10 blur-3xl transition-transform duration-700 group-hover:scale-125" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between"><span className="eyebrow">Live capture</span><ScanLine className="h-5 w-5 text-[#d8f36a]" /></div>
            <div><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d8f36a] text-[#111310] shadow-[0_12px_30px_rgba(216,243,106,.18)] transition-transform group-hover:rotate-6"><Camera className="h-7 w-7" /></div><h2 className="text-2xl font-bold tracking-[-0.04em] text-[#f4f1e8]">Add a new person</h2><p className="mt-1 text-sm text-[#aeb5a4]">Open the camera and make today a little more memorable.</p></div>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-[#d8f36a]">Start scanning <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
          </div>
        </Link>

        <div className="glass p-6 sm:p-7"><div className="flex items-center justify-between"><span className="eyebrow !text-[#92988a]">Current level</span><Zap className="h-4 w-4 text-[#f19a62]" /></div><div className="mt-6 flex items-end justify-between"><span className="text-5xl font-bold tracking-[-0.08em] text-[#f4f1e8]">{profile.level}</span><span className="mono pb-1 text-xs text-[#92988a]">{profile.xp.toLocaleString()} XP</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[.08]"><motion.div className="h-full rounded-full bg-[#d8f36a]" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: .8, ease: 'easeOut' }} /></div><div className="mt-2 flex justify-between mono text-[10px] text-[#92988a]"><span>{lvl.currentXp.toLocaleString()} in level</span><span>{lvl.nextLevelXp.toLocaleString()} goal</span></div>{profile.currentStreak > 0 && <div className="mt-6 border-t border-white/10 pt-4 text-xs font-semibold text-[#f19a62]">🔥 {profile.currentStreak} day field streak</div>}</div>
      </section>

      <section className="mt-4 grid grid-cols-3 gap-3">
        {[{ icon: Users, value: profile.totalCaptures, label: 'captures' }, { icon: Grid3X3, value: people.length, label: 'unique people' }, { icon: Calendar, value: todayCount, label: 'logged today' }].map(({ icon: Icon, value, label }) => <div key={label} className="glass glass-hover p-4 sm:p-5"><Icon className="mb-4 h-4 w-4 text-[#92988a]" /><div className="text-2xl font-bold tracking-[-0.05em] text-[#f4f1e8] sm:text-3xl">{value}</div><div className="mono mt-1 text-[10px] uppercase tracking-[.08em] text-[#92988a]">{label}</div></div>)}
      </section>

      {unclaimed > 0 && <Link href="/quests" className="mt-4 flex items-center gap-4 rounded-2xl border border-[#f19a62]/30 bg-[#2a211b] p-4 transition-colors hover:bg-[#32261e]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f19a62]/15"><ScrollText className="h-5 w-5 text-[#f19a62]" /></div><div className="flex-1"><div className="text-sm font-bold text-[#f4f1e8]">Field notes ready to claim</div><div className="mono mt-1 text-[10px] uppercase tracking-wider text-[#f19a62]">{unclaimed} reward{unclaimed === 1 ? '' : 's'} waiting</div></div><ArrowUpRight className="h-4 w-4 text-[#f19a62]" /></Link>}

      {recent.length > 0 && <section className="mt-12"><div className="mb-4 flex items-end justify-between"><div><p className="eyebrow !text-[#92988a]">Latest entries</p><h2 className="mt-1 text-2xl font-bold tracking-[-0.05em] text-[#f4f1e8]">Your recent encounters</h2></div><Link href="/collection" className="mono flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#d8f36a]">View archive <ArrowUpRight className="h-3 w-3" /></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{recent.map((p, i) => <Link key={p.id} href="/collection" className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#1a1d18]"><div className="aspect-[4/5] overflow-hidden bg-[#242921]"><img src={p.thumbnailData} alt={p.nickname} className="h-full w-full object-cover grayscale-[.15] transition duration-500 group-hover:scale-105 group-hover:grayscale-0" /></div><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#111310] via-[#111310]/85 to-transparent p-3 pt-10"><div className="mono text-[9px] text-[#d8f36a]">ENTRY 0{i + 1}</div><p className="mt-1 truncate text-sm font-bold text-[#f4f1e8]">{p.nickname}</p></div></Link>)}</div></section>}

      <section className="mt-12 grid gap-3 pb-3 sm:grid-cols-2"><Link href="/achievements" className="glass glass-hover flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f19a62]/10"><Trophy className="h-5 w-5 text-[#f19a62]" /></div><div className="flex-1"><p className="text-sm font-bold text-[#f4f1e8]">Milestones</p><p className="mono mt-1 text-[10px] uppercase tracking-wider text-[#92988a]">{completedAch}/{achievements.length} unlocked</p></div><ArrowUpRight className="h-4 w-4 text-[#92988a]" /></Link><Link href="/stats" className="glass glass-hover flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8fc7ff]/10"><Grid3X3 className="h-5 w-5 text-[#8fc7ff]" /></div><div className="flex-1"><p className="text-sm font-bold text-[#f4f1e8]">Collection health</p><p className="mono mt-1 text-[10px] uppercase tracking-wider text-[#92988a]">View your patterns</p></div><ArrowUpRight className="h-4 w-4 text-[#92988a]" /></Link></section>
    </div>
  )
}
