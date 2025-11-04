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
  detail?: {
    description?: string
    lookingFor?: {
      skillLevel?: string
      vibe?: string
      notes?: string
    }
    rules?: {
      duration?: string
      courtType?: string
      equipment?: string
      rotation?: string
    }
    hideParticipants?: boolean
  }
}

export interface PlayerVenue {
  id: string
  name: string
  type: string
  sports: string[]
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
    id: 'game-basketball-1',
    title: 'Hoops Under The Lights',
    sport: 'basketball',
    vibeIcon: '🏀',
    skillLevel: 'mixed',
    startTime: new Date('2024-12-12T19:00:00'),
    endTime: new Date('2024-12-12T20:30:00'),
    location: {
      name: 'South Bank Community Courts',
      address: '45 Grey St',
      city: 'Brisbane, QLD',
    },
    host: {
      id: 'host-blue',
      name: 'Blue Carter',
      avatarUrl: '/avatars/a1.jpg',
      rating: 4.9,
      distanceKm: 1.2,
      level: 'Level 5 · Floor general',
    },
    highFives: 22,
    joined: true,
    attendeeCount: 8,
    maxAttendees: 10,
    difficulty: 3,
    isFree: true,
    description: 'Half-court scrimmage with rotating lineups and music.',
    priceRange: 'Free',
    participants: [
      { id: 'user-amy', name: 'Amy', avatarUrl: '/avatars/a2.jpg' },
      { id: 'user-jay', name: 'Jay', avatarUrl: '/avatars/a3.jpg' },
      { id: 'user-luc', name: 'Lucas', avatarUrl: '/avatars/a4.jpg' },
    ],
    detail: {
      description:
        'Half-court scrimmage with rotating lineups and music. Fast-paced and fun! Perfect for improving your court awareness.',
      lookingFor: {
        skillLevel: 'Intermediate to Advanced',
        vibe: 'Competitive but friendly',
        notes: 'Bring your own water bottle and reversible jersey if you have one.',
      },
      rules: {
        duration: '90 minutes total',
        courtType: 'Half-court with rotation every 20 minutes',
        equipment: 'Balls provided, bring your own towel',
        rotation: 'Teams rotate every 4 points or 20 minutes',
      },
    },
  },
  {
    id: 'game-basketball-2',
    title: 'Sunday Morning Full Court',
    sport: 'basketball',
    vibeIcon: '🏀',
    skillLevel: 'intermediate',
    startTime: new Date('2024-12-15T09:00:00'),
    endTime: new Date('2024-12-15T11:00:00'),
    location: {
      name: 'Holland Park Sports Centre',
      address: '289 Logan Rd',
      city: 'Greenslopes, QLD',
    },
    host: {
      id: 'host-sarah',
      name: 'Sarah Wu',
      avatarUrl: '/avatars/c1.jpg',
      rating: 4.6,
      distanceKm: 3.4,
      level: 'Level 4 · Point guard',
    },
    highFives: 15,
    joined: false,
    attendeeCount: 9,
    maxAttendees: 12,
    difficulty: 4,
    isFree: false,
    price: 8,
    priceRange: '$8 court share',
    description: 'Full court run with scoreboard and refereed rotations.',
    participants: [
      { id: 'user-ben', name: 'Ben', avatarUrl: '/avatars/c2.jpg' },
      { id: 'user-rachel', name: 'Rachel', avatarUrl: '/avatars/c3.jpg' },
      { id: 'user-liam', name: 'Liam', avatarUrl: '/avatars/c4.jpg' },
    ],
  },
  {
    id: 'game-badminton-1',
    title: 'Badminton Social Doubles',
    sport: 'badminton',
    vibeIcon: '🏸',
    skillLevel: 'beginner',
    startTime: new Date('2024-12-13T18:30:00'),
    endTime: new Date('2024-12-13T20:00:00'),
    location: {
      name: 'Yeronga Community Centre',
      address: '120 School Rd',
      city: 'Yeronga, QLD',
    },
    host: {
      id: 'host-ivy',
      name: 'Ivy Tran',
      avatarUrl: '/avatars/b1.jpg',
      rating: 4.7,
      distanceKm: 4.1,
      level: 'Level 3 · Rally builder',
    },
    highFives: 9,
    joined: false,
    attendeeCount: 10,
    maxAttendees: 16,
    difficulty: 2,
    isFree: false,
    price: 6,
    priceRange: '$6 shuttle split',
    description: 'Rotating doubles with coach-led warm-up drills.',
    participants: [
      { id: 'user-nina', name: 'Nina', avatarUrl: '/avatars/b2.jpg' },
      { id: 'user-omar', name: 'Omar', avatarUrl: '/avatars/b3.jpg' },
      { id: 'user-priya', name: 'Priya', avatarUrl: '/avatars/b4.jpg' },
    ],
    detail: {
      description:
        'Coach-led warm up drills followed by social doubles rotation. Perfect for players getting comfortable with net play.',
      lookingFor: {
        skillLevel: 'Beginner or developing intermediates',
        vibe: 'Supportive and social',
        notes: 'Loaner rackets available on request.',
      },
      rules: {
        duration: '90 minutes',
        courtType: 'Indoor doubles courts',
        equipment: 'Shuttles provided, bring indoor shoes',
      },
    },
  },
  {
    id: 'game-badminton-2',
    title: 'Smash Night Challenge',
    sport: 'badminton',
    vibeIcon: '🏸',
    skillLevel: 'advanced',
    startTime: new Date('2024-12-17T19:30:00'),
    endTime: new Date('2024-12-17T21:30:00'),
    location: {
      name: 'Sunnybank Sports Hall',
      address: '50 Station Rd',
      city: 'Sunnybank, QLD',
    },
    host: {
      id: 'host-leo',
      name: 'Leo Martin',
      avatarUrl: '/avatars/d1.jpg',
      rating: 4.9,
      distanceKm: 6.2,
      level: 'Level 5 · Smash specialist',
    },
    highFives: 28,
    joined: true,
    attendeeCount: 12,
    maxAttendees: 14,
    difficulty: 4,
    isFree: false,
    price: 10,
    priceRange: '$10 tournament entry',
    description: 'Bracket-style games with rotating partners each round.',
    participants: [
      { id: 'user-quinn', name: 'Quinn', avatarUrl: '/avatars/b5.jpg' },
      { id: 'user-sam', name: 'Sam', avatarUrl: '/avatars/c5.jpg' },
      { id: 'user-tara', name: 'Tara', avatarUrl: '/avatars/c6.jpg' },
    ],
    completedDate: new Date('2024-12-17T21:30:00'),
  },
  {
    id: 'game-pickleball-1',
    title: 'Riverwalk Pickleball Rally',
    sport: 'pickleball',
    vibeIcon: '🏓',
    skillLevel: 'beginner',
    startTime: new Date('2024-12-14T17:30:00'),
    endTime: new Date('2024-12-14T19:00:00'),
    location: {
      name: 'New Farm Pickleball Courts',
      address: '82 Griffith St',
      city: 'New Farm, QLD',
    },
    host: {
      id: 'host-maggie',
      name: 'Maggie Lin',
      avatarUrl: '/avatars/maggie.jpg',
      rating: 4.8,
      distanceKm: 2.7,
      level: 'Level 4 · Paddle coach',
    },
    highFives: 18,
    joined: true,
    attendeeCount: 12,
    maxAttendees: 16,
    difficulty: 2,
    isFree: true,
    description: 'Intro clinic followed by friendly king-of-the-court games.',
    priceRange: 'Free',
    participants: [
      { id: 'user-una', name: 'Una', avatarUrl: '/avatars/d2.jpg' },
      { id: 'user-vic', name: 'Victor', avatarUrl: '/avatars/d3.jpg' },
      { id: 'user-wes', name: 'Wes', avatarUrl: '/avatars/d4.jpg' },
    ],
  },
  {
    id: 'game-pickleball-2',
    title: 'Pickleball League Night',
    sport: 'pickleball',
    vibeIcon: '🏓',
    skillLevel: 'intermediate',
    startTime: new Date('2024-12-18T18:00:00'),
    endTime: new Date('2024-12-18T20:00:00'),
    location: {
      name: 'West End Paddle Club',
      address: '14 Riverside Dr',
      city: 'West End, QLD',
    },
    host: {
      id: 'host-jo',
      name: 'Jo Rivera',
      avatarUrl: '/avatars/d5.jpg',
      rating: 4.7,
      distanceKm: 5.5,
      level: 'Level 4 · Spin server',
    },
    highFives: 20,
    joined: false,
    attendeeCount: 14,
    maxAttendees: 18,
    difficulty: 3,
    isFree: false,
    price: 12,
    priceRange: '$12 league fee',
    description: 'Round-robin ladders with standings tracked weekly.',
    participants: [
      { id: 'user-xiu', name: 'Xiu', avatarUrl: '/avatars/d6.jpg' },
      { id: 'user-yara', name: 'Yara', avatarUrl: '/avatars/d7.jpg' },
      { id: 'user-zane', name: 'Zane', avatarUrl: '/avatars/d8.jpg' },
    ],
  },
  {
    id: 'game-climbing-1',
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
    detail: {
      description:
        'Evening lead climbs and bouldering circuits with certified belays. Routes set for a solid challenge and progression.',
      lookingFor: {
        skillLevel: 'Advanced lead climbers',
        vibe: 'Focused and safety-first',
        notes: 'Belay certifications checked on arrival.',
      },
      rules: {
        duration: '120 minutes',
        courtType: 'Outdoor cliff lines',
        equipment: 'Bring harness, shoes, chalk; ropes provided',
      },
    },
  },
  {
    id: 'game-climbing-2',
    title: 'Beginner Belay Basics',
    sport: 'climbing',
    vibeIcon: '🧗',
    skillLevel: 'beginner',
    startTime: new Date('2024-12-19T17:00:00'),
    endTime: new Date('2024-12-19T19:00:00'),
    location: {
      name: 'Skyreach Indoor Climbing',
      address: '609 Brunswick St',
      city: 'New Farm, QLD',
    },
    host: {
      id: 'host-ella',
      name: 'Ella Brooks',
      avatarUrl: '/avatars/e1.jpg',
      rating: 4.8,
      distanceKm: 3.1,
      level: 'Level 3 · Route setter',
    },
    highFives: 14,
    joined: false,
    attendeeCount: 6,
    maxAttendees: 12,
    difficulty: 2,
    isFree: false,
    price: 30,
    priceRange: '$30 incl. gear hire',
    description: 'Harness fitting, belay instruction, and intro climbs.',
    participants: [
      { id: 'user-isa', name: 'Isa', avatarUrl: '/avatars/e2.jpg' },
      { id: 'user-jules', name: 'Jules', avatarUrl: '/avatars/e3.jpg' },
      { id: 'user-kai', name: 'Kai', avatarUrl: '/avatars/e4.jpg' },
    ],
  },
  {
    id: 'game-running-1',
    title: 'Tempo Run Tuesday',
    sport: 'running',
    vibeIcon: '🏃',
    skillLevel: 'intermediate',
    startTime: new Date('2024-12-17T06:00:00'),
    endTime: new Date('2024-12-17T07:15:00'),
    location: {
      name: 'New Farm Park Loop',
      address: '1040 Brunswick St',
      city: 'New Farm, QLD',
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
    description: 'Tempo intervals with pacing groups and cool-down stretch.',
    priceRange: 'Free',
    participants: [
      { id: 'user-alice', name: 'Alice', avatarUrl: '/avatars/a2.jpg' },
      { id: 'user-jamie', name: 'Jamie', avatarUrl: '/avatars/a3.jpg' },
      { id: 'user-leo', name: 'Leo', avatarUrl: '/avatars/a4.jpg' },
    ],
    detail: {
      description:
        'Tempo intervals along the river loop with restorative stretch at the end. Two pace groups available.',
      lookingFor: {
        skillLevel: 'Comfortable with 5:00–5:30 pace',
        vibe: 'Encouraging and consistent',
        notes: 'Meet by the park fountain, lights recommended.',
      },
      rules: {
        duration: '75 minutes including warm up',
        courtType: 'River loop path',
        equipment: 'Bring hydration and reflective gear',
      },
      hideParticipants: true,
    },
  },
  {
    id: 'game-running-2',
    title: 'Friday Night Shakeout',
    sport: 'running',
    vibeIcon: '🏃',
    skillLevel: 'beginner',
    startTime: new Date('2024-12-20T18:30:00'),
    endTime: new Date('2024-12-20T19:30:00'),
    location: {
      name: 'South Bank Riverwalk',
      address: 'Stanley St Plaza',
      city: 'South Brisbane, QLD',
    },
    host: {
      id: 'host-zoe',
      name: 'Zoe Patel',
      avatarUrl: '/avatars/e5.jpg',
      rating: 4.5,
      distanceKm: 1.8,
      level: 'Level 3 · Community guide',
    },
    highFives: 7,
    joined: true,
    attendeeCount: 11,
    maxAttendees: 20,
    difficulty: 1,
    isFree: true,
    description: 'Easy riverside shakeout with optional gelato cooldown.',
    priceRange: 'Free',
    participants: [
      { id: 'user-max', name: 'Max', avatarUrl: '/avatars/e6.jpg' },
      { id: 'user-nora', name: 'Nora', avatarUrl: '/avatars/e7.jpg' },
      { id: 'user-owen', name: 'Owen', avatarUrl: '/avatars/e8.jpg' },
    ],
  },
  {
    id: 'game-hiking-1',
    title: 'Mount Coot-tha Sunrise Hike',
    sport: 'hiking',
    vibeIcon: '🥾',
    skillLevel: 'beginner',
    startTime: new Date('2024-12-21T05:45:00'),
    endTime: new Date('2024-12-21T08:15:00'),
    location: {
      name: 'JC Slaughter Falls Trailhead',
      address: '600 Mount Coot-tha Rd',
      city: 'Toowong, QLD',
    },
    host: {
      id: 'host-noah',
      name: 'Noah Green',
      avatarUrl: '/avatars/f1.jpg',
      rating: 4.7,
      distanceKm: 8.4,
      level: 'Level 3 · Trail scout',
    },
    highFives: 19,
    joined: true,
    attendeeCount: 14,
    maxAttendees: 18,
    difficulty: 2,
    isFree: true,
    description: 'Sunrise hike with photo stops and mindfulness breathing.',
    priceRange: 'Free',
    participants: [
      { id: 'user-pia', name: 'Pia', avatarUrl: '/avatars/f2.jpg' },
      { id: 'user-raul', name: 'Raul', avatarUrl: '/avatars/f3.jpg' },
      { id: 'user-sia', name: 'Sia', avatarUrl: '/avatars/f4.jpg' },
    ],
    detail: {
      description:
        'Catch sunrise from the summit and enjoy a relaxed descent with a mindfulness cooldown halfway.',
      lookingFor: {
        skillLevel: 'Beginner hikers comfortable with inclines',
        vibe: 'Community focused and supportive',
        notes: 'Pack a light snack and plenty of water.',
      },
      rules: {
        duration: '150 minutes including breaks',
        courtType: 'National park trail',
        equipment: 'Trail shoes recommended, poles optional',
      },
    },
  },
  {
    id: 'game-hiking-2',
    title: 'Glass House Mountain Trek',
    sport: 'hiking',
    vibeIcon: '🥾',
    skillLevel: 'advanced',
    startTime: new Date('2024-12-22T07:00:00'),
    endTime: new Date('2024-12-22T11:00:00'),
    location: {
      name: 'Mount Tibrogargan Carpark',
      address: 'Tibrogargan Access Rd',
      city: 'Glass House Mountains, QLD',
    },
    host: {
      id: 'host-riley',
      name: 'Riley Stone',
      avatarUrl: '/avatars/f5.jpg',
      rating: 4.9,
      distanceKm: 52.0,
      level: 'Level 5 · Trail leader',
    },
    highFives: 24,
    joined: false,
    attendeeCount: 9,
    maxAttendees: 12,
    difficulty: 5,
    isFree: false,
    price: 18,
    priceRange: '$18 transport share',
    description: 'Challenging summit push with scramble sections and safety brief.',
    participants: [
      { id: 'user-tess', name: 'Tess', avatarUrl: '/avatars/f6.jpg' },
      { id: 'user-ugo', name: 'Ugo', avatarUrl: '/avatars/f7.jpg' },
      { id: 'user-via', name: 'Via', avatarUrl: '/avatars/f8.jpg' },
    ],
  },
]

