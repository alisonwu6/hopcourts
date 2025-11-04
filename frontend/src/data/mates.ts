export type ConnectionStatus = 'none' | 'following' | 'mutual'
export type ActivityStatus = 'playing_now' | 'recently_active' | 'offline'

export interface Mate {
  id: string
  name: string
  avatarUrl?: string
  primarySport: string
  sports: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  distanceKm?: number
  tagline: string
  rating?: number
  gamesPlayed?: number
  mutualConnections?: number
  connectionStatus: ConnectionStatus
  activityStatus: ActivityStatus
  lastActive?: string
  favouriteVenues?: string[]
  availability?: string[]
  upcomingSession?: {
    title: string
    time: string
  }
}

const baseMates: Mate[] = [
  {
    id: 'mate-1',
    name: 'Blue Carter',
    avatarUrl: '/avatars/a1.jpg',
    primarySport: 'basketball',
    sports: ['Basketball', 'Running'],
    skillLevel: 'intermediate',
    distanceKm: 1.2,
    tagline: 'Point guard building weekly pick up crews.',
    rating: 4.9,
    gamesPlayed: 184,
    mutualConnections: 6,
    connectionStatus: 'mutual',
    activityStatus: 'playing_now',
    favouriteVenues: ['South Bank Hoops Centre'],
    availability: ['Mon · 6:30 PM', 'Thu · 7:00 PM'],
    upcomingSession: {
      title: 'Hoops Under The Lights',
      time: 'Tonight · 7:00 PM',
    },
  },
  {
    id: 'mate-2',
    name: 'Zoe Patel',
    avatarUrl: '/avatars/e5.jpg',
    primarySport: 'running',
    sports: ['Running', 'Hiking'],
    skillLevel: 'intermediate',
    distanceKm: 2.8,
    tagline: 'Riverfront pacer with weekend hiking crews.',
    rating: 4.7,
    gamesPlayed: 129,
    mutualConnections: 4,
    connectionStatus: 'following',
    activityStatus: 'recently_active',
    lastActive: 'Active 1h ago',
    favouriteVenues: ['South Bank Running Hub'],
    availability: ['Tue · 6:00 AM', 'Sat · 7:30 AM'],
  },
  {
    id: 'mate-3',
    name: 'Mika Chen',
    avatarUrl: '/avatars/b1.jpg',
    primarySport: 'climbing',
    sports: ['Climbing', 'Pickleball'],
    skillLevel: 'advanced',
    distanceKm: 3.4,
    tagline: 'Lead climber hunting for early morning belay partners.',
    rating: 4.8,
    gamesPlayed: 96,
    mutualConnections: 2,
    connectionStatus: 'none',
    activityStatus: 'offline',
    lastActive: 'Active yesterday',
    favouriteVenues: ['Kangaroo Point Climbing'],
    availability: ['Wed · 6:00 AM', 'Sun · 4:00 PM'],
    upcomingSession: {
      title: 'Sunset Climbing Crew',
      time: 'Wed · 6:00 PM',
    },
  },
  {
    id: 'mate-4',
    name: 'Ivy Tran',
    avatarUrl: '/avatars/b1.jpg',
    primarySport: 'badminton',
    sports: ['Badminton', 'Pickleball'],
    skillLevel: 'advanced',
    distanceKm: 0.9,
    tagline: 'Doubles specialist running fast rotations.',
    rating: 4.9,
    gamesPlayed: 211,
    mutualConnections: 9,
    connectionStatus: 'none',
    activityStatus: 'playing_now',
    favouriteVenues: ['Yeronga Badminton Hub'],
    availability: ['Fri · 7:00 PM', 'Sun · 2:00 PM'],
  },
  {
    id: 'mate-5',
    name: 'Noah Green',
    avatarUrl: '/avatars/f1.jpg',
    primarySport: 'hiking',
    sports: ['Hiking', 'Running'],
    skillLevel: 'intermediate',
    distanceKm: 7.2,
    tagline: 'Trail leader scouting sunrise hikes.',
    rating: 4.6,
    gamesPlayed: 82,
    mutualConnections: 1,
    connectionStatus: 'following',
    activityStatus: 'recently_active',
    lastActive: 'Active 3h ago',
    favouriteVenues: ['Mount Coot-tha Trail Base'],
    availability: ['Sat · 5:30 AM'],
  },
  {
    id: 'mate-6',
    name: 'Jo Rivera',
    avatarUrl: '/avatars/d5.jpg',
    primarySport: 'pickleball',
    sports: ['Pickleball', 'Basketball'],
    skillLevel: 'intermediate',
    distanceKm: 1.7,
    tagline: 'Pickleball league organiser seeking new teams.',
    rating: 4.8,
    gamesPlayed: 158,
    mutualConnections: 3,
    connectionStatus: 'mutual',
    activityStatus: 'recently_active',
    lastActive: 'Active 15m ago',
    favouriteVenues: ['Riverwalk Pickleball Courts'],
    availability: ['Wed · 6:00 PM', 'Fri · 5:30 PM'],
  },
]

export const RECOMMENDED_MATES: Mate[] = baseMates.slice(0, 3)
export const NEARBY_MATES: Mate[] = baseMates.filter((mate) => (mate.distanceKm ?? Infinity) <= 3.5)
export const CONNECTED_MATES: Mate[] = baseMates.filter((mate) => mate.connectionStatus !== 'none')
