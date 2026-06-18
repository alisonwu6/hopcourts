import { ApiResponse, PaginatedResponse } from '@/types'
import { httpGet, httpPost } from '@/api/http'

export type VenueType = 'public' | 'official' | 'private'

export interface VenueFilter {
  lat?: number
  lng?: number
  radiusKm?: number
  limit?: number
  offset?: number
  type?: VenueType
}

export interface ApiVenue {
  id: string
  name_display: string
  address_display: string
  lat: string | number
  lng: string | number
  status: 'unclaimed' | 'claimed' | 'suspended'
  venue_type: VenueType
  logo_url?: string
  description?: string
  amenities?: string[]
  operating_hours?: {
    day: string
    open_time: string
    close_time: string
    is_closed: boolean
  }[]
  spaces?: {
    name: string
    supported_sports: string[]
  }[]
  active_sessions_count: number
  today_sessions_count: number
  sport_keys: string[]
  has_pending_claim: boolean
  created_at: string
}

export interface VenueClaimRequest {
  contact_name: string
  contact_person: string
  contact_title: string
  contact_phone: string
  contact_email: string
  note?: string
}

const wrapSuccess = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date(),
})

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const

const normalizeOperatingHours = (venue: any) => {
  if (Array.isArray(venue?.operating_hours)) return venue.operating_hours
  if (!Array.isArray(venue?.opening_hours)) return []

  return venue.opening_hours.map((item: any, index: number) => ({
    day: DAYS[index] || `Day ${index + 1}`,
    open_time: item?.open_at || '06:00',
    close_time: item?.close_at || '22:00',
    is_closed: item?.is_open === false,
  }))
}

const normalizeAmenities = (venue: any): string[] => {
  if (Array.isArray(venue?.amenities)) return venue.amenities.filter(Boolean)

  const mapping = {
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

  const selected = new Set<string>()
  ;(Object.keys(mapping) as Array<keyof typeof mapping>).forEach((group) => {
    mapping[group].forEach(({ label, key }) => {
      if (venue?.amenities?.[group]?.[key]) selected.add(label)
    })
  })

  return Array.from(selected)
}

const normalizeSpaces = (venue: any) => {
  if (!Array.isArray(venue?.spaces)) return []
  return venue.spaces
    .filter((space: any) => space && typeof space === 'object')
    .map((space: any) => ({
      name: String(space?.name || '').trim(),
      supported_sports: Array.isArray(space?.supported_sports) ? space.supported_sports.filter(Boolean) : [],
    }))
    .filter((space: any) => space.name)
}

const normalizeVenue = (venue: any): ApiVenue => ({
  ...venue,
  name_display: venue?.name_display || venue?.name || '',
  address_display: venue?.address_display || venue?.address || '',
  description: venue?.description || '',
  amenities: normalizeAmenities(venue),
  operating_hours: normalizeOperatingHours(venue),
  spaces: normalizeSpaces(venue),
  sport_keys: Array.isArray(venue?.sport_keys) ? venue.sport_keys : [],
})

export const venuesService = {
  async listVenues(filter: VenueFilter = {}): Promise<ApiResponse<PaginatedResponse<ApiVenue>>> {
    try {
      const response = await httpGet<any>('/venues', {
        params: {
          lat: filter.lat,
          lng: filter.lng,
          radiusKm: filter.radiusKm,
          limit: filter.limit,
          offset: filter.offset,
          type: filter.type,
        },
      })

      const rows: any[] = Array.isArray(response?.data) ? response.data : []
      const items: ApiVenue[] = rows.map(normalizeVenue)
      const limit = filter.limit ?? 50
      const hasMore = response?.has_more ?? items.length === limit

      return wrapSuccess({
        data: items,
        total: items.length,
        page: filter.offset ? Math.floor(filter.offset / limit) + 1 : 1,
        pageSize: limit,
        hasMore,
      })
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_VENUES_FAILED', message: err?.details?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  },

  async getVenueById(venueId: string): Promise<ApiResponse<ApiVenue>> {
    try {
      const response = await httpGet<any>(`/venues/${venueId}`)
      const venue = normalizeVenue(response?.data || {})
      return wrapSuccess(venue)
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_VENUE_FAILED', message: err?.details?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  },

  async requestVenueClaim(venueId: string, claimData: VenueClaimRequest): Promise<ApiResponse<any>> {
    try {
      const response = await httpPost<any>(`/venues/${venueId}/claim`, {
        body: claimData,
      })
      return wrapSuccess(response?.data)
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'CLAIM_REQUEST_FAILED', message: err?.details?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  },
}
