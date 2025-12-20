import type {
  ApiResponse,
  PaginatedResponse,
  CreateEventInput,
  EventFilter,
  PlayerEvent,
} from '@/types'

const wrapSuccess = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date(),
})

const wrapEmptyEvents = (): ApiResponse<PaginatedResponse<PlayerEvent>> =>
  wrapSuccess({
    data: [],
    total: 0,
    page: 1,
    pageSize: 0,
    hasMore: false,
  })

const buildFallbackEvent = (id: string): PlayerEvent => {
  const now = new Date()
  const end = new Date(now.getTime() + 60 * 60 * 1000)
  return {
    id,
    title: 'SportsMatch 活動',
    sport: 'running',
    vibeIcon: '🏃',
    skillLevel: 'mixed',
    startTime: now,
    endTime: end,
    location: {
      name: 'Location TBC',
      address: '',
      city: '台北',
    },
    host: {
      id: 'host',
      name: 'SportsMatch',
    },
    highFives: 0,
    joined: false,
    attendeeCount: 0,
    maxAttendees: 10,
    difficulty: 2,
    isFree: true,
    priceRange: 'Free to join',
    participants: [],
    detail: {
      description: '活動資訊準備中。',
    },
  }
}

const buildEventFromInput = (input: CreateEventInput): PlayerEvent => {
  const startTime = input.startTime
  const endTime = new Date(input.startTime.getTime() + input.duration * 60000)
  return {
    id: `local-${Date.now()}`,
    title: input.title,
    sport: input.sport,
    vibeIcon: '🎯',
    skillLevel: input.skillLevel,
    startTime,
    endTime,
    location: {
      name: input.location?.name || input.location?.address || 'Location TBC',
      address: input.location?.address ?? '',
      city: input.location?.city ?? '',
    },
    host: {
      id: 'local-user',
      name: '你',
    },
    highFives: 0,
    joined: true,
    attendeeCount: 1,
    maxAttendees: input.maxAttendees,
    difficulty: 2,
    isFree: input.isFree,
    price: input.pricePerPerson ?? undefined,
    priceRange: input.isFree ? 'Free to join' : `$${(input.pricePerPerson ?? 0).toFixed(2)}`,
    description: input.description ?? '',
    participants: [],
  }
}

export const eventsService = {
  async getEvents(_filters?: EventFilter): Promise<ApiResponse<PaginatedResponse<PlayerEvent>>> {
    return wrapEmptyEvents()
  },

  async getEventById(id: string): Promise<ApiResponse<PlayerEvent>> {
    return wrapSuccess(buildFallbackEvent(id))
  },

  async getMyEvents(): Promise<ApiResponse<PaginatedResponse<PlayerEvent>>> {
    return wrapEmptyEvents()
  },

  async createEvent(input: CreateEventInput): Promise<ApiResponse<PlayerEvent>> {
    return wrapSuccess(buildEventFromInput(input))
  },

  async joinEvent(eventId: string): Promise<ApiResponse<PlayerEvent>> {
    const event = buildFallbackEvent(eventId)
    return wrapSuccess({
      ...event,
      joined: true,
      attendeeCount: event.attendeeCount + 1,
    })
  },

  async leaveEvent(eventId: string): Promise<ApiResponse<PlayerEvent>> {
    const event = buildFallbackEvent(eventId)
    return wrapSuccess({
      ...event,
      joined: false,
      attendeeCount: Math.max(0, event.attendeeCount - 1),
    })
  },
}
