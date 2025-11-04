import { ApiResponse, CreateGameInput, PaginatedResponse, Game, GameFilter } from '@/types'

const mockGames: Game[] = [
  {
    id: 'game-basketball-1',
    title: 'Hoops Under The Lights',
    description: 'Half-court scrimmage with rotating lineups and music.',
    sport: 'Basketball',
    difficulty: 3,
    skillLevel: 'mixed',
    hostId: 'host-blue',
    hostName: 'Blue Carter',
    hostRating: 4.9,
    hostAvatar: '/avatars/a1.jpg',
    venueId: 'venue-basketball-1',
    location: {
      lat: -27.474,
      lng: 153.0235,
      address: 'South Bank Hoops Centre, Brisbane',
    },
    startTime: new Date('2024-12-12T19:00:00'),
    endTime: new Date('2024-12-12T20:30:00'),
    duration: 90,
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      daysOfWeek: [4],
    },
    maxAttendees: 10,
    attendees: ['user-amy', 'user-jay', 'user-luc'],
    attendeeCount: 3,
    tags: ['#Social', '#MixedLevels'],
    isFree: true,
    pricePerPerson: 0,
    currency: 'AUD',
    energy: 84,
    status: 'published',
    likedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    requiresApproval: false,
  },
  {
    id: 'game-basketball-2',
    title: 'Sunday Morning Full Court',
    description: 'Full court run with scoreboard and refereed rotations.',
    sport: 'Basketball',
    difficulty: 4,
    skillLevel: 'intermediate',
    hostId: 'host-sarah',
    hostName: 'Sarah Wu',
    hostRating: 4.6,
    hostAvatar: '/avatars/c1.jpg',
    venueId: 'venue-basketball-1',
    location: {
      lat: -27.5121,
      lng: 153.0582,
      address: 'Holland Park Sports Centre, Brisbane',
    },
    startTime: new Date('2024-12-15T09:00:00'),
    endTime: new Date('2024-12-15T11:00:00'),
    duration: 120,
    isRecurring: false,
    maxAttendees: 12,
    attendees: ['user-ben', 'user-rachel'],
    attendeeCount: 2,
    tags: ['#Competitive', '#HighEnergy'],
    isFree: false,
    pricePerPerson: 8,
    currency: 'AUD',
    energy: 90,
    status: 'published',
    likedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    requiresApproval: false,
  },
  {
    id: 'game-badminton-1',
    title: 'Badminton Social Doubles',
    description: 'Rotating doubles with coach-led warm-up drills.',
    sport: 'Badminton',
    difficulty: 2,
    skillLevel: 'beginner',
    hostId: 'host-ivy',
    hostName: 'Ivy Tran',
    hostRating: 4.7,
    hostAvatar: '/avatars/b1.jpg',
    venueId: 'venue-badminton-1',
    location: {
      lat: -27.5178,
      lng: 153.0205,
      address: 'Yeronga Community Centre, Brisbane',
    },
    startTime: new Date('2024-12-13T18:30:00'),
    endTime: new Date('2024-12-13T20:00:00'),
    duration: 90,
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      daysOfWeek: [5],
    },
    maxAttendees: 16,
    attendees: ['user-nina', 'user-omar', 'user-priya'],
    attendeeCount: 3,
    tags: ['#Indoor', '#Friendly'],
    isFree: false,
    pricePerPerson: 6,
    currency: 'AUD',
    energy: 70,
    status: 'published',
    likedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    requiresApproval: false,
  },
  {
    id: 'game-badminton-2',
    title: 'Smash Night Challenge',
    description: 'Bracket-style matches with rotating partners each round.',
    sport: 'Badminton',
    difficulty: 4,
    skillLevel: 'advanced',
    hostId: 'host-leo',
    hostName: 'Leo Martin',
    hostRating: 4.9,
    hostAvatar: '/avatars/d1.jpg',
    venueId: 'venue-badminton-1',
    location: {
      lat: -27.5682,
      lng: 153.0504,
      address: 'Sunnybank Sports Hall, Brisbane',
    },
    startTime: new Date('2024-12-17T19:30:00'),
    endTime: new Date('2024-12-17T21:30:00'),
    duration: 120,
    isRecurring: false,
    maxAttendees: 14,
    attendees: ['user-quinn', 'user-sam', 'user-tara'],
    attendeeCount: 3,
    tags: ['#Tournament', '#PowerPlays'],
    isFree: false,
    pricePerPerson: 10,
    currency: 'AUD',
    energy: 92,
    status: 'published',
    likedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    requiresApproval: false,
  },
  {
    id: 'game-pickleball-1',
    title: 'Riverwalk Pickleball Rally',
    description: 'Intro clinic followed by friendly king-of-the-court games.',
    sport: 'Pickleball',
    difficulty: 2,
    skillLevel: 'beginner',
    hostId: 'host-maggie',
    hostName: 'Maggie Lin',
    hostRating: 4.8,
    hostAvatar: '/avatars/maggie.jpg',
    venueId: 'venue-pickleball-1',
    location: {
      lat: -27.4679,
      lng: 153.0456,
      address: 'New Farm Pickleball Courts, Brisbane',
    },
    startTime: new Date('2024-12-14T17:30:00'),
    endTime: new Date('2024-12-14T19:00:00'),
    duration: 90,
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      daysOfWeek: [6],
    },
    maxAttendees: 16,
    attendees: ['user-una', 'user-vic', 'user-wes'],
    attendeeCount: 3,
    tags: ['#Social', '#NewPlayers'],
    isFree: true,
    pricePerPerson: 0,
    currency: 'AUD',
    energy: 76,
    status: 'published',
    likedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    requiresApproval: false,
  },
  {
    id: 'game-pickleball-2',
    title: 'Pickleball League Night',
    description: 'Round-robin ladders with standings tracked weekly.',
    sport: 'Pickleball',
    difficulty: 3,
    skillLevel: 'intermediate',
    hostId: 'host-jo',
    hostName: 'Jo Rivera',
    hostRating: 4.7,
    hostAvatar: '/avatars/d5.jpg',
    venueId: 'venue-pickleball-1',
    location: {
      lat: -27.4802,
      lng: 153.0123,
      address: 'West End Paddle Club, Brisbane',
    },
    startTime: new Date('2024-12-18T18:00:00'),
    endTime: new Date('2024-12-18T20:00:00'),
    duration: 120,
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      daysOfWeek: [3],
    },
    maxAttendees: 18,
    attendees: ['user-xiu', 'user-yara', 'user-zane'],
    attendeeCount: 3,
    tags: ['#League', '#PaddlePower'],
    isFree: false,
    pricePerPerson: 12,
    currency: 'AUD',
    energy: 82,
    status: 'published',
    likedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    requiresApproval: false,
  },
  {
    id: 'game-climbing-1',
    title: 'Sunset Climbing Crew',
    description: 'Rope climbs and bouldering circuits with belay checks.',
    sport: 'Climbing',
    difficulty: 4,
    skillLevel: 'advanced',
    hostId: 'host-mika',
    hostName: 'Mika Chen',
    hostRating: 4.9,
    hostAvatar: '/avatars/b1.jpg',
    venueId: 'venue-climbing-1',
    location: {
      lat: -27.4713,
      lng: 153.0341,
      address: 'Kangaroo Point Cliffs, Brisbane',
    },
    startTime: new Date('2024-12-16T18:00:00'),
    endTime: new Date('2024-12-16T20:00:00'),
    duration: 120,
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      daysOfWeek: [1, 4],
    },
    maxAttendees: 10,
    attendees: ['user-5', 'user-6', 'user-7', 'user-8'],
    attendeeCount: 4,
    tags: ['#BelayCheck', '#Outdoor'],
    isFree: false,
    pricePerPerson: 25,
    currency: 'AUD',
    energy: 95,
    status: 'published',
    likedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    requiresApproval: false,
  },
  {
    id: 'game-climbing-2',
    title: 'Beginner Belay Basics',
    description: 'Harness fitting, belay instruction, and intro climbs.',
    sport: 'Climbing',
    difficulty: 2,
    skillLevel: 'beginner',
    hostId: 'host-ella',
    hostName: 'Ella Brooks',
    hostRating: 4.8,
    hostAvatar: '/avatars/e1.jpg',
    venueId: 'venue-climbing-1',
    location: {
      lat: -27.467,
      lng: 153.0378,
      address: 'Skyreach Indoor Climbing, Brisbane',
    },
    startTime: new Date('2024-12-19T17:00:00'),
    endTime: new Date('2024-12-19T19:00:00'),
    duration: 120,
    isRecurring: false,
    maxAttendees: 12,
    attendees: ['user-isa', 'user-jules', 'user-kai'],
    attendeeCount: 3,
    tags: ['#Intro', '#GearIncluded'],
    isFree: false,
    pricePerPerson: 30,
    currency: 'AUD',
    energy: 68,
    status: 'published',
    likedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    requiresApproval: false,
  },
  {
    id: 'game-running-1',
    title: 'Tempo Run Tuesday',
    description: 'Tempo intervals with pacing groups and cool-down stretch.',
    sport: 'Running',
    difficulty: 3,
    skillLevel: 'intermediate',
    hostId: 'host-tom',
    hostName: 'Tom Wilson',
    hostRating: 4.8,
    hostAvatar: '/avatars/a1.jpg',
    venueId: 'venue-running-1',
    location: {
      lat: -27.4682,
      lng: 153.0447,
      address: 'New Farm Park Loop, Brisbane',
    },
    startTime: new Date('2024-12-17T06:00:00'),
    endTime: new Date('2024-12-17T07:15:00'),
    duration: 75,
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      daysOfWeek: [2],
    },
    maxAttendees: 8,
    attendees: ['user-alice', 'user-jamie', 'user-leo'],
    attendeeCount: 3,
    tags: ['#Tempo', '#GroupPace'],
    isFree: true,
    pricePerPerson: 0,
    currency: 'AUD',
    energy: 72,
    status: 'published',
    likedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    requiresApproval: false,
  },
  {
    id: 'game-running-2',
    title: 'Friday Night Shakeout',
    description: 'Easy riverside shakeout with optional gelato cooldown.',
    sport: 'Running',
    difficulty: 1,
    skillLevel: 'beginner',
    hostId: 'host-zoe',
    hostName: 'Zoe Patel',
    hostRating: 4.5,
    hostAvatar: '/avatars/e5.jpg',
    venueId: 'venue-running-1',
    location: {
      lat: -27.4817,
      lng: 153.023,
      address: 'South Bank Riverwalk, Brisbane',
    },
    startTime: new Date('2024-12-20T18:30:00'),
    endTime: new Date('2024-12-20T19:30:00'),
    duration: 60,
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      daysOfWeek: [5],
    },
    maxAttendees: 20,
    attendees: ['user-max', 'user-nora', 'user-owen'],
    attendeeCount: 3,
    tags: ['#Social', '#EasyPace'],
    isFree: true,
    pricePerPerson: 0,
    currency: 'AUD',
    energy: 60,
    status: 'published',
    likedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    requiresApproval: false,
  },
  {
    id: 'game-hiking-1',
    title: 'Mount Coot-tha Sunrise Hike',
    description: 'Sunrise hike with photo stops and mindfulness breathing.',
    sport: 'Hiking',
    difficulty: 2,
    skillLevel: 'beginner',
    hostId: 'host-noah',
    hostName: 'Noah Green',
    hostRating: 4.7,
    hostAvatar: '/avatars/f1.jpg',
    venueId: 'venue-hiking-1',
    location: {
      lat: -27.4839,
      lng: 152.9649,
      address: 'JC Slaughter Falls Trailhead, Brisbane',
    },
    startTime: new Date('2024-12-21T05:45:00'),
    endTime: new Date('2024-12-21T08:15:00'),
    duration: 150,
    isRecurring: false,
    maxAttendees: 18,
    attendees: ['user-pia', 'user-raul', 'user-sia'],
    attendeeCount: 3,
    tags: ['#Sunrise', '#TrailFriends'],
    isFree: true,
    pricePerPerson: 0,
    currency: 'AUD',
    energy: 78,
    status: 'published',
    likedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    requiresApproval: false,
  },
  {
    id: 'game-hiking-2',
    title: 'Glass House Mountain Trek',
    description: 'Challenging summit push with scramble sections and safety brief.',
    sport: 'Hiking',
    difficulty: 5,
    skillLevel: 'advanced',
    hostId: 'host-riley',
    hostName: 'Riley Stone',
    hostRating: 4.9,
    hostAvatar: '/avatars/f5.jpg',
    venueId: 'venue-hiking-1',
    location: {
      lat: -26.8995,
      lng: 152.9561,
      address: 'Mount Tibrogargan Trailhead, Glass House Mountains',
    },
    startTime: new Date('2024-12-22T07:00:00'),
    endTime: new Date('2024-12-22T11:00:00'),
    duration: 240,
    isRecurring: false,
    maxAttendees: 12,
    attendees: ['user-tess', 'user-ugo', 'user-via'],
    attendeeCount: 3,
    tags: ['#Adventure', '#Carpool'],
    isFree: false,
    pricePerPerson: 18,
    currency: 'AUD',
    energy: 88,
    status: 'published',
    likedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    requiresApproval: false,
  },
]

