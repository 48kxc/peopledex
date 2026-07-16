// PeopleDex — Game Engine: XP, Levels, Rarity, Quests, Achievements

import type { Rarity, Quest, Achievement, PlayerProfile, GameStats, PersonEntry } from './types'
import { RARITY_WEIGHTS } from './types'

// ── Rarity Roll ──
export function rollRarity(): Rarity {
  const totalWeight = RARITY_WEIGHTS.reduce((sum, r) => sum + r.weight, 0)
  let roll = Math.random() * totalWeight
  for (const entry of RARITY_WEIGHTS) {
    roll -= entry.weight
    if (roll <= 0) return entry.rarity
  }
  return 'common'
}

export function getRarityXPBonus(rarity: Rarity): number {
  return RARITY_WEIGHTS.find(r => r.rarity === rarity)?.xpBonus ?? 10
}

// ── XP & Levels ──
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

export function totalXpForLevel(level: number): number {
  let total = 0
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i)
  }
  return total
}

export function levelFromXp(xp: number): { level: number; currentXp: number; nextLevelXp: number } {
  let level = 1
  let remaining = xp
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level++
  }
  return { level, currentXp: remaining, nextLevelXp: xpForLevel(level) }
}

// ── Default Quests ──
export function generateDailyQuests(): Quest[] {
  const today = new Date().toISOString().slice(0, 10)
  return [
    {
      id: `daily-captures-${today}`,
      title: 'Daily Hunter',
      description: 'Capture 5 people today',
      type: 'captures_today',
      target: 5,
      progress: 0,
      completed: false,
      claimed: false,
      xpReward: 100,
      category: 'daily',
    },
    {
      id: `daily-unique-${today}`,
      title: 'Variety Seeker',
      description: 'Capture 3 unique encounters today',
      type: 'unique_encounters',
      target: 3,
      progress: 0,
      completed: false,
      claimed: false,
      xpReward: 150,
      category: 'daily',
    },
    {
      id: `daily-color-${today}`,
      title: 'Color Hunt',
      description: 'Capture someone wearing blue',
      type: 'capture_color',
      target: 1,
      progress: 0,
      completed: false,
      claimed: false,
      xpReward: 75,
      category: 'daily',
    },
  ]
}

export function generateWeeklyQuests(): Quest[] {
  const weekId = getWeekId()
  return [
    {
      id: `weekly-encounters-${weekId}`,
      title: 'Social Butterfly',
      description: 'Collect 25 unique encounters this week',
      type: 'unique_encounters',
      target: 25,
      progress: 0,
      completed: false,
      claimed: false,
      xpReward: 500,
      category: 'weekly',
    },
    {
      id: `weekly-locations-${weekId}`,
      title: 'Explorer',
      description: 'Capture people in 3 different locations',
      type: 'different_locations',
      target: 3,
      progress: 0,
      completed: false,
      claimed: false,
      xpReward: 300,
      category: 'weekly',
    },
    {
      id: `weekly-backpack-${weekId}`,
      title: 'Backpack Spotter',
      description: 'Find someone with a backpack',
      type: 'capture_backpack',
      target: 1,
      progress: 0,
      completed: false,
      claimed: false,
      xpReward: 200,
      category: 'weekly',
    },
  ]
}