export const PLAYER_MOCK_VENUES: PlayerVenue[] = [
  {
    id: 'venue-basketball-1',
    name: 'South Bank Hoops Centre',
    type: 'court',
    sports: ['Basketball'],
    location: {
      name: 'South Bank Hoops Centre',
      address: '45 Grey St',
      city: 'Brisbane, QLD 4101',
    },
    rating: 4.8,
    reviewCount: 42,
    memberCount: 320,
    gamesThisMonth: 28,
    amenities: ['Court Hire', 'Scoreboard', 'Change Rooms', 'Juice Bar'],
  },
  {
    id: 'venue-badminton-1',
    name: 'Yeronga Badminton Hub',
    type: 'indoor',
    sports: ['Badminton', 'Pickleball'],
    location: {
      name: 'Yeronga Community Centre',
      address: '120 School Rd',
      city: 'Yeronga, QLD',
    },
    rating: 4.6,
    reviewCount: 33,
    memberCount: 210,
    gamesThisMonth: 24,
    amenities: ['Stringing Service', 'Pro Shop', 'Cafe', 'Parking'],
  },
  {
    id: 'venue-pickleball-1',
    name: 'Riverwalk Pickleball Courts',
    type: 'court',
    sports: ['Pickleball'],
    location: {
      name: 'New Farm Pickleball Courts',
      address: '82 Griffith St',
      city: 'New Farm, QLD',
    },
    rating: 4.7,
    reviewCount: 27,
    memberCount: 185,
    gamesThisMonth: 26,
    amenities: ['Paddle Rentals', 'Drills Clinic', 'Shade Seating', 'Water Station'],
  },
  {
    id: 'venue-climbing-1',
    name: 'Kangaroo Point Climbing',
    type: 'outdoor',
    sports: ['Climbing', 'Bouldering'],
    location: {
      name: 'Kangaroo Point Cliffs',
      address: 'River Terrace',
      city: 'Brisbane, QLD 4169',
    },
    rating: 4.9,
    reviewCount: 29,
    memberCount: 250,
    gamesThisMonth: 18,
    amenities: ['Belay Certification', 'Gear Rental', 'Guided Sessions', 'Cafe'],
  },
  {
    id: 'venue-running-1',
    name: 'South Bank Running Hub',
    type: 'outdoor',
    sports: ['Running', 'Stretching'],
    location: {
      name: 'South Bank Parklands',
      address: 'Stanley St Plaza',
      city: 'Brisbane, QLD',
    },
    rating: 4.6,
    reviewCount: 36,
    memberCount: 285,
    gamesThisMonth: 32,
    amenities: ['Secure Lockers', 'Showers', 'Pace Groups', 'Refill Station'],
  },
  {
    id: 'venue-hiking-1',
    name: 'Mount Coot-tha Trail Base',
    type: 'outdoor',
    sports: ['Hiking'],
    location: {
      name: 'JC Slaughter Falls',
      address: '600 Mount Coot-tha Rd',
      city: 'Toowong, QLD',
    },
    rating: 4.8,
    reviewCount: 40,
    memberCount: 190,
    gamesThisMonth: 14,
    amenities: ['Trail Maps', 'Guided Walks', 'Parking', 'Coffee Cart'],
  },
]
