import type {
  ApiResponse,
  PaginatedResponse,
  CreateEventInput,
  EventFilter,
  PlayerEvent,
} from '@/types'
import { httpPost, httpGet, httpPut, httpDelete } from '@/api/http'

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

const mapSessionToEvent = (session: any): PlayerEvent => {
  return {
    id: session.id,
    venueId: session.venue_id,
    title: session.title,
    sport: session.sport_key,
    vibeIcon: '🎯', // TODO: Map sport to icon
    skillLevel: (session.skill_level as any) ?? 'mixed',
    gender: (session.gender as any) ?? 'mixed',
    photos: session.photos ?? [],
    heroImageUrl: session.photos?.[0] ?? undefined,
    startTime: new Date(session.starts_at),
    endTime: session.ends_at ? new Date(session.ends_at) : new Date(session.starts_at),
    location: {
      name: session.place_name,
      address: session.address ?? '',
      city: '', // TODO: logic to extract city
      lat: session.lat,
      lng: session.lng,
      status: session.venue_status,
      logo_url: session.venue_logo_url,
    },
    host: {
      id: session.host_user_id,
      name: session.host_display_name || 'Host',
      avatarUrl: session.host_avatar_url || undefined,
      username: session.host_username || undefined,
      cityKey: session.host_city_key || undefined,
      cityName: session.host_city_name || undefined,
      countryKey: session.host_country_key || undefined,
    },
    highFives: 0,
    joined: false, // need to check participation
    attendeeCount: Number(session.participant_count ?? 0),
    maxAttendees: session.max_people ?? 10,
    difficulty: 2,
    isFree: session.is_free ?? true,
    price: session.price,
    priceRange: session.is_free ? '免費參加' : session.price ? `$${session.price}` : '收費活動',
    description: session.description ?? '',
    participants: [],
    status: session.status as any,
    visibility: session.visibility as any,
    updatedAt: session.updated_at ? new Date(session.updated_at) : undefined,
    checkinOpenMinsBefore: session.checkin_open_mins_before,
    checkinCloseMinsAfter: session.checkin_close_mins_after,
    detail: {
      description: session.description ?? '',
      lookingFor: {},
      heroImageUrl: session.photos?.[0],
    },
    // Extended properties for Official Events
    isOfficial: session.is_official,
    venueNameDisplay: session.venue_name_display,
    venueLogoUrl: session.venue_logo_url,
  } as PlayerEvent
}

