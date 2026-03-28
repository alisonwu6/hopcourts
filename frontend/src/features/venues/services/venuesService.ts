import { ApiResponse, PaginatedResponse } from '@/types'
import { httpGet, httpPost } from '@/api/http'

export interface VenueFilter {
  lat?: number
  lng?: number
  radiusKm?: number
  limit?: number
  offset?: number
}

export interface ApiVenue {
  id: string
  name_display: string
  address_display: string
  lat: string | number 
  lng: string | number
  status: 'unclaimed' | 'claimed' | 'suspended'
  logo_url?: string
  description?: string
  amenities?: string[]
  operating_hours?: {
    day: string
    open_time: string
    close_time: string
    is_closed: boolean
  }[]
  active_sessions_count: number
  created_at: string
}

const wrapSuccess = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date(),
})

const normalizeVenue = (venue: any): ApiVenue => ({
  ...venue,
  name_display: venue?.name_display || venue?.name || '',
  address_display: venue?.address_display || venue?.address || '',
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
        },
      })

      const rows: any[] = Array.isArray(response?.data) ? response.data : []
      const items: ApiVenue[] = rows.map(normalizeVenue)

      return wrapSuccess({
        data: items,
        total: items.length,
        page: filter.offset ? Math.floor(filter.offset / (filter.limit || 50)) + 1 : 1,
        pageSize: filter.limit || items.length,
        hasMore: false,
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

  async requestVenueClaim(venueId: string, claimData: {
    contact_name: string
    contact_person: string
    contact_title: string
    contact_phone: string
    contact_email: string
    note?: string
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpPost<any>(`/venues/${venueId}/claim`, {
        body: claimData,
        auth: false,
      })
      return wrapSuccess(response?.data)
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'CLAIM_REQUEST_FAILED', message: err?.details?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  }
}