function getWeekId(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${week}`
}

// ── Default Achievements ──
export function generateAchievements(): Achievement[] {
  return [
    { id: 'first-capture', title: 'First Capture', description: 'Capture your first person', icon: '📸', completed: false, claimed: false, xpReward: 50, category: 'captures', tier: 1 },
    { id: 'captures-10', title: 'Getting Started', description: 'Capture 10 people', icon: '📷', completed: false, claimed: false, xpReward: 100, category: 'captures', tier: 1 },
    { id: 'captures-100', title: 'Photographer', description: 'Capture 100 people', icon: '📹', completed: false, claimed: false, xpReward: 500, category: 'captures', tier: 2 },
    { id: 'captures-500', title: 'Collector', description: 'Capture 500 people', icon: '🎥', completed: false, claimed: false, xpReward: 2000, category: 'captures', tier: 3 },
    { id: 'captures-1000', title: 'Master Collector', description: 'Capture 1,000 people', icon: '🏆', completed: false, claimed: false, xpReward: 5000, category: 'captures', tier: 4 },
    { id: 'legendary-find', title: 'Legend Hunter', description: 'Capture a Legendary encounter', icon: '⭐', completed: false, claimed: false, xpReward: 300, category: 'collection', tier: 2 },
    { id: 'mythic-find', title: 'Myth Seeker', description: 'Capture a Mythic encounter', icon: '🌟', completed: false, claimed: false, xpReward: 800, category: 'collection', tier: 3 },
    { id: 'secret-find', title: 'Secret Finder', description: 'Capture a Secret rarity encounter', icon: '💎', completed: false, claimed: false, xpReward: 2000, category: 'collection', tier: 5 },
    { id: 'unique-50', title: 'Explorer', description: 'Collect 50 unique people', icon: '🗺️', completed: false, claimed: false, xpReward: 1000, category: 'collection', tier: 3 },
    { id: 'streak-3', title: 'Streak Starter', description: '3-day capture streak', icon: '🔥', completed: false, claimed: false, xpReward: 200, category: 'mastery', tier: 1 },
    { id: 'streak-7', title: 'Dedicated', description: '7-day capture streak', icon: '💪', completed: false, claimed: false, xpReward: 500, category: 'mastery', tier: 2 },
    { id: 'streak-30', title: 'Unstoppable', description: '30-day capture streak', icon: '⚡', completed: false, claimed: false, xpReward: 3000, category: 'mastery', tier: 4 },
    { id: 'level-10', title: 'Rising Star', description: 'Reach level 10', icon: '📈', completed: false, claimed: false, xpReward: 300, category: 'mastery', tier: 2 },
    { id: 'level-50', title: 'Veteran', description: 'Reach level 50', icon: '🎖️', completed: false, claimed: false, xpReward: 2000, category: 'mastery', tier: 4 },
    { id: 'all-rarities', title: 'Completionist', description: 'Capture every rarity type', icon: '🌈', completed: false, claimed: false, xpReward: 5000, category: 'special', tier: 5 },
  ]
}

// ── Quest Progress ──
export function updateQuestProgress(
  quests: Quest[],
  person: PersonEntry,
  allPeople: PersonEntry[],
  profile: PlayerProfile,
): { quests: Quest[]; xpEarned: number } {
  let xpEarned = 0
  const updated = quests.map(q => {
    if (q.completed || q.claimed) return q
    let progress = q.progress
    let completed: boolean = q.completed

    switch (q.type) {
      case 'captures_today': {
        const today = new Date().toISOString().slice(0, 10)
        const todayCaptures = allPeople.filter(p => p.capturedAt.startsWith(today)).length
        progress = todayCaptures
        completed = progress >= q.target
        break
      }
      case 'unique_encounters':
        progress = allPeople.length
        completed = progress >= q.target
        break
      case 'capture_color':
        progress = 1
        completed = true
        break
      case 'capture_backpack':
        if (person.tags.some(t => t.includes('backpack'))) {
          progress = 1
          completed = true
        }
        break
      case 'different_locations': {
        const uniqueLocations = new Set(allPeople.filter(p => p.location).map(p => `${p.location!.latitude},${p.location!.longitude}`))
        progress = uniqueLocations.size
        completed = progress >= q.target
        break
      }
      default:
        break
    }

    if (completed && !q.completed) {
      xpEarned += q.xpReward
    }

    return { ...q, progress, completed }
  })

  return { quests: updated, xpEarned }
}

// ── Achievement Check ──
export function checkAchievements(
  achievements: Achievement[],
  allPeople: PersonEntry[],
  profile: PlayerProfile,
): { achievements: Achievement[]; xpEarned: number } {
  let xpEarned = 0
  const totalCaptures = profile.totalCaptures
  const uniqueCount = allPeople.length
  const allRarities = new Set(allPeople.map(p => p.rarity))

  const updated = achievements.map(a => {
    if (a.completed) return a
    let completed = false

    switch (a.id) {
      case 'first-capture': completed = totalCaptures >= 1; break
      case 'captures-10': completed = totalCaptures >= 10; break
      case 'captures-100': completed = totalCaptures >= 100; break
      case 'captures-500': completed = totalCaptures >= 500; break
      case 'captures-1000': completed = totalCaptures >= 1000; break
      case 'legendary-find': completed = allRarities.has('legendary'); break
      case 'mythic-find': completed = allRarities.has('mythic'); break
      case 'secret-find': completed = allRarities.has('secret'); break
      case 'unique-50': completed = uniqueCount >= 50; break
      case 'streak-3': completed = profile.currentStreak >= 3; break
      case 'streak-7': completed = profile.currentStreak >= 7; break
      case 'streak-30': completed = profile.currentStreak >= 30; break
      case 'level-10': completed = profile.level >= 10; break
      case 'level-50': completed = profile.level >= 50; break
      case 'all-rarities': completed = allRarities.size >= 8; break
    }

    if (completed && !a.completed) {
      xpEarned += a.xpReward
    }

    return { ...a, completed }
  })

  return { achievements: updated, xpEarned }
}

// ── Streak ──
export function calculateStreak(profile: PlayerProfile): { currentStreak: number; longestStreak: number } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (!profile.lastCaptureDate) {
    return { currentStreak: 0, longestStreak: profile.longestStreak }
  }

  const lastCapture = new Date(profile.lastCaptureDate)
  lastCapture.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((today.getTime() - lastCapture.getTime()) / 86400000)

  let currentStreak = profile.currentStreak
  if (diffDays === 0) {
    // already captured today — streak unchanged
  } else if (diffDays === 1) {
    // captured yesterday — streak continues
  } else {
    // missed a day — reset streak
    currentStreak = 0
  }

  return {
    currentStreak,
    longestStreak: Math.max(profile.longestStreak, currentStreak),
  }
}
