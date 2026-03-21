import { ApiResponse } from '@/types'
import { httpGet, httpPatch, httpPost } from '@/api/http'

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
    active_events: number
    participants_this_week: number
    players_played_here: number
  }
}

export const venuePortalService = {
  /**
   * List all venues managed by the current user.
   */
  async getMyVenues(): Promise<ApiResponse<ManagedVenue[]>> {
    try {
      // Mock API for frontend flow
      await new Promise(resolve => setTimeout(resolve, 500))
      return wrapSuccess([
        {
          id: '525643ea-df39-4f1b-b57a-eb71e9f1fa16',
          name_display: 'ABC Sports Center',
          address_display: '33 Brodie St, Brisbane QLD 4000',
          status: 'active',
          claim_status: 'approved'
        }
      ])
      /*
      const res = await httpGet<ManagedVenue[]>('/venue-portal/me/venues')
      return wrapSuccess(res.data)
      */
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_MY_VENUES_FAILED', message: err.message },
        timestamp: new Date(),
      } as any
    }
  },

  /**
   * Get dashboard statistics for a specific venue.
   */
  async getVenueDashboard(venueId: string): Promise<ApiResponse<VenueDashboardData>> {
    try {
      // Mock API for frontend flow
      await new Promise(resolve => setTimeout(resolve, 300))
      return wrapSuccess({
        venue: {
          id: venueId,
          name_display: 'ABC Sports Center',
          address_display: '33 Brodie St, Brisbane QLD 4000',
          status: 'active',
          claim_status: 'approved'
        },
        claim_info: {},
        stats: {
          active_events: 3,
          participants_this_week: 42,
          players_played_here: 126
        }
      })
      /*
      const res = await httpGet<VenueDashboardData>(`/venue-portal/venues/${venueId}/dashboard`)
      return wrapSuccess(res.data)
      */
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_VENUE_DASHBOARD_FAILED', message: err.message },
        timestamp: new Date(),
      } as any
    }
  },

  /**
   * Get venue profile details.
   */
  async getVenueProfile(venueId: string): Promise<ApiResponse<any>> {
    try {
      // Mock API for frontend flow
      await new Promise(resolve => setTimeout(resolve, 300))
      return wrapSuccess({
        id: venueId,
        logo_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200',
        description: 'Premium sports facility with indoor and outdoor courts.',
        amenities: ['Parking', 'Restrooms', 'Night lighting'],
        operating_hours: [
          { day: 'Monday', open_time: '06:00', close_time: '22:00', is_closed: false },
          { day: 'Tuesday', open_time: '06:00', close_time: '22:00', is_closed: false },
          { day: 'Wednesday', open_time: '06:00', close_time: '22:00', is_closed: false },
          { day: 'Thursday', open_time: '06:00', close_time: '22:00', is_closed: false },
          { day: 'Friday', open_time: '06:00', close_time: '22:00', is_closed: false },
          { day: 'Saturday', open_time: '06:00', close_time: '22:00', is_closed: false },
          { day: 'Sunday', open_time: '06:00', close_time: '22:00', is_closed: false }
        ],
        social_links: {}
      })
      /*
      const res = await httpGet<any>(`/venue-portal/venues/${venueId}/profile`)
      return wrapSuccess(res.data)
      */
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_PROFILE_FAILED', message: err.message },
        timestamp: new Date(),
      } as any
    }
  },

  /**
   * Update venue profile branding. 
   */
  async updateVenueProfile(venueId: string, data: any): Promise<ApiResponse<any>> {
    try {
      // Mock API for frontend flow
      console.log('Updating Venue Profile:', venueId, data)
      await new Promise(resolve => setTimeout(resolve, 800))
      return wrapSuccess({ success: true })
      /*
      const res = await httpPatch<any>(`/venue-portal/venues/${venueId}/profile`, { body: data })
      return wrapSuccess(res.data)
      */
    } catch (err: any) {
       return {
        success: false,
        error: { code: 'UPDATE_PROFILE_FAILED', message: err.message },
        timestamp: new Date(),
      } as any
    }
  },

  /**
   * Create an official session for the venue.
   */
  async createOfficialSession(venueId: string, payload: any): Promise<ApiResponse<any>> {
    try {
      // Mock API for frontend flow
      await new Promise(resolve => setTimeout(resolve, 500))
      return wrapSuccess({ success: true })
      /*
      const res = await httpPost<any>(`/venue-portal/venues/${venueId}/sessions`, { body: payload })
      return wrapSuccess(res.data)
      */
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'CREATE_SESSION_FAILED', message: err.message },
        timestamp: new Date(),
      } as any
    }
  }
}
