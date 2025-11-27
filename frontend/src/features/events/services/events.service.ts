import { apiRequest } from '@/services/apiClient'
import {
  ApiResponse,
  PaginatedResponse,
  CreateEventInput,
  EventFilter,
  PlayerEvent,
  EventCardDTO,
  EventDetailDTO,
  EventApi,
  SaveEventPayload,
} from '@/types'
import { format } from 'date-fns'
import { useAuthStore } from '@/store/authStore'

const SPORT_ICONS: Record<string, string> = {
  basketball: '🏀',
  badminton: '🏸',
  pickleball: '🏓',
  climbing: '🧗',
  running: '🏃',
  hiking: '🥾',
  tennis: '🎾',
  volleyball: '🏐',
}

type EventSource = EventCardDTO | EventDetailDTO | EventApi

const isEventApi = (event: EventSource): event is EventApi => 'creator_id' in event

const mapEventDtoToPlayerEvent = (
  event: EventSource,
  currentUserId?: string,
): PlayerEvent => ({
  id: String(event.id),
  title: event.title,
  sport: event.sport,
  heroImageUrl: isEventApi(event) ? event.hero_image_url ?? undefined : event.coverPhotoUrl ?? undefined,
  vibeIcon: SPORT_ICONS[event.sport.toLowerCase()] ?? '🎯',
  skillLevel: (isEventApi(event) ? event.skill_level : event.skillLevel) ?? 'mixed',
  startTime: new Date(isEventApi(event) ? event.start_time : event.startDateTime),
  endTime: new Date(isEventApi(event) ? event.end_time : event.endDateTime),
  location: {
    name: (isEventApi(event) ? event.location_name : event.locationName) || 'Location TBC',
    address: isEventApi(event)
      ? event.location_address || ''
      : 'addressLine' in event && event.addressLine
      ? event.addressLine
      : '',
    city: (isEventApi(event) ? event.city : (event as EventCardDTO | EventDetailDTO).city) ?? '',
  },
  host: {
    id: isEventApi(event) ? String(event.creator_id) : String(event.host.id),
    name: isEventApi(event) ? event.host_name || 'Host' : event.host.displayName || 'Host',
    avatarUrl: isEventApi(event) ? event.host_avatar ?? undefined : event.host.avatarUrl ?? undefined,
  },
  highFives: 0, // TODO: wire to a proper "energy" or kudos metric when available in the DTO
  joined:
    'isUserJoined' in event && typeof event.isUserJoined === 'boolean'
      ? event.isUserJoined
      : false,
  attendeeCount: isEventApi(event) ? Number(event.attendee_count ?? 0) : event.joinedCount ?? 0,
  maxAttendees: isEventApi(event) ? event.max_players : event.capacity,
  difficulty: Math.min(
    Math.max(
      ['beginner', 'mixed', 'intermediate', 'advanced'].indexOf(
        ((isEventApi(event) ? event.skill_level : event.skillLevel) ?? 'mixed').toLowerCase(),
      ) + 1,
      1,
    ),
    4,
  ) as 1 | 2 | 3 | 4,
  isFree: isEventApi(event)
    ? event.price_type === 'free' || !event.price
    : event.isFree ?? event.priceType === 'free',
  price: ((): number => {
    if (isEventApi(event)) return event.price ?? 0
    return event.priceAmount ?? 0
  })(),
  priceRange:
    (isEventApi(event)
      ? event.price_type === 'free' || !event.price
      : event.priceType === 'free' || !event.priceAmount)
      ? 'Free to join'
      : `$${(isEventApi(event) ? event.price ?? 0 : event.priceAmount ?? 0).toFixed(2)}`,
  description: (event as EventSource).description ?? '',
  participants: (() => {
    if ('attendees' in event && event.attendees) {
      return event.attendees.map((participant) => ({
        id: String(isEventApi(event) ? participant.player_id : participant.id),
        name: isEventApi(event) ? participant.full_name ?? 'Player' : participant.displayName,
        avatarUrl: isEventApi(event) ? participant.avatar_url ?? undefined : participant.avatarUrl ?? undefined,
      }))
    }
    return []
  })(),
  detail: {
    description: (event as EventSource).description ?? '',
    lookingFor: {
      skillLevel: (isEventApi(event) ? event.skill_level : event.skillLevel) ?? 'mixed',
    },
    rules: {
      duration: `${getDurationMinutes(
        isEventApi(event) ? event.start_time : event.startDateTime,
        isEventApi(event) ? event.end_time : event.endDateTime,
      )} mins`,
    },
    heroImageUrl: isEventApi(event) ? event.hero_image_url ?? undefined : event.coverPhotoUrl ?? undefined,
  },
  completedDate:
    (event as any).status === 'completed'
      ? new Date(isEventApi(event) ? event.end_time : event.endDateTime)
      : undefined,
})

