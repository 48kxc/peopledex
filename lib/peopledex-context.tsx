'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { PersonEntry, PlayerProfile, Quest, Achievement, GameStats, CaptureSession } from './types'
import * as db from './db'
import { rollRarity, getRarityXPBonus, xpForLevel, levelFromXp, generateDailyQuests, generateWeeklyQuests, generateAchievements, updateQuestProgress, checkAchievements, calculateStreak } from './game-engine'
import { generateNickname, generateTag } from './nicknames'

interface PeopleDexContextValue {
  profile: PlayerProfile | null
  people: PersonEntry[]
  quests: Quest[]
  achievements: Achievement[]
  stats: GameStats | null
  xpPopup: { amount: number; key: number } | null
  rarityReveal: { rarity: PersonEntry['rarity']; key: number } | null
  capturePerson: (imageData: string, thumbnailData: string, tags?: string[], location?: { latitude: number; longitude: number }) => Promise<PersonEntry>
  deletePerson: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  claimQuest: (questId: string) => Promise<void>
  claimAchievement: (achievementId: string) => Promise<void>
  refreshData: () => Promise<void>
  setProfile: (updates: Partial<PlayerProfile>) => Promise<void>
  setXpPopup: (popup: { amount: number; key: number } | null) => void
  setRarityReveal: (reveal: { rarity: PersonEntry['rarity']; key: number } | null) => void
}

const PeopleDexContext = createContext<PeopleDexContextValue | null>(null)

