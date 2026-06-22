import { ApiResponse } from '@/types'
import { httpGet, httpPost, httpPut } from '@/api/http'

const wrapSuccess = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date(),
})

export interface ManagedVenue {
  id: string
  name_display: string
  address_display: string
  status: string
  claim_status: string // 'approved'
  contact_email?: string
}

export interface VenueDashboardData {
  venue: ManagedVenue
  claim_info: any
  stats: {
    sessions_completed: number
    active_events: number
    participants_this_week: number
    players_played_here: number
  }
}

export interface AdminMyVenue {
  venue_id: string
  venue_name: string
  venue_address: string
}

export interface VenueStats {
  active_users: number
  participants_of_the_week: number
  total_players: number
}

export interface VenueCourt {
  id: string
  name: string
  supported_sports?: string[]
}

export type GroupedVenueEvents = Record<
  string,
  Array<{
    event_id: string
    sport: string
    start_at: string
    participant_count: number
  }>
>

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const

const AMENITY_GROUPS = {
  facilities: [
    { label: 'Parking', key: 'parking' },
    { label: 'Restrooms', key: 'restroom' },
    { label: 'Showers', key: 'shower' },
    { label: 'Changing rooms', key: 'changing_room' },
    { label: 'Seating area', key: 'seating_area' },
  ],
  playing: [
    { label: 'Night lighting', key: 'lighting' },
    { label: 'Indoor', key: 'indoor' },
    { label: 'Outdoor', key: 'outdoor' },
  ],
  services: [
    { label: 'Equipment rental', key: 'equipment_rental' },
    { label: 'Coaching', key: 'coaching' },
  ],
  supply: [
    { label: 'Water refill', key: 'water' },
    { label: 'Vending machine', key: 'vending_machine' },
    { label: 'Contactless pay', key: 'contactless_pay' },
    { label: 'Wi-Fi', key: 'wifi' },
  ],
} as const

interface VenueProfileHour {
  day: string
  open_time: string
  close_time: string
  is_closed: boolean
}

const toManagedVenue = (row: any): ManagedVenue => ({
  id: row?.id,
  name_display: row?.name_display || row?.name || 'Unnamed Venue',
  address_display: row?.address_display || row?.address || '',
  status: row?.status || 'claimed',
  claim_status: row?.claim_status || 'approved',
  contact_email: row?.contact_email,
})

const toManagedVenueFromMyVenue = (row: AdminMyVenue): ManagedVenue => ({
  id: row?.venue_id,
  name_display: row?.venue_name || 'Unnamed Venue',
  address_display: row?.venue_address || '',
  status: 'claimed',
  claim_status: 'approved',
})

