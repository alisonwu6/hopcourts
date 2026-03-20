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
  status: 'unclaimed' | 'claimed'
  logo_url?: string
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
      const params: any = { ...filter }
      const res = await httpGet<any>('/venues', { params, auth: false })
      const payload = res?.data ?? res
      const rawItems = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
      const items = rawItems.map(normalizeVenue)
      
      return wrapSuccess({
        data: items,
        total: items.length,
        page: 1,
        pageSize: items.length,
        hasMore: items.length >= (filter.limit || 50),
      })
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_VENUES_FAILED', message: err.message },
        timestamp: new Date(),
      } as any
    }
  },

  async getVenueById(id: string): Promise<ApiResponse<ApiVenue>> {
    try {
      const res = await httpGet<any>(`/venues/${id}`, { auth: false })
      const payload = res?.data ?? res
      return wrapSuccess(normalizeVenue(payload?.data ?? payload))
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_VENUE_FAILED', message: err.message },
        timestamp: new Date(),
      } as any
    }
  },

  async requestVenueClaim(id: string, claimData: {
    contact_name: string
    contact_person: string
    contact_title: string
    contact_phone: string
    contact_email: string
    note?: string
  }): Promise<ApiResponse<any>> {
    try {
      // Mock API call to run frontend flow directly
      await new Promise(resolve => setTimeout(resolve, 500))
      return wrapSuccess({ id: 'mocked-claim-id', ...claimData })
      
      /*
      const res = await httpPost<any>(`/venues/${id}/claim`, { body: claimData, auth: false })
      return wrapSuccess(res.data)
      */
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'CLAIM_REQUEST_FAILED', message: err.response?.data?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  }
}
