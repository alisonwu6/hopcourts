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
    active_sessions: number
  }
}

export const venuePortalService = {
  /**
   * List all venues managed by the current user.
   */
  async getMyVenues(): Promise<ApiResponse<ManagedVenue[]>> {
    try {
      const res = await httpGet<ManagedVenue[]>('/venue-portal/me/venues')
      return wrapSuccess(res.data)
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
      const res = await httpGet<VenueDashboardData>(`/venue-portal/venues/${venueId}/dashboard`)
      return wrapSuccess(res.data)
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
      const res = await httpGet<any>(`/venue-portal/venues/${venueId}/profile`)
      return wrapSuccess(res.data)
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
      const res = await httpPatch<any>(`/venue-portal/venues/${venueId}/profile`, { body: data })
      return wrapSuccess(res.data)
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
      const res = await httpPost<any>(`/venue-portal/venues/${venueId}/sessions`, { body: payload })
      return wrapSuccess(res.data)
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'CREATE_SESSION_FAILED', message: err.message },
        timestamp: new Date(),
      } as any
    }
  }
}