const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const gamesService = {
  async getGames(filters?: GameFilter): Promise<ApiResponse<PaginatedResponse<Game>>> {
    await simulateDelay(500)

    let results = [...mockGames]

    if (filters?.sport) {
      results = results.filter((game) => game.sport.toLowerCase() === filters.sport?.toLowerCase())
    }
    if (filters?.skillLevel) {
      results = results.filter((game) => game.skillLevel === filters.skillLevel || game.skillLevel === 'mixed')
    }
    if (filters?.isFree !== undefined) {
      results = results.filter((game) => game.isFree === filters.isFree)
    }
    if (filters?.minPrice !== undefined) {
      results = results.filter((game) => (game.pricePerPerson || 0) >= filters.minPrice!)
    }
    if (filters?.maxPrice !== undefined) {
      results = results.filter((game) => (game.pricePerPerson || 0) <= filters.maxPrice!)
    }

    const page = filters?.page ?? 1
    const pageSize = filters?.pageSize ?? 10
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      success: true,
      data: {
        data: results.slice(start, end),
        total: results.length,
        page,
        pageSize,
        hasMore: end < results.length,
      },
      timestamp: new Date(),
    }
  },

  async getGameById(id: string): Promise<ApiResponse<Game>> {
    await simulateDelay(300)

    const game = mockGames.find((item) => item.id === id)
    if (!game) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Game not found',
        },
        timestamp: new Date(),
      }
    }

    return {
      success: true,
      data: game,
      timestamp: new Date(),
    }
  },

  async createGame(input: CreateGameInput, hostId: string): Promise<ApiResponse<Game>> {
    await simulateDelay(800)

    const newGame: Game = {
      id: `game-${Math.random().toString(36).slice(2)}`,
      ...input,
      hostId,
      hostName: 'Current User',
      hostRating: 4.5,
      attendees: [hostId],
      attendeeCount: 1,
      energy: 75,
      status: 'published',
      likedBy: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
      requiresApproval: false,
      isRecurring: Boolean(input.isRecurring),
    }

    mockGames.push(newGame)

    return {
      success: true,
      data: newGame,
      timestamp: new Date(),
    }
  },

  async joinGame(gameId: string, userId: string): Promise<ApiResponse<Game>> {
    await simulateDelay(500)

    const game = mockGames.find((item) => item.id === gameId)
    if (!game) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Game not found',
        },
        timestamp: new Date(),
      }
    }

    if (game.attendees.includes(userId)) {
      return {
        success: false,
        error: {
          code: 'ALREADY_JOINED',
          message: 'Already joined this game',
        },
        timestamp: new Date(),
      }
    }

    if (game.attendees.length >= game.maxAttendees) {
      return {
        success: false,
        error: {
          code: 'FULL',
          message: 'Game is full',
        },
        timestamp: new Date(),
      }
    }

    game.attendees.push(userId)
    game.attendeeCount = game.attendees.length

    return {
      success: true,
      data: game,
      timestamp: new Date(),
    }
  },

  async leaveGame(gameId: string, userId: string): Promise<ApiResponse<Game>> {
    await simulateDelay(500)

    const game = mockGames.find((item) => item.id === gameId)
    if (!game) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Game not found',
        },
        timestamp: new Date(),
      }
    }

    game.attendees = game.attendees.filter((id) => id !== userId)
    game.attendeeCount = game.attendees.length

    return {
      success: true,
      data: game,
      timestamp: new Date(),
    }
  },
}
