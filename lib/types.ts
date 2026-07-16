// PeopleDex — Core Types

export interface PersonEntry {
  id: string
  nickname: string
  imageData: string // base64 data URL
  thumbnailData: string // smaller base64 for grid
  capturedAt: string // ISO timestamp
  firstSeen: string
  lastSeen: string
  encounterCount: number
  rarity: Rarity
  xp: number
  tags: string[]
  location?: GeoLocation
  sessionId: string
  favorite: boolean
}

export interface GeoLocation {
  latitude: number
  longitude: number
  label?: string
}

export type Rarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'ultrarare'
  | 'secret'

export const RARITY_COLORS: Record<Rarity, { bg: string; text: string; glow: string; label: string }> = {
  common:    { bg: 'bg-gray-500/20',  text: 'text-gray-300',   glow: 'shadow-gray-500/30',   label: 'Common' },
  uncommon:  { bg: 'bg-green-500/20', text: 'text-green-300',  glow: 'shadow-green-500/30',  label: 'Uncommon' },
  rare:      { bg: 'bg-blue-500/20',  text: 'text-blue-300',   glow: 'shadow-blue-500/40',   label: 'Rare' },
  epic:      { bg: 'bg-purple-500/20',text: 'text-purple-300', glow: 'shadow-purple-500/50', label: 'Epic' },
  legendary: { bg: 'bg-orange-500/20',text: 'text-orange-300', glow: 'shadow-orange-500/50', label: 'Legendary' },
  mythic:    { bg: 'bg-pink-500/20',  text: 'text-pink-300',   glow: 'shadow-pink-500/60',   label: 'Mythic' },
  ultrarare: { bg: 'bg-cyan-500/20',  text: 'text-cyan-300',   glow: 'shadow-cyan-500/70',   label: 'Ultra Rare' },
  secret:    { bg: 'bg-yellow-500/20',text: 'text-yellow-300',  glow: 'shadow-yellow-500/80', label: 'Secret' },
}

export const RARITY_WEIGHTS: { rarity: Rarity; weight: number; xpBonus: number }[] = [
  { rarity: 'common',    weight: 450, xpBonus: 10 },
  { rarity: 'uncommon',  weight: 250, xpBonus: 25 },
  { rarity: 'rare',      weight: 150, xpBonus: 50 },
  { rarity: 'epic',      weight: 80,  xpBonus: 100 },
  { rarity: 'legendary', weight: 40,  xpBonus: 200 },
  { rarity: 'mythic',    weight: 20,  xpBonus: 400 },
  { rarity: 'ultrarare', weight: 8,   xpBonus: 800 },
  { rarity: 'secret',    weight: 2,   xpBonus: 2000 },
]

export interface Quest {
  id: string
  title: string
  description: string
  type: QuestType
  target: number
  progress: number
  completed: boolean
  claimed: boolean
  xpReward: number
  expiresAt?: string
  category: 'daily' | 'weekly' | 'special'
}

export type QuestType =
  | 'captures_today'
  | 'capture_color'
  | 'capture_backpack'
  | 'unique_encounters'
  | 'different_locations'
  | 'consecutive_days'
  | 'morning_explorer'
  | 'night_owl'
  | 'weekend_hunter'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  completed: boolean
  claimed: boolean
  xpReward: number
  category: 'captures' | 'collection' | 'exploration' | 'mastery' | 'special'
  tier: 1 | 2 | 3 | 4 | 5
}

export interface PlayerProfile {
  username: string
  avatarEmoji: string
  level: number
  xp: number
  totalCaptures: number
  uniqueCollectibles: number
  currentStreak: number
  longestStreak: number
  lastCaptureDate: string | null
  favoriteId: string | null
  cosmetics: CosmeticUnlocks
}

export interface CosmeticUnlocks {
  cardBackground: string
  cameraFrame: string
  scannerTheme: string
  particleEffect: string
  title: string
  profileBanner: string
}

export interface CaptureSession {
  id: string
  startedAt: string
  endedAt?: string
  captureCount: number
  location?: GeoLocation
}

export interface GameStats {
  capturesByDay: Record<string, number>
  capturesByHour: number[]
  capturesByRarity: Record<Rarity, number>
  locationCount: number
  favoriteTime: number
  totalXpEarned: number
  questsCompleted: number
  achievementsUnlocked: number
}
