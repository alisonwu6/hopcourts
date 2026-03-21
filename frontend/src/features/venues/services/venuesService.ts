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
      // Mock for frontend flow
      await new Promise(resolve => setTimeout(resolve, 300))
      const items: ApiVenue[] = [
        {
          id: '525643ea-df39-4f1b-b57a-eb71e9f1fa16',
          name_display: 'ABC Sports Center',
          address_display: '33 Brodie St, Brisbane QLD 4000',
          lat: -27.4698,
          lng: 153.0251,
          status: 'claimed',
          logo_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200',
          active_sessions_count: 5,
          created_at: new Date().toISOString()
        },
        {
          id: 'unclaimed-venue-1',
          name_display: '33 Brodie St',
          address_display: '33 brodie street',
          lat: -27.4699,
          lng: 153.0252,
          status: 'unclaimed',
          active_sessions_count: 0,
          created_at: new Date().toISOString()
        }
      ]
      
      return wrapSuccess({
        data: items,
        total: items.length,
        page: 1,
        pageSize: items.length,
        hasMore: false,
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
      // Mock for specific venue to show portal integration
      if (id === '525643ea-df39-4f1b-b57a-eb71e9f1fa16') {
        await new Promise(resolve => setTimeout(resolve, 300))
        return wrapSuccess({
          id,
          name_display: 'ABC Sports Center',
          address_display: '33 Brodie St, Brisbane QLD 4000',
          lat: -27.4698,
          lng: 153.0251,
          status: 'claimed',
          logo_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200',
          description: 'Premium sports facility featuring world-class indoor and outdoor courts. We provide a safe, high-energy environment for athletes of all levels to train, compete, and connect.',
          amenities: ['Parking', 'Restrooms', 'Night lighting', 'Showers', 'Wi-Fi', 'Contactless pay'],
          operating_hours: [
            { day: 'Monday', open_time: '06:00', close_time: '22:00', is_closed: false },
            { day: 'Tuesday', open_time: '06:00', close_time: '22:00', is_closed: false },
            { day: 'Wednesday', open_time: '06:00', close_time: '22:00', is_closed: false },
            { day: 'Thursday', open_time: '06:00', close_time: '22:00', is_closed: false },
            { day: 'Friday', open_time: '06:00', close_time: '22:00', is_closed: false },
            { day: 'Saturday', open_time: '08:00', close_time: '20:00', is_closed: false },
            { day: 'Sunday', open_time: '08:00', close_time: '18:00', is_closed: false }
          ],
          active_sessions_count: 5,
          created_at: new Date().toISOString()
        })
      }

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
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'CLAIM_REQUEST_FAILED', message: err.response?.data?.error || err.message },
        timestamp: new Date(),
      } as any
    }
  }
}
