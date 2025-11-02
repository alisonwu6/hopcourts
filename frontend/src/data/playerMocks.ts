export interface PlayerGame {
  id: string
  title: string
  sport: string
  startTime: Date
  endTime: Date
  location: {
    name: string
    address: string
    city: string
  }
  hostName: string
  hostRating?: number
  hostGamesCount?: number
  attendeeCount: number
  maxAttendees: number
  difficulty: 1 | 2 | 3 | 4 | 5
  isFree: boolean
  price?: number
  description?: string
  attendees?: Array<{ id: string; name: string }>
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
    startTime: new Date('2024-12-15T19:00:00'),
    endTime: new Date('2024-12-15T20:30:00'),
    location: {
      name: 'Kangaroo Point Park',
      address: '123 Main St',
      city: 'Brisbane, QLD',
    },
    hostName: 'Tom Wilson',
    hostRating: 4.8,
    hostGamesCount: 12,
    attendeeCount: 5,
    maxAttendees: 8,
    difficulty: 3,
    isFree: true,
    description: 'Easy run for beginners. Meet at the main entrance.',
    attendees: [
      { id: 'user-1', name: 'Alice' },
      { id: 'user-2', name: 'Jamie' },
      { id: 'user-3', name: 'Leo' },
    ],
  },
  {
    id: 'game-2',
    title: 'Sunset Climbing Crew',
    sport: 'climbing',
    startTime: new Date('2024-12-16T18:00:00'),
    endTime: new Date('2024-12-16T20:00:00'),
    location: {
      name: 'Kangaroo Point Cliffs',
      address: 'River Terrace, Kangaroo Point',
      city: 'Brisbane, QLD',
    },
    hostName: 'Mika Chen',
    hostRating: 4.9,
    hostGamesCount: 21,
    attendeeCount: 7,
    maxAttendees: 10,
    difficulty: 4,
    isFree: false,
    price: 25,
    description: 'Rope climbs and bouldering circuits with belay checks.',
  },
  {
    id: 'game-3',
    title: 'Morning Tennis Doubles',
    sport: 'tennis',
    startTime: new Date('2024-11-30T07:30:00'),
    endTime: new Date('2024-11-30T09:00:00'),
    location: {
      name: 'New Farm Tennis Courts',
      address: '15 Brunswick St',
      city: 'New Farm, QLD',
    },
    hostName: 'Sarah Wu',
    hostRating: 4.6,
    hostGamesCount: 15,
    attendeeCount: 3,
    maxAttendees: 4,
    difficulty: 2,
    isFree: false,
    price: 12,
    description: 'Social doubles, all skill levels welcome.',
    attendees: [
      { id: 'user-4', name: 'Ben' },
      { id: 'user-5', name: 'Rachel' },
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
