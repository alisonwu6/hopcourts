import { ApiResponse, CreateSessionInput, PaginatedResponse, Session, SessionFilter } from '@/types'

const mockSessions: Session[] = [
  {
    id: 'session-1',
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
    id: 'session-2',
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

export const sessionsService = {
  async getSessions(filters?: SessionFilter): Promise<ApiResponse<PaginatedResponse<Session>>> {
    await simulateDelay(500)

    let results = [...mockSessions]

    if (filters?.sport) {
      results = results.filter((session) => session.sport.toLowerCase() === filters.sport?.toLowerCase())
    }
    if (filters?.skillLevel) {
      results = results.filter((session) => session.skillLevel === filters.skillLevel || session.skillLevel === 'mixed')
    }
    if (filters?.isFree !== undefined) {
      results = results.filter((session) => session.isFree === filters.isFree)
    }
    if (filters?.minPrice !== undefined) {
      results = results.filter((session) => (session.pricePerPerson || 0) >= filters.minPrice!)
    }
    if (filters?.maxPrice !== undefined) {
      results = results.filter((session) => (session.pricePerPerson || 0) <= filters.maxPrice!)
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

  async getSessionById(id: string): Promise<ApiResponse<Session>> {
    await simulateDelay(300)

    const session = mockSessions.find((item) => item.id === id)
    if (!session) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Session not found',
        },
        timestamp: new Date(),
      }
    }

    return {
      success: true,
      data: session,
      timestamp: new Date(),
    }
  },

  async createSession(input: CreateSessionInput, hostId: string): Promise<ApiResponse<Session>> {
    await simulateDelay(800)

    const newSession: Session = {
      id: `session-${Math.random().toString(36).slice(2)}`,
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

    mockSessions.push(newSession)

    return {
      success: true,
      data: newSession,
      timestamp: new Date(),
    }
  },

  async joinSession(sessionId: string, userId: string): Promise<ApiResponse<Session>> {
    await simulateDelay(500)

    const session = mockSessions.find((item) => item.id === sessionId)
    if (!session) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Session not found',
        },
        timestamp: new Date(),
      }
    }

    if (session.attendees.includes(userId)) {
      return {
        success: false,
        error: {
          code: 'ALREADY_JOINED',
          message: 'Already joined this session',
        },
        timestamp: new Date(),
      }
    }

    if (session.attendees.length >= session.maxAttendees) {
      return {
        success: false,
        error: {
          code: 'FULL',
          message: 'Session is full',
        },
        timestamp: new Date(),
      }
    }

    session.attendees.push(userId)
    session.attendeeCount = session.attendees.length

    return {
      success: true,
      data: session,
      timestamp: new Date(),
    }
  },

  async leaveSession(sessionId: string, userId: string): Promise<ApiResponse<Session>> {
    await simulateDelay(500)

    const session = mockSessions.find((item) => item.id === sessionId)
    if (!session) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Session not found',
        },
        timestamp: new Date(),
      }
    }

    session.attendees = session.attendees.filter((id) => id !== userId)
    session.attendeeCount = session.attendees.length

    return {
      success: true,
      data: session,
      timestamp: new Date(),
    }
  },
}