const getDurationMinutes = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return Math.max(30, Math.round((endDate.getTime() - startDate.getTime()) / 60000))
}

const wrapSuccess = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date(),
})

export const eventsService = {
  async getEvents(filters?: EventFilter): Promise<ApiResponse<PaginatedResponse<PlayerEvent>>> {
    const params: Record<string, string> = {}
    if (filters?.sport) params.sport = filters.sport
    if (filters?.startDate) params.startDate = format(filters.startDate, 'yyyy-MM-dd')
    if (filters?.endDate) params.endDate = format(filters.endDate, 'yyyy-MM-dd')
    if (filters?.lat) params.lat = String(filters.lat)
    if (filters?.lng) params.lng = String(filters.lng)

    const response = await apiRequest<{ data: (EventCardDTO | EventApi)[] }>('GET', '/games', {
      auth: false,
      params,
    })
    const events = response.data.map((event) => mapEventDtoToPlayerEvent(event))
    return wrapSuccess({
      data: events,
      total: events.length,
      page: 1,
      pageSize: events.length,
      hasMore: false,
    })
  },

  async getEventById(id: string): Promise<ApiResponse<PlayerEvent>> {
    const currentUserId = useAuthStore.getState().user?.id
    const response = await apiRequest<EventDetailDTO>('GET', `/games/${id}`, {})
    return wrapSuccess(mapEventDtoToPlayerEvent(response, currentUserId))
  },

  async getMyEvents(): Promise<ApiResponse<PaginatedResponse<PlayerEvent>>> {
    const currentUserId = useAuthStore.getState().user?.id
    const response = await apiRequest<{ data: (EventCardDTO | EventApi)[] }>('GET', '/games/mine', {})
    const events = response.data.map((apiEvent) => mapEventDtoToPlayerEvent(apiEvent, currentUserId))
    return wrapSuccess({
      data: events,
      total: events.length,
      page: 1,
      pageSize: events.length,
      hasMore: false,
    })
  },

  async createEvent(input: CreateEventInput): Promise<ApiResponse<PlayerEvent>> {
    const payload: SaveEventPayload = {
      id: undefined,
      title: input.title,
      sport: input.sport,
      skillLevel: input.skillLevel,
      startDateTime: input.startTime.toISOString(),
      endDateTime: new Date(input.startTime.getTime() + input.duration * 60000).toISOString(),
      locationName: input.location?.name || input.location?.address || 'Location TBC',
      addressLine: input.location?.address ?? null,
      area: input.location?.area ?? null,
      city: input.location?.city ?? null,
      countryCode: input.location?.countryCode ?? null,
      latitude: input.location?.lat ?? null,
      longitude: input.location?.lng ?? null,
      capacity: input.maxAttendees,
      priceType: input.isFree ? 'free' : 'fixed',
      priceAmount: input.isFree ? null : input.pricePerPerson ?? null,
      description: input.description ?? '',
      notesForAttendees: input.notesForAttendees ?? null,
      coverPhotoUrl: input.coverPhotoUrl ?? null,
      status: 'published',
    }
    const event = await apiRequest<EventDetailDTO>('POST', '/games', { body: payload })
    return wrapSuccess(mapEventDtoToPlayerEvent(event))
  },

  async joinEvent(eventId: string): Promise<ApiResponse<PlayerEvent>> {
    await apiRequest('POST', `/games/${eventId}/join`, {})
    return this.getEventById(eventId)
  },

  async leaveEvent(eventId: string): Promise<ApiResponse<PlayerEvent>> {
    await apiRequest('DELETE', `/games/${eventId}/leave`, {})
    return this.getEventById(eventId)
  },
}
