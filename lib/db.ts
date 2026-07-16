// PeopleDex — IndexedDB Storage Layer

import { openDB, type IDBPDatabase } from 'idb'
import type { PersonEntry, PlayerProfile, CaptureSession, Achievement, Quest, GameStats } from './types'

const DB_NAME = 'peopledex'
const DB_VERSION = 2
const PROFILE_KEY = 'player1'

// Default profile data (must be defined before getDB for upgrade handler)
const defaultProfileData: PlayerProfile = {
  username: 'Explorer',
  avatarEmoji: '🔍',
  level: 1,
  xp: 0,
  totalCaptures: 0,
  uniqueCollectibles: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastCaptureDate: null,
  favoriteId: null,
  cosmetics: {
    cardBackground: 'default',
    cameraFrame: 'default',
    scannerTheme: 'default',
    particleEffect: 'default',
    title: 'Beginner',
    profileBanner: 'default',
  },
}

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        if (!db.objectStoreNames.contains('people')) {
          db.createObjectStore('people', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' })
        } else if (oldVersion < 2) {
          db.deleteObjectStore('profile')
          db.createObjectStore('profile', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('achievements')) {
          db.createObjectStore('achievements', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('quests')) {
          db.createObjectStore('quests', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats')
        }
      },
    })
  }
  return dbPromise
}

// ── People ──
export async function savePerson(entry: PersonEntry): Promise<void> {
  const db = await getDB()
  await db.put('people', entry)
}

export async function getAllPeople(): Promise<PersonEntry[]> {
  const db = await getDB()
  return db.getAll('people')
}

export async function getPerson(id: string): Promise<PersonEntry | undefined> {
  const db = await getDB()
  return db.get('people', id)
}

export async function deletePerson(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('people', id)
}

export async function clearAllPeople(): Promise<void> {
  const db = await getDB()
  await db.clear('people')
}

// ── Profile ──
export async function getProfile(): Promise<PlayerProfile> {
  const db = await getDB()
  const stored = await db.get('profile', PROFILE_KEY)
  if (stored) {
    const { id, ...profile } = stored
    return profile as PlayerProfile
  }
  const profile = { ...defaultProfileData }
  await db.put('profile', { id: PROFILE_KEY, ...profile })
  return profile
}

export async function updateProfile(updates: Partial<PlayerProfile>): Promise<PlayerProfile> {
  const db = await getDB()
  const current = await getProfile()
  const updated = { ...current, ...updates }
  await db.put('profile', { id: PROFILE_KEY, ...updated })
  return updated
}

// ── Sessions ──
export async function saveSession(session: CaptureSession): Promise<void> {
  const db = await getDB()
  await db.put('sessions', session)
}

export async function getSessions(): Promise<CaptureSession[]> {
  const db = await getDB()
  return db.getAll('sessions')
}

// ── Achievements ──
export async function getAchievements(): Promise<Achievement[]> {
  const db = await getDB()
  return db.getAll('achievements')
}

export async function saveAchievements(achievements: Achievement[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('achievements', 'readwrite')
  await Promise.all([...achievements.map(a => tx.store.put(a)), tx.done])
}

// ── Quests ──
export async function getQuests(): Promise<Quest[]> {
  const db = await getDB()
  return db.getAll('quests')
}

export async function saveQuests(quests: Quest[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('quests', 'readwrite')
  await Promise.all([...quests.map(q => tx.store.put(q)), tx.done])
}

// ── Stats ──
export async function getStats(): Promise<GameStats> {
  const db = await getDB()
  const stats = await db.get('stats', 'current')
  if (stats) return stats
  const defaultStats: GameStats = {
    capturesByDay: {},
    capturesByHour: new Array(24).fill(0),
    capturesByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0, ultrarare: 0, secret: 0 },
    locationCount: 0,
    favoriteTime: 0,
    totalXpEarned: 0,
    questsCompleted: 0,
    achievementsUnlocked: 0,
  }
  await db.put('stats', defaultStats, 'current')
  return defaultStats
}

export async function updateStats(updates: Partial<GameStats>): Promise<GameStats> {
  const db = await getDB()
  const current = await getStats()
  const updated = { ...current, ...updates }
  await db.put('stats', updated, 'current')
  return updated
}
