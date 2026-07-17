'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePeopleDex } from '@/lib/peopledex-context'
import { CheckCircle2, Gift, Send, X, Loader2, AlertCircle, Sparkles, Lock, LockOpen, Trash2 } from 'lucide-react'
import type { PersonEntry } from '@/lib/types'

const ICONS: Record<string,string> = { daily:'📅', weekly:'📆', special:'🎯', visual:'🎨' }

interface AIQuest {
  id: string
  title: string
  description: string
  type: string
  xpReward: number
  completed: boolean
  claimed: boolean
  progress: number
  target: number
  category: string
}

export default function QuestsPage() {
  const { quests, claimQuest, people, profile, setProfile } = usePeopleDex()
  const [aiQuests, setAiQuests] = useState<AIQuest[]>([])
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set())
  const [generating, setGenerating] = useState(false)
  const [submittingQuest, setSubmittingQuest] = useState<any | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<PersonEntry | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyAnswer, setVerifyAnswer] = useState<'YES' | 'NO' | null>(null)

  const active = quests.filter(q => !q.claimed).sort((a,b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0))
  const done = quests.filter(q => q.claimed)
  const aiDone = aiQuests.filter(q => q.claimed)
  const totalXp = done.reduce((s,q) => s + q.xpReward, 0) + aiDone.reduce((s,q) => s + q.xpReward, 0)

  const toggleLock = (id: string) => {
    setLockedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const removeQuest = (id: string) => {
    setAiQuests(prev => prev.filter(q => q.id !== id))
    setLockedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const clearUnlocked = () => {
    setAiQuests(prev => prev.filter(q => lockedIds.has(q.id) || q.claimed))
  }

  const generateQuests = async () => {
    setGenerating(true)
    try {
      const r = await fetch('/api/generate-quests', { method: 'POST' })
      const d = await r.json()
      if (d.quests?.length) {
        const newQuests: AIQuest[] = d.quests.map((q: any, i: number) => ({
          id: `ai-${Date.now()}-${i}`,
          title: q.title,
          description: q.description,
          type: q.type || 'visual',
          xpReward: q.xpReward || 150,
          completed: false,
          claimed: false,
          progress: 0,
          target: 1,
          category: 'special',
        }))
        setAiQuests(prev => [...newQuests, ...prev])
      }
    } catch {}
    setGenerating(false)
  }

  const handleSubmitQuest = async () => {
    if (!submittingQuest || !selectedPhoto) return
    setVerifying(true)
    setVerifyAnswer(null)
    try {
      const r = await fetch('/api/verify-quest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedPhoto.imageData,
          questTitle: submittingQuest.title,
          questDescription: submittingQuest.description,
          questType: submittingQuest.type || 'visual',
        }),
      })
      const d = await r.json()
      setVerifyAnswer(d.answer || 'NO')
    } catch { setVerifyAnswer('NO') }
    setVerifying(false)
  }

  const completeAiQuest = () => {
    if (!submittingQuest) return
    setAiQuests(prev => prev.map(q => q.id === submittingQuest.id ? { ...q, completed: true } : q))
    setLockedIds(prev => { const next = new Set(prev); next.delete(submittingQuest.id); return next })
    setSubmittingQuest(null); setSelectedPhoto(null); setVerifyAnswer(null)
  }

  const claimAiQuest = (id: string) => {
    const q = aiQuests.find(q => q.id === id)
    if (!q || !profile) return
    setProfile({ xp: profile.xp + q.xpReward, level: Math.floor(Math.log2((profile.xp + q.xpReward) / 100 + 1)) + 1 })
    setAiQuests(prev => prev.map(x => x.id === id ? { ...x, claimed: true } : x))
    setLockedIds(prev => { const next = new Set(prev); next.delete(id); return next })
  }

  const closeSubmit = () => { setSubmittingQuest(null); setSelectedPhoto(null); setVerifyAnswer(null) }

  const unclaimedAi = aiQuests.filter(q => !q.claimed)
  const unlockedUnclaimed = unclaimedAi.filter(q => !lockedIds.has(q.id))
  const allActive = [...unclaimedAi.filter(q => lockedIds.has(q.id) || q.completed), ...unclaimedAi.filter(q => !lockedIds.has(q.id) && !q.completed), ...active]

  return (
    <div className="screen-shell space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow mb-4">Field notes / active prompts</p>
          <h1 className="screen-title">Your <em>next move.</em></h1>
          <p className="mt-4 text-sm text-[#92988a]">Complete small observations. Turn them into momentum.</p>
        </div>
        <div className="flex items-center gap-1.5">
          {unlockedUnclaimed.length > 0 && (
            <button
              onClick={clearUnlocked}
              className="px-2.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', color: '#FCA5A5' }}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={generateQuests}
            disabled={generating}
            className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#C7D2FE' }}
          >
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Generate
          </button>
        </div>
      </div>

      <div className="glass p-4 flex items-center justify-between">
        <div>
          <div className="text-xl font-bold text-zinc-100">
            {done.length + aiDone.length}
            <span className="text-sm font-normal text-zinc-600"> / {quests.length + aiQuests.length}</span>
          </div>
          <div className="text-xs text-zinc-500">Completed</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-zinc-100">{totalXp.toLocaleString()}</div>
          <div className="text-xs text-zinc-500">XP earned</div>
        </div>
      </div>

      {lockedIds.size > 0 && (
        <div className="flex items-center gap-2">
          <Lock className="w-3 h-3 text-amber-400" />
          <span className="text-xs text-zinc-500">{lockedIds.size} quest{lockedIds.size !== 1 ? 's' : ''} locked</span>
        </div>
      )}

      {allActive.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <span className="text-xl">🎉</span>
          </div>
          <p className="text-sm font-medium text-zinc-200">All done!</p>
          <p className="text-xs text-zinc-500 mt-0.5">Generate new quests or check back later</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allActive.map(q => {
            const isAi = q.id.startsWith('ai-')
            const isLocked = lockedIds.has(q.id)
            return (
              <motion.div
                key={q.id}
                className={`glass p-4 ${q.completed ? 'gradient-border' : ''} ${isLocked ? '' : ''}`}
                style={q.completed ? { borderRadius: 'var(--radius-xl)' } : isLocked ? { borderColor: 'rgba(251,191,36,0.3)' } : {}}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{ICONS[q.category] || '🎯'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-zinc-100">{q.title}</h3>
                      {isLocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                      {q.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      {isAi && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: 'rgba(99,102,241,0.15)', color: '#C7D2FE' }}>AI</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{q.description}</p>

                    {!isAi && (q.type === 'captures_today' || q.type === 'unique_encounters' || q.type === 'different_locations') ? (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: q.completed ? '#F59E0B' : '#6366F1' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((q.progress/q.target)*100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-medium">{q.progress}/{q.target}</span>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => setSubmittingQuest(q)}
                          className="text-xs font-semibold text-indigo-400 flex items-center gap-1 hover:text-indigo-300 cursor-pointer"
                        >
                          <Send className="w-3 h-3" /> Submit photo
                        </button>
                        {isAi && !q.completed && (
                          <button
                            onClick={() => toggleLock(q.id)}
                            className="text-[10px] font-medium flex items-center gap-0.5 cursor-pointer transition-colors"
                            style={{ color: isLocked ? '#FBBF24' : '#52525B' }}
                          >
                            {isLocked ? <><Lock className="w-2.5 h-2.5" /> Locked</> : <><LockOpen className="w-2.5 h-2.5" /> Lock</>}
                          </button>
                        )}
                        {isAi && !q.completed && !isLocked && (
                          <button
                            onClick={() => removeQuest(q.id)}
                            className="text-[10px] font-medium text-zinc-600 hover:text-red-400 flex items-center gap-0.5 cursor-pointer transition-colors"
                          >
                            <X className="w-2.5 h-2.5" /> Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-zinc-200">+{q.xpReward} XP</span>
                    {q.completed && !q.claimed ? (
                      <motion.button
                        onClick={() => isAi ? claimAiQuest(q.id) : claimQuest(q.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="mt-1.5 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)', color: '#FBBF24' }}
                      >
                        <Gift className="w-3 h-3" /> Claim
                      </motion.button>
                    ) : q.completed && q.claimed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1.5 ml-auto" />
                    ) : null}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Submit modal */}
      <AnimatePresence>
        {submittingQuest && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center pb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSubmit} />
            <motion.div
              className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
              style={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
              initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">{submittingQuest.title}</h3>
                  <p className="text-xs text-zinc-500">{submittingQuest.description}</p>
                </div>
                <button onClick={closeSubmit} className="cursor-pointer"><X className="w-5 h-5 text-zinc-500" /></button>
              </div>
              {!selectedPhoto ? (
                <div className="flex-1 overflow-y-auto p-4">
                  <p className="text-xs text-zinc-500 mb-3">Pick a photo from your collection:</p>
                  {people.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-8">No photos yet. Capture some first!</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {people.map(p => (
                        <button
                          key={p.id} onClick={() => setSelectedPhoto(p)}
                          className="aspect-square rounded-xl overflow-hidden cursor-pointer transition-all"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '2px solid transparent' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                        >
                          <img src={p.thumbnailData} alt={p.nickname} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <img src={selectedPhoto.thumbnailData} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-100">{selectedPhoto.nickname}</div>
                      <button onClick={() => setSelectedPhoto(null)} className="text-xs text-indigo-400 cursor-pointer">Change</button>
                    </div>
                  </div>
                  {verifyAnswer === null ? (
                    <button
                      onClick={handleSubmitQuest}
                      disabled={verifying}
                      className="w-full py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      style={{ background: 'rgba(99,102,241,0.8)' }}
                    >
                      {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</> : <><Send className="w-4 h-4" /> Submit for Verification</>}
                    </button>
                  ) : verifyAnswer === 'YES' ? (
                    <div className="rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <div className="flex items-center gap-2 text-emerald-400 mb-2"><CheckCircle2 className="w-5 h-5" /><span className="text-sm font-bold">Quest completed!</span></div>
                      <p className="text-xs text-zinc-400 mb-3">AI confirms this photo satisfies the quest.</p>
                      <button onClick={completeAiQuest}
                        className="w-full py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        style={{ background: 'rgba(16,185,129,0.8)' }}>
                        <Gift className="w-4 h-4" /> Complete & Claim +{submittingQuest.xpReward} XP
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div className="flex items-center gap-2 text-red-400 mb-2"><AlertCircle className="w-5 h-5" /><span className="text-sm font-bold">Not a match</span></div>
                      <p className="text-xs text-zinc-400 mb-3">AI doesn't see the required element. Try another photo.</p>
                      <button onClick={() => { setSelectedPhoto(null); setVerifyAnswer(null) }}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
                        style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>Try another</button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {(done.length > 0 || aiDone.length > 0) && (
        <div>
          <h2 className="text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-2">Completed</h2>
          <div className="space-y-1">
            {done.map(q => (
              <div key={q.id} className="flex items-center gap-2 px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-3 h-3 text-zinc-700" />
                <span className="text-xs text-zinc-500">{q.title}</span>
                <span className="text-[10px] text-zinc-700 ml-auto">+{q.xpReward} XP</span>
              </div>
            ))}
            {aiDone.map(q => (
              <div key={q.id} className="flex items-center gap-2 px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-3 h-3 text-zinc-700" />
                <span className="text-xs text-zinc-500">{q.title}</span>
                <span className="text-[10px] text-zinc-700 ml-auto">+{q.xpReward} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