const toNumber = (value: unknown, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const extractSelectedAmenities = (raw: any): string[] => {
  if (Array.isArray(raw?.amenities)) {
    return raw.amenities.filter(Boolean)
  }

  const sources = {
    facilities: raw?.facilities || raw?.amenities?.facilities || {},
    playing: raw?.playing || raw?.amenities?.playing || {},
    services: raw?.services || raw?.amenities?.services || {},
    supply: raw?.supply || raw?.amenities?.supply || {},
  }

  const selected = new Set<string>()
  ;(Object.keys(AMENITY_GROUPS) as Array<keyof typeof AMENITY_GROUPS>).forEach((groupKey) => {
    const mappings = AMENITY_GROUPS[groupKey]
    mappings.forEach(({ label, key }) => {
      if (sources[groupKey]?.[key]) selected.add(label)
    })
  })

  return Array.from(selected)
}

const buildAmenitiesPayload = (selected: string[] = []) => {
  const selectedSet = new Set(selected)

  return {
    facilities: AMENITY_GROUPS.facilities.reduce<Record<string, boolean>>((acc, { label, key }) => {
      acc[key] = selectedSet.has(label)
      return acc
    }, {}),
    playing: AMENITY_GROUPS.playing.reduce<Record<string, boolean>>((acc, { label, key }) => {
      acc[key] = selectedSet.has(label)
      return acc
    }, {}),
    services: AMENITY_GROUPS.services.reduce<Record<string, boolean>>((acc, { label, key }) => {
      acc[key] = selectedSet.has(label)
      return acc
    }, {}),
    supply: AMENITY_GROUPS.supply.reduce<Record<string, boolean>>((acc, { label, key }) => {
      acc[key] = selectedSet.has(label)
      return acc
    }, {}),
  }
}

const normalizeOpeningHours = (hours: any): VenueProfileHour[] => {
  if (!Array.isArray(hours)) return []

  return hours.map((item, index) => ({
    day: DAYS[index] || `Day ${index + 1}`,
    open_time: item?.open_at || '06:00',
    close_time: item?.close_at || '22:00',
    is_closed: item?.is_open === false,
  }))
}

const serializeOpeningHours = (hours: VenueProfileHour[] = []) => {
  return DAYS.map((_, index) => {
    const found = hours[index]
    if (!found) {
      return { is_open: false, open_at: null, close_at: null }
    }

    const isOpen = !found.is_closed
    return {
      is_open: isOpen,
      open_at: isOpen ? found.open_time : null,
      close_at: isOpen ? found.close_time : null,
    }
  })
}

const normalizeVenueProfile = (venueId: string, data: any) => {
  const spaces = Array.isArray(data?.spaces)
    ? data.spaces
    : Array.isArray(data?.courts)
      ? data.courts.map((court: any) => ({ name: court?.name || 'Court', supported_sports: [] }))
      : []

  const courts = Array.isArray(data?.courts)
    ? data.courts
    : spaces.map((space: any, idx: number) => ({
        id: space?.id || `court-${idx + 1}`,
        name: space?.name || `Court ${idx + 1}`,
      }))

  return {
    id: venueId,
    name_display: data?.name_display || data?.name || '',
    address_display: data?.address_display || data?.address || '',
    logo_url: data?.logo_url || '',
    cover_url: data?.cover_url || '',
    description: data?.description || '',
    amenities: extractSelectedAmenities(data),
    spaces,
    courts,
    operating_hours: Array.isArray(data?.operating_hours)
      ? data.operating_hours
      : normalizeOpeningHours(data?.opening_hours),
    social_links: data?.social_links || {},
    images: Array.isArray(data?.images) ? data.images : [],
  }
}

export const venuePortalService = {
  async getMyVenue(): Promise<ApiResponse<AdminMyVenue>> {
    try {
      const res = await httpGet<AdminMyVenue>('/admin/me')
      return wrapSuccess((res as any)?.data || (res as any))
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_MY_VENUE_FAILED', message: err?.details?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  },

  /**
   * List all venues managed by the current user.
   */
  async getMyVenues(): Promise<ApiResponse<ManagedVenue[]>> {
    try {
      const res = await httpGet<any[]>('/admin/me/venues')
      const rows: any[] = Array.isArray((res as any)?.data) ? (res as any).data : []
      return wrapSuccess(rows.map(toManagedVenue))
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_MY_VENUES_FAILED', message: err?.details?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  },

  /**
   * Get venue stats.
   */
  async getVenueStats(venueId: string): Promise<ApiResponse<VenueStats>> {
    try {
      const res = await httpGet<VenueStats>(`/admin/venues/${venueId}/stats`)
      const data = (res as any)?.data || {}
      return wrapSuccess({
        active_users: toNumber(data?.active_users),
        participants_of_the_week: toNumber(data?.participants_of_the_week),
        total_players: toNumber(data?.total_players),
      })
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_VENUE_STATS_FAILED', message: err?.details?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  },

  /**
   * Get venue profile details.
   */
  async getVenueProfile(venueId: string): Promise<ApiResponse<any>> {
    try {
      const res = await httpGet<any>(`/admin/venues/${venueId}`)
      return wrapSuccess(normalizeVenueProfile(venueId, (res as any)?.data || {}))
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_PROFILE_FAILED', message: err?.details?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  },

  async getVenueCourts(venueId: string): Promise<ApiResponse<VenueCourt[]>> {
    try {
      const res = await httpGet<VenueCourt[]>(`/admin/venues/${venueId}/courts`)
      const rows = Array.isArray((res as any)?.data) ? (res as any).data : []
      return wrapSuccess(
        rows
          .map((court: any, idx: number) => ({
            id: String(court?.id || `court-${idx + 1}`),
            name: String(court?.name || '').trim(),
            supported_sports: Array.isArray(court?.supported_sports) ? court.supported_sports.filter(Boolean) : [],
          }))
          .filter((court: VenueCourt) => court.name)
      )
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_VENUE_COURTS_FAILED', message: err?.details?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  },

  /**
   * Update venue profile branding.
   */
  async updateVenueProfile(venueId: string, data: any): Promise<ApiResponse<any>> {
    try {
      const payload = {
        logo_url: data?.logo_url,
        description: data?.description,
        social_links: data?.social_links || {},
        opening_hours: serializeOpeningHours(data?.operating_hours || []),
        spaces: Array.isArray(data?.spaces)
          ? data.spaces.map((space: any) => ({
              name: String(space?.name || '').trim(),
              supported_sports: Array.isArray(space?.supported_sports) ? space.supported_sports.filter(Boolean) : [],
            }))
          : [],
        ...buildAmenitiesPayload(data?.amenities),
      }

      const res = await httpPut<any>(`/admin/venues/${venueId}`, { body: payload })
      return wrapSuccess((res as any)?.data || (res as any))
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'UPDATE_PROFILE_FAILED', message: err?.details?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  },

  /**
   * Create an official session for the venue.
   */
  async createVenueEvent(venueId: string, payload: any): Promise<ApiResponse<any>> {
    try {
      const res = await httpPost<any>(`/admin/venues/${venueId}/events`, { body: payload })
      return wrapSuccess((res as any)?.data || (res as any))
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'CREATE_EVENT_FAILED', message: err?.details?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  },

  async createRecurringEvents(venueId: string, payload: any): Promise<ApiResponse<any>> {
    try {
      const res = await httpPost<any>(`/admin/venues/${venueId}/recurring-events`, {
        body: payload,
      })
      return wrapSuccess((res as any)?.data || (res as any))
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'CREATE_RECURRING_EVENTS_FAILED',
          message: err?.details?.error || err.message,
        },
        timestamp: new Date(),
      } as any
    }
  },

  async listVenueEvents(
    venueId: string,
    params: { from: string; to: string }
  ): Promise<ApiResponse<GroupedVenueEvents>> {
    try {
      const res = await httpGet<GroupedVenueEvents>(`/admin/venues/${venueId}/events`, { params })
      return wrapSuccess((res as any)?.data || (res as any) || {})
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_VENUE_EVENTS_FAILED', message: err?.details?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  },

  async getEventDetail(eventId: string): Promise<ApiResponse<any>> {
    try {
      const res = await httpGet<any>(`/admin/events/${eventId}`)
      return wrapSuccess((res as any)?.data || (res as any))
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_EVENT_DETAIL_FAILED', message: err?.details?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  },

  async updateVenueEvent(eventId: string, payload: any): Promise<ApiResponse<any>> {
    try {
      const res = await httpPut<any>(`/admin/events/${eventId}`, { body: payload })
      return wrapSuccess((res as any)?.data || (res as any))
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'UPDATE_EVENT_FAILED', message: err?.details?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  },
}
