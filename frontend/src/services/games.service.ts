import { ApiResponse, CreateGameInput, PaginatedResponse, Game, GameFilter } from '@/types'

const mockGames: Game[] = [
  {
    id: 'game-1',
    title: 'Sunrise Climbing Meetup',
    description: 'Beautiful morning climb at Kangaroo Point',
    sport: 'Climbing',
    difficulty: 3,
    skillLevel: 'intermediate',
    hostId: 'user-1',
    hostName: 'Tom Chen',
    hostRating: 4.8,
    venueId: 'venue-1',
    location: {
      lat: -27.4705,
      lng: 151.8391,
      address: 'Kangaroo Point Cliffs, Brisbane',
    },
    startTime: new Date(Date.now() + 86_400_000),
    endTime: new Date(Date.now() + 86_400_000 + 5_400_000),
    duration: 90,
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      daysOfWeek: [6],
    },
    maxAttendees: 8,
    attendees: ['user-2', 'user-3'],
    attendeeCount: 2,
    tags: ['#MorningCrew', '#Outdoor'],
    isFree: false,
    pricePerPerson: 15,
    currency: 'AUD',
    energy: 85,
    status: 'published',
    likedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    requiresApproval: false,
  },
  {
    id: 'game-2',
    title: 'Evening Basketball Game',
    description: 'Casual basketball at Holland Park',
    sport: 'Basketball',
    difficulty: 2,
    skillLevel: 'beginner',
    hostId: 'user-2',
    hostName: 'Sarah Wu',
    hostRating: 4.5,
    location: {
      lat: -27.4849,
      lng: 151.9153,
      address: 'Holland Park, Brisbane',
      instructions: 'Court 2 at Holland Park',
    },
    startTime: new Date(Date.now() + 172_800_000),
    endTime: new Date(Date.now() + 172_800_000 + 3_600_000),
    duration: 60,
    isRecurring: false,
    maxAttendees: 10,
    attendees: [],
    attendeeCount: 0,
    tags: ['#Social', '#Beginner-friendly'],
    isFree: true,
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