export const eventsService = {
  async getEvents(filters?: EventFilter): Promise<ApiResponse<PaginatedResponse<PlayerEvent>>> {
    try {
      // Map filters to backend params if needed
      const queryParams: Record<string, any> = {}
      if (filters?.sport) queryParams.sportKey = filters.sport
      if (filters?.venueId) queryParams.venue_id = filters.venueId

      const response = await httpGet<any>('/sessions', { params: queryParams })
      // Backend returns { success: true, data: { data: [...], ... } } or just { success: true, data: [...] } ?
      // Based on typical pattern: response.data should have the list.
      // Wait, look closely: httpGet returns `T`. If wrapper is { ok: true, data: ... }
      // Then `response` is { ok: true, data: ... }.

      const sessions = Array.isArray(response)
        ? response
        : response.data && Array.isArray(response.data)
          ? response.data
          : response.data?.items && Array.isArray(response.data.items)
            ? response.data.items
            : []

      const events = sessions.map(mapSessionToEvent)

      return wrapSuccess({
        data: events,
        total: events.length,
        page: 1,
        pageSize: 50,
        hasMore: false,
      })
    } catch (err: any) {
      console.error('getEvents error', err)
      return wrapEmptyEvents()
    }
  },

  async getEventById(id: string): Promise<ApiResponse<PlayerEvent>> {
    try {
      const response = await httpGet<any>(`/sessions/${id}`)
      // Response structure: { ok: true, data: { session: {...}, meta: {...} } }
      const responseData = response.data || response
      const sessionData = responseData.session || responseData
      const metaData = responseData.meta || {}

      if (!sessionData) throw new Error('Session not found')

      const event = mapSessionToEvent(sessionData)

      // Merge meta info
      if (metaData) {
        event.joined = metaData.is_joined ?? false
        event.attendeeCount = metaData.participant_count ?? event.attendeeCount
      }

      if (responseData.host) {
        event.host = {
          id: responseData.host.id,
          name: responseData.host.display_name || 'User',
          avatarUrl: responseData.host.avatar_url || undefined,
          username: responseData.host.username || undefined,
          cityKey: responseData.host.city_key || undefined,
          cityName: responseData.host.city_name || undefined,
          countryKey: responseData.host.country_key || undefined,
          // rating: responseData.host.rating
        }
      }

      if (Array.isArray(responseData.participants)) {
        event.participants = responseData.participants.map((p: any) => ({
          id: p.id,
          name: p.display_name || 'Participant',
          avatarUrl: p.avatar_url || undefined,
          username: p.username || undefined,
          checkedInAt: p.checked_in_at ? new Date(p.checked_in_at) : undefined,
        }))
      }

      return wrapSuccess(event)
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_FAILED', message: err.message ?? 'Failed to load event' },
        timestamp: new Date(),
        data: undefined,
      } as any
    }
  },

  async getMyEvents(): Promise<ApiResponse<PaginatedResponse<PlayerEvent>>> {
    try {
      const [upcomingRes, historyRes] = await Promise.all([
        httpGet<any>('/sessions/my?type=upcoming'),
        httpGet<any>('/sessions/my?type=history'),
      ])

      const upcomingItems = upcomingRes.data?.items ?? upcomingRes.items ?? []
      const historyItems = historyRes.data?.items ?? historyRes.items ?? []

      const allItems = [...upcomingItems, ...historyItems]
      // Deduplicate by ID just in case
      const uniqueItems = Array.from(new Map(allItems.map((item) => [item.id, item])).values())

      const events = uniqueItems.map(mapSessionToEvent)

      return wrapSuccess({
        data: events,
        total: events.length,
        page: 1,
        pageSize: events.length,
        hasMore: false,
      })
    } catch (err: any) {
      console.error('getMyEvents error', err)
      return wrapEmptyEvents()
    }
  },

  async createEvent(
    input: CreateEventInput & { status?: string }
  ): Promise<ApiResponse<PlayerEvent>> {
    try {
      const payload = {
        title: input.title,
        sport_key: input.sport,
        description: input.description,
        starts_at: input.startTime.toISOString(),
        ends_at: new Date(input.startTime.getTime() + input.duration * 60000).toISOString(),
        place_name: input.location?.name || input.location?.address || '',
        address: input.location?.address || '',
        lat: input.location?.lat ?? 0,
        lng: input.location?.lng ?? 0,
        min_people: 1,
        max_people: input.maxAttendees,
        status: input.status || 'published',
        visibility: 'public',
        skill_level: (input.skillLevel as any) ?? 'any',
        gender: input.gender ?? 'mixed',
        is_free: input.isFree ?? true,
        price: input.pricePerPerson ?? undefined,
        photos: input.photos?.length ? input.photos : input.coverPhotoUrl ? [input.coverPhotoUrl] : undefined,
        location: input.location, // Pass the full location object (including source) for backend to handle
      }

      const res = await httpPost<{ session: any }>('/sessions', { body: payload })
      const session = (res as any)?.session ?? (res as any)?.data?.session ?? (res as any)?.data

      return wrapSuccess(mapSessionToEvent(session))
    } catch (err: any) {
      return {
        success: false,
        data: undefined as any,
        error: { code: 'CREATE_FAILED', message: err?.message || 'Failed to create event' },
        timestamp: new Date(),
      }
    }
  },

  async updateEvent(
    id: string,
    input: Partial<CreateEventInput> & { status?: string }
  ): Promise<ApiResponse<PlayerEvent>> {
    try {
      // Map input to backend payload
      // Reuse logic from createEvent but handle partial updates if necessary
      // For now, assuming full update structure is fine, but filter undefined
      const duration = input.duration ?? 60
      const startTime = input.startTime ? input.startTime : new Date()
      // If startTime not provided, duration calc might fail if we rely on it.
      // But usually we pass full form state.

      const payload: any = {
        title: input.title,
        sport_key: input.sport,
        description: input.description,
        address: input.location?.address || undefined,
        lat: input.location?.lat,
        lng: input.location?.lng,
        max_people: input.maxAttendees,
        status: input.status,
        visibility: 'public',
        skill_level: input.skillLevel,
        gender: input.gender,
        is_free: input.isFree,
        price: input.pricePerPerson,
        photos: input.photos?.length ? input.photos : input.coverPhotoUrl ? [input.coverPhotoUrl] : undefined,
        location: input.location,
      }

      if (input.startTime) {
        payload.starts_at = input.startTime.toISOString()
        payload.ends_at = new Date(input.startTime.getTime() + duration * 60000).toISOString()
      }

      // Remove undefined keys
      Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key])

      const res = await httpPut<{ session: any }>(`/sessions/${id}`, { body: payload })
      const session = (res as any)?.session ?? (res as any)?.data?.session ?? (res as any)?.data

      return wrapSuccess(mapSessionToEvent(session))
    } catch (err: any) {
      return {
        success: false,
        data: undefined as any,
        error: { code: 'UPDATE_FAILED', message: err?.message || 'Failed to update event' },
        timestamp: new Date(),
      }
    }
  },

  async joinEvent(eventId: string): Promise<ApiResponse<PlayerEvent>> {
    try {
      await httpPost(`/sessions/${eventId}/join`)
      return this.getEventById(eventId)
    } catch (err: any) {
      return { success: false, error: err, timestamp: new Date() } as any
    }
  },

  async leaveEvent(eventId: string): Promise<ApiResponse<PlayerEvent>> {
    try {
      await httpPost(`/sessions/${eventId}/leave`)
      return this.getEventById(eventId)
    } catch (err: any) {
      return { success: false, error: err, timestamp: new Date() } as any
    }
  },

  async deleteEvent(eventId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const res = await httpDelete<any>(`/sessions/${eventId}`)
      return wrapSuccess({ deleted: true })
    } catch (err: any) {
      return {
        success: false,
        data: undefined as any,
        error: { code: 'DELETE_FAILED', message: err?.message || 'Failed to delete event' },
        timestamp: new Date(),
      }
    }
  },

  async checkIn(eventId: string, coords: { lat: number; lng: number }): Promise<ApiResponse<any>> {
    try {
      const res = await httpPost<any>(`/sessions/${eventId}/check-in`, { body: coords })
      return wrapSuccess(res.data ?? res)
    } catch (err: any) {
      // 'http' utility attaches parsed JSON response to err.details
      const jsonResponse = err.details || {}
      const backendErr = jsonResponse.error || jsonResponse

      return {
        success: false,
        data: undefined as any,
        error: {
          code: backendErr.code || 'CHECKIN_FAILED',
          message: backendErr.message || err?.message || 'Check-in failed',
          details: backendErr.details,
        } as any,
        timestamp: new Date(),
      }
    }
  },
}
