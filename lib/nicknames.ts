// PeopleDex — Generated Nickname System

const ADJECTIVES = [
  'Blue', 'Red', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Pink', 'Orange', 'Gray',
  'Tall', 'Short', 'Fast', 'Slow', 'Quiet', 'Loud', 'Happy', 'Chill', 'Busy', 'Sleepy',
  'Mystery', 'Shadow', 'Golden', 'Silver', 'Cosmic', 'Neon', 'Urban', 'Retro', 'Vintage', 'Modern',
  'Fancy', 'Casual', 'Sporty', 'Classic', 'Electric', 'Magnetic', 'Quantum', 'Pixel', 'Turbo', 'Zen',
]

const NOUNS = [
  'Hoodie', 'Backpack', 'Runner', 'Skater', 'Coffee', 'Student', 'Worker', 'Traveler',
  'Jogger', 'Walker', 'Reader', 'Cyclist', 'Shopper', 'Tourist', 'Artist', 'Musician',
  'Gamer', 'Coder', 'Teacher', 'Builder', 'Driver', 'Rider', 'Dancer', 'Thinker',
  'Explorer', 'Dreamer', 'Captain', 'Pilot', 'Chef', 'Guardian', 'Watcher', 'Stranger',
  'Umbrella', 'Sunglasses', 'Headphones', 'Sneakers', 'Jacket', 'Beanie', 'Scarf', 'Bag',
  'DogWalker', 'ParkGoer', 'GymRat', 'Bookworm', 'Foodie', 'Hiker', 'Camper', 'Surfer',
  'SkaterKid', 'BikeMessenger', 'StreetArtist', 'MarketShopper', 'PatioDiner', 'WindowShopper',
]

const TITLES = [
  'Person', 'Individual', 'Encounter', 'Sighting', 'Fellow', 'Citizen', 'Wanderer', 'Roamer',
]

export function generateNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  return `${adj} ${noun}`
}

export function generateTag(clothing?: string, context?: string): string[] {
  const tags: string[] = []
  if (clothing) tags.push(clothing.toLowerCase())
  if (context) tags.push(context.toLowerCase())
  // random extra tag
  const extras = ['outdoor', 'indoor', 'morning', 'afternoon', 'evening', 'weekend', 'weekday']
  tags.push(extras[Math.floor(Math.random() * extras.length)])
  return [...new Set(tags)]
}

const LOCATION_LABELS: Record<string, string> = {
  coffee: '☕ Coffee Shop',
  library: '📚 Library',
  park: '🌳 Park',
  airport: '✈️ Airport',
  mall: '🛍️ Mall',
  gym: '💪 Gym',
  office: '🏢 Office',
  school: '🏫 School',
  restaurant: '🍽️ Restaurant',
  beach: '🏖️ Beach',
  downtown: '🏙️ Downtown',
  station: '🚉 Station',
  default: '📍 Unknown Location',
}

export function guessLocationLabel(lat: number, lng: number): string {
  // In a real app, use reverse geocoding. For now, return generic.
  return LOCATION_LABELS.default
}
