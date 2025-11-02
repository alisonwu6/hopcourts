export interface PlayerGame {
  id: string
  title: string
  sport: string
  vibeIcon: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed'
  startTime: Date
  endTime: Date
  location: {
    name: string
    address: string
    city: string
  }
  host: {
    id: string
    name: string
    avatarUrl?: string
    rating?: number
    distanceKm?: number
    level?: string
  }
  highFives: number
  joined: boolean
  attendeeCount: number
  maxAttendees: number
  difficulty: 1 | 2 | 3 | 4 | 5
  isFree: boolean
  price?: number
  priceRange?: string
  description?: string
  participants: Array<{ id: string; name: string; avatarUrl?: string }>
  completedDate?: Date
}

export interface PlayerVenue {
  id: string
  name: string
  type: string
  sport: string
  location: {
    name: string
    address: string
    city: string
  }
  rating: number
  reviewCount: number
  memberCount: number
  gamesThisMonth: number
  amenities: string[]
}

export const PLAYER_MOCK_GAMES: PlayerGame[] = [
  {
    id: 'game-1',
    title: 'Running with Tom',
    sport: 'running',
    vibeIcon: '🏃‍♂️',
    skillLevel: 'intermediate',
    startTime: new Date('2024-12-15T19:00:00'),
    endTime: new Date('2024-12-15T20:30:00'),
    location: {
      name: 'Kangaroo Point Park',
      address: '123 Main St',
      city: 'Brisbane, QLD',
    },
    host: {
      id: 'host-tom',
      name: 'Tom Wilson',
      avatarUrl: '/avatars/a1.jpg',
      rating: 4.8,
      distanceKm: 2.1,
      level: 'Level 4 · Pacer',
    },
    highFives: 12,
    joined: false,
    attendeeCount: 5,
    maxAttendees: 8,
    difficulty: 3,
    isFree: true,
    description: 'Easy run for beginners. Meet at the main entrance.',
    priceRange: 'Free',
    participants: [
      { id: 'user-1', name: 'Alice', avatarUrl: '/avatars/a2.jpg' },
      { id: 'user-2', name: 'Jamie', avatarUrl: '/avatars/a3.jpg' },
      { id: 'user-3', name: 'Leo', avatarUrl: '/avatars/a4.jpg' },
    ],
  },
  {
    id: 'game-2',
    title: 'Sunset Climbing Crew',
    sport: 'climbing',
    vibeIcon: '🧗',
    skillLevel: 'advanced',
    startTime: new Date('2024-12-16T18:00:00'),
    endTime: new Date('2024-12-16T20:00:00'),
    location: {
      name: 'Kangaroo Point Cliffs',
      address: 'River Terrace, Kangaroo Point',
      city: 'Brisbane, QLD',
    },
    host: {
      id: 'host-mika',
      name: 'Mika Chen',
      avatarUrl: '/avatars/b1.jpg',
      rating: 4.9,
      distanceKm: 1.4,
      level: 'Lead climber',
    },
    highFives: 26,
    joined: true,
    attendeeCount: 7,
    maxAttendees: 10,
    difficulty: 4,
    isFree: false,
    price: 25,
    priceRange: '$25 per person',
    description: 'Rope climbs and bouldering circuits with belay checks.',
    participants: [
      { id: 'user-5', name: 'Nina', avatarUrl: '/avatars/b2.jpg' },
      { id: 'user-6', name: 'Omar', avatarUrl: '/avatars/b3.jpg' },
      { id: 'user-7', name: 'Priya', avatarUrl: '/avatars/b4.jpg' },
      { id: 'user-8', name: 'Quinn', avatarUrl: '/avatars/b5.jpg' },
    ],
  },
  {
    id: 'game-3',
    title: 'Morning Tennis Doubles',
    sport: 'tennis',
    vibeIcon: '🎾',
    skillLevel: 'mixed',
    startTime: new Date('2024-11-30T07:30:00'),
    endTime: new Date('2024-11-30T09:00:00'),
    location: {
      name: 'New Farm Tennis Courts',
      address: '15 Brunswick St',
      city: 'New Farm, QLD',
    },
    host: {
      id: 'host-sarah',
      name: 'Sarah Wu',
      avatarUrl: '/avatars/c1.jpg',
      rating: 4.6,
      distanceKm: 3.5,
      level: 'Club captain',
    },
    highFives: 8,
    joined: false,
    attendeeCount: 3,
    maxAttendees: 4,
    difficulty: 2,
    isFree: false,
    price: 12,
    priceRange: '$12 court split',
    description: 'Social doubles, all skill levels welcome.',
    participants: [
      { id: 'user-9', name: 'Ben', avatarUrl: '/avatars/c2.jpg' },
      { id: 'user-10', name: 'Rachel', avatarUrl: '/avatars/c3.jpg' },
      { id: 'user-11', name: 'Liam', avatarUrl: '/avatars/c4.jpg' },
    ],
    completedDate: new Date('2024-11-30T09:00:00'),
  },
]

export const PLAYER_MOCK_VENUES: PlayerVenue[] = [
  {
    id: 'venue-1',
    name: 'Kangaroo Point Climbing',
    type: 'climbing',
    sport: 'Climbing',
    location: {
      name: 'Kangaroo Point Climbing',
      address: '123 Main Street',
      city: 'Brisbane, QLD 4169',
    },
    rating: 4.8,
    reviewCount: 23,
    memberCount: 230,
    gamesThisMonth: 15,
    amenities: ['Belay Certification', 'Rental Equipment', 'Locker Rooms', 'Café'],
  },
  {
    id: 'venue-2',
    name: 'South Bank Running Hub',
    type: 'running',
    sport: 'Running',
    location: {
      name: 'South Bank Parklands',
      address: 'Stanley St Plaza',
      city: 'Brisbane, QLD',
    },
    rating: 4.6,
    reviewCount: 18,
    memberCount: 185,
    gamesThisMonth: 22,
    amenities: ['Secure Lockers', 'Showers', 'Parking', 'Refill Station'],
  },
  {
    id: 'venue-3',
    name: 'River City Tennis',
    type: 'tennis',
    sport: 'Tennis',
    location: {
      name: 'Milton Tennis Centre',
      address: '67 Frew St',
      city: 'Milton, QLD',
    },
    rating: 4.7,
    reviewCount: 31,
    memberCount: 210,
    gamesThisMonth: 18,
    amenities: ['Court Hire', 'Coaching', 'Clubhouse', 'Pro Shop'],
  },
]