export function PeopleDexProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<PlayerProfile | null>(null)
  const [people, setPeople] = useState<PersonEntry[]>([])
  const [quests, setQuests] = useState<Quest[]>([])
  const [achievements, setAchievementsState] = useState<Achievement[]>([])
  const [stats, setStats] = useState<GameStats | null>(null)
  const [xpPopup, setXpPopup] = useState<{ amount: number; key: number } | null>(null)
  const [rarityReveal, setRarityReveal] = useState<{ rarity: PersonEntry['rarity']; key: number } | null>(null)

  const refreshData = useCallback(async () => {
    const [p, peeps, q, a, s] = await Promise.all([
      db.getProfile(),
      db.getAllPeople(),
      db.getQuests(),
      db.getAchievements(),
      db.getStats(),
    ])

    // Generate default quests if none exist
    let questsData = q
    if (questsData.length === 0) {
      questsData = [...generateDailyQuests(), ...generateWeeklyQuests()]
      await db.saveQuests(questsData)
    }

    // Generate default achievements if none
    let achievementsData = a
    if (achievementsData.length === 0) {
      achievementsData = generateAchievements()
      await db.saveAchievements(achievementsData)
    }

    // Check streak
    const streaks = calculateStreak(p)
    if (streaks.currentStreak !== p.currentStreak || streaks.longestStreak !== p.longestStreak) {
      const updatedP = { ...p, ...streaks }
      await db.updateProfile(updatedP)
      setProfileState(updatedP)
    } else {
      setProfileState(p)
    }

    setPeople(peeps)
    setQuests(questsData)
    setAchievementsState(achievementsData)
    setStats(s)
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const setProfile = async (updates: Partial<PlayerProfile>) => {
    const updated = await db.updateProfile(updates)
    setProfileState(updated)
  }

  const capturePerson = async (
    imageData: string,
    thumbnailData: string,
    tags?: string[],
    location?: { latitude: number; longitude: number },
  ): Promise<PersonEntry> => {
    const now = new Date().toISOString()
    const rarity = rollRarity()
    const xpBonus = getRarityXPBonus(rarity)
    const nickname = generateNickname()
    const entryTags = tags || generateTag()

    const entry: PersonEntry = {
      id: `person-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      nickname,
      imageData,
      thumbnailData,
      capturedAt: now,
      firstSeen: now,
      lastSeen: now,
      encounterCount: 1,
      rarity,
      xp: xpBonus,
      tags: entryTags,
      location: location ? { latitude: location.latitude, longitude: location.longitude } : undefined,
      sessionId: 'current',
      favorite: false,
    }

    await db.savePerson(entry)

    // Update profile
    const currentProfile = profile || await db.getProfile()
    const today = now.slice(0, 10)
    const totalXp = currentProfile.xp + xpBonus
    const { level } = levelFromXp(totalXp)

    let streak = currentProfile.currentStreak
    if (!currentProfile.lastCaptureDate || currentProfile.lastCaptureDate.slice(0, 10) !== today) {
      streak += 1
    }

    const updatedProfile = await db.updateProfile({
      xp: totalXp,
      level,
      totalCaptures: currentProfile.totalCaptures + 1,
      uniqueCollectibles: (await db.getAllPeople()).length,
      lastCaptureDate: now,
      currentStreak: streak,
      longestStreak: Math.max(currentProfile.longestStreak, streak),
    })
    setProfileState(updatedProfile)

    // Update stats
    const currentStats = stats || await db.getStats()
    const dayKey = today
    const capturesByDay = { ...currentStats.capturesByDay }
    capturesByDay[dayKey] = (capturesByDay[dayKey] || 0) + 1
    const hour = new Date().getHours()
    const capturesByHour = [...currentStats.capturesByHour]
    capturesByHour[hour] = (capturesByHour[hour] || 0) + 1
    const capturesByRarity = { ...currentStats.capturesByRarity }
    capturesByRarity[rarity] = (capturesByRarity[rarity] || 0) + 1
    const uniqueLocs = new Set(people.filter(p => p.location).map(p => `${p.location!.latitude},${p.location!.longitude}`))
    if (location) uniqueLocs.add(`${location.latitude},${location.longitude}`)

    const updatedStats = await db.updateStats({
      capturesByDay,
      capturesByHour,
      capturesByRarity,
      locationCount: uniqueLocs.size,
      totalXpEarned: currentStats.totalXpEarned + xpBonus,
    })
    setStats(updatedStats)

    // Quest progress
    const allPeople = [...people, entry]
    const questResult = updateQuestProgress(quests, entry, allPeople, updatedProfile)
    await db.saveQuests(questResult.quests)
    setQuests(questResult.quests)

    // Achievement check
    const achResult = checkAchievements(achievements, allPeople, updatedProfile)
    await db.saveAchievements(achResult.achievements)
    setAchievementsState(achResult.achievements)

    // Update people list
    setPeople(allPeople)

    // XP popup
    setXpPopup({ amount: xpBonus + questResult.xpEarned + achResult.xpEarned, key: Date.now() })
    setRarityReveal({ rarity, key: Date.now() })

    return entry
  }

  const deletePerson = async (id: string) => {
    await db.deletePerson(id)
    setPeople(prev => prev.filter(p => p.id !== id))
    if (profile) {
      await db.updateProfile({ uniqueCollectibles: (await db.getAllPeople()).length })
    }
  }

  const toggleFavorite = async (id: string) => {
    const person = await db.getPerson(id)
    if (person) {
      person.favorite = !person.favorite
      await db.savePerson(person)
      setPeople(prev => prev.map(p => p.id === id ? person : p))
    }
  }

  const claimQuest = async (questId: string) => {
    const updated = quests.map(q => q.id === questId ? { ...q, claimed: true } : q)
    await db.saveQuests(updated)
    setQuests(updated)

    const quest = quests.find(q => q.id === questId)
    if (quest && profile) {
      const newXp = profile.xp + quest.xpReward
      const { level } = levelFromXp(newXp)
      await db.updateProfile({ xp: newXp, level })
      setProfileState(prev => prev ? { ...prev, xp: newXp, level } : prev)
      setXpPopup({ amount: quest.xpReward, key: Date.now() })
    }
  }

  const claimAchievement = async (achievementId: string) => {
    const updated = achievements.map(a => a.id === achievementId ? { ...a, claimed: true } : a)
    await db.saveAchievements(updated)
    setAchievementsState(updated)

    const ach = achievements.find(a => a.id === achievementId)
    if (ach && profile) {
      const newXp = profile.xp + ach.xpReward
      const { level } = levelFromXp(newXp)
      await db.updateProfile({ xp: newXp, level })
      setProfileState(prev => prev ? { ...prev, xp: newXp, level } : prev)
      setXpPopup({ amount: ach.xpReward, key: Date.now() })

      const s = stats || await db.getStats()
      const newStats = await db.updateStats({ achievementsUnlocked: s.achievementsUnlocked + 1 })
      setStats(newStats)
    }
  }

  return (
    <PeopleDexContext.Provider
      value={{
        profile,
        people,
        quests,
        achievements,
        stats,
        xpPopup,
        rarityReveal,
        capturePerson,
        deletePerson,
        toggleFavorite,
        claimQuest,
        claimAchievement,
        refreshData,
        setProfile,
        setXpPopup,
        setRarityReveal,
      }}
    >
      {children}
    </PeopleDexContext.Provider>
  )
}

export function usePeopleDex() {
  const ctx = useContext(PeopleDexContext)
  if (!ctx) throw new Error('usePeopleDex must be used within PeopleDexProvider')
  return ctx
}
