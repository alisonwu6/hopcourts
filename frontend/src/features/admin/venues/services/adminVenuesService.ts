import { ApiResponse } from '@/types'
import { httpGet, httpPost, httpPatch } from '@/api/http'

const wrapSuccess = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date(),
})

export const adminVenuesService = {
  async getAdminVenues(params: { search?: string, limit?: number, offset?: number }): Promise<ApiResponse<any[]>> {
    try {
      const res = await httpGet<any>(`/admin/venues`, { params })
      return wrapSuccess(res.data)
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'FETCH_ADMIN_VENUES_FAILED', message: err.message },
        timestamp: new Date(),
      } as any
    }
  },

  async revokeVenueClaim(claimId: string, reason: string): Promise<ApiResponse<any>> {
    try {
      const res = await httpPost<any>(`/admin/venue-claims/${claimId}/revoke`, { body: { reason } })
      return wrapSuccess(res.data)
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'REVOKE_CLAIM_FAILED', message: err.message },
        timestamp: new Date(),
      } as any
    }
  },

  async patchVenueDisplay(venueId: string, data: { name_display?: string, address_display?: string }): Promise<ApiResponse<any>> {
    try {
      const res = await httpPatch<any>(`/admin/venues/${venueId}`, { body: data })
      return wrapSuccess(res.data)
    } catch (err: any) {
      return {
        success: false,
        error: { code: 'PATCH_VENUE_FAILED', message: err.message },
        timestamp: new Date(),
      } as any
    }
  }
}
