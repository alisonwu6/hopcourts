import { ApiResponse } from '@/types'
import { httpGet } from '@/api/http'
import { httpPatch, httpPost } from '@/api/http'

// ─── Types ────────────────────────────────────────────────────────────────────

export type VenueStatus = 'unclaimed' | 'claim_pending' | 'claimed' | 'suspended'
export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface AdminVenue {
  id: string
  name_display: string
  address_display: string
  status: VenueStatus
  operator_name?: string
  operator_email?: string
  operator_role?: string
  operator_phone?: string
  last_activity_at?: string
  suspended_reason?: string
}

export interface AdminVenueClaim {
  id: string
  venue_id: string
  venue_name: string
  venue_address: string
  applicant_name: string
  applicant_email: string
  applicant_role: string
  applicant_phone: string
  note?: string
  status: ClaimStatus
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const wrapSuccess = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date(),
})

const wrapError = (code: string, message: string): ApiResponse<never> =>
  ({ success: false, error: { code, message }, timestamp: new Date() }) as any

const wait = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms))
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()

// ─── Service ──────────────────────────────────────────────────────────────────

const mapBackendVenueToAdmin = (row: any): AdminVenue => {
  // Derive status based on venue status and claim status
  let status: VenueStatus = 'unclaimed'
  if (row.status === 'suspended') {
    status = 'suspended'
  } else if (row.claim_status === 'approved') {
    status = 'claimed'
  } else if (row.pending_claim_id) {
    status = 'claim_pending'
  }

  // Extract operator info from approved claim
  const operator_email = row.claim_status === 'approved' ? row.contact_email : undefined
  const operator_name = row.claim_status === 'approved' ? row.contact_person || row.contact_name : undefined

  return {
    id: row.id,
    name_display: row.name_display || row.name,
    address_display: row.address || '',
    status,
    operator_email,
    operator_name,
    operator_role: row.claim_status === 'approved' ? row.contact_title : undefined,
    operator_phone: row.claim_status === 'approved' ? row.contact_phone : undefined,
    suspended_reason: row.suspended_reason,
    last_activity_at: row.last_activity_at,
  }
}

const mapBackendClaimToAdmin = (row: any): AdminVenueClaim => {
  return {
    id: row.id,
    venue_id: row.venue_id,
    venue_name: row.venue_name || '',
    venue_address: row.venue_address || '',
    applicant_name: row.applicant_name || '',
    applicant_email: row.applicant_email || '',
    applicant_role: row.applicant_role || '',
    applicant_phone: row.applicant_phone || '',
    note: row.note,
    status: row.status as ClaimStatus,
    submitted_at: row.submitted_at,
    reviewed_at: row.reviewed_at,
    reviewed_by: row.reviewed_by,
    rejection_reason: row.rejection_reason,
  }
}
export const adminVenuesService = {
  async getAdminVenues(params: { search?: string } = {}): Promise<ApiResponse<AdminVenue[]>> {
    try {
      const data = await httpGet<any>('/admin/venues', {
        params: {
          search: params.search || '',
        },
      })

      if (!data.success || !data.data) {
        return wrapError('API_ERROR', 'Failed to fetch venues')
      }

      // Map backend response to frontend type
      const venues = data.data.map(mapBackendVenueToAdmin)
      return wrapSuccess(venues)
    } catch (error) {
      console.error('Failed to fetch admin venues:', error)
      return wrapError('FETCH_ERROR', error instanceof Error ? error.message : 'Unknown error')
    }
  },

  async getAdminClaims(params: { status?: ClaimStatus | 'all' } = {}): Promise<ApiResponse<AdminVenueClaim[]>> {
    try {
      const data = await httpGet<any>('/admin/venue-claims', {
        params: {
          status: params.status && params.status !== 'all' ? params.status : '',
        },
      })

      if (!data.success || !data.data) {
        return wrapError('API_ERROR', 'Failed to fetch claims')
      }

      // Map backend response to frontend type
      const claims = data.data.map(mapBackendClaimToAdmin)
      return wrapSuccess(claims)
    } catch (error) {
      console.error('Failed to fetch admin claims:', error)
      return wrapError('FETCH_ERROR', error instanceof Error ? error.message : 'Unknown error')
    }
  },

  async approveVenueClaim(claimId: string): Promise<ApiResponse<{ claimId: string }>> {
    try {
      const claimData = await httpGet<any>(`/admin/venue-claims`, {
        params: { status: 'pending' },
      })

      const claim = claimData?.data?.find((row: any) => row.id === claimId)
      if (!claim || !claim.applicant_email) {
        return wrapError('NOT_FOUND', 'Claim or applicant email not found')
      }

      const data = await httpPost<any>(`/admin/venue-claims/${claimId}/approve`, {
        body: { officialEmail: claim.applicant_email },
      })

      if (!data.success) {
        return wrapError('API_ERROR', data.error?.message || 'Failed to approve claim')
      }

      return wrapSuccess({ claimId })
    } catch (error) {
      return wrapError('FETCH_ERROR', error instanceof Error ? error.message : 'Unknown error')
    }
  },

  async rejectVenueClaim(claimId: string, reason: string): Promise<ApiResponse<{ claimId: string }>> {
    if (!reason?.trim()) return wrapError('VALIDATION', 'Rejection reason is required')

    try {
      const data = await httpPost<any>(`/admin/venue-claims/${claimId}/reject`, {
        body: { reason: reason.trim() },
      })

      if (!data.success) {
        return wrapError('API_ERROR', data.error?.message || 'Failed to reject claim')
      }

      return wrapSuccess({ claimId })
    } catch (error) {
      return wrapError('FETCH_ERROR', error instanceof Error ? error.message : 'Unknown error')
    }
  },

  async patchVenueDisplay(
    venueId: string,
    data: {
      name_display?: string
      address_display?: string
      operator_name?: string
      operator_email?: string
      operator_role?: string
      operator_phone?: string
    }
  ): Promise<ApiResponse<AdminVenue>> {
    try {
      const payload = {
        name_display: data.name_display,
        address_display: data.address_display,
        operator_name: data.operator_name,
        operator_email: data.operator_email,
        operator_role: data.operator_role,
        operator_phone: data.operator_phone,
      }

      const result = await httpPatch<any>(`/admin/venues/${venueId}`, { body: payload })
      if (!result.success || !result.data) {
        return wrapError('API_ERROR', 'Failed to patch venue')
      }

      const updated: AdminVenue = {
        id: result.data.id,
        name_display: result.data.name_display || '',
        address_display: result.data.address || '',
        status: (result.data.status || 'unclaimed') as VenueStatus,
        operator_name: data.operator_name,
        operator_email: data.operator_email,
        operator_role: data.operator_role,
        operator_phone: data.operator_phone,
      }
      return wrapSuccess(updated)
    } catch (error) {
      return wrapError('FETCH_ERROR', error instanceof Error ? error.message : 'Unknown error')
    }
  },

  async suspendVenue(venueId: string, reason: string): Promise<ApiResponse<{ venueId: string }>> {
    if (!reason?.trim()) return wrapError('VALIDATION', 'Suspension reason is required')
    try {
      const data = await httpPost<any>(`/admin/venues/${venueId}/suspend`, {
        body: { reason: reason.trim() },
      })

      if (!data.success) {
        return wrapError('API_ERROR', data.error?.message || 'Failed to suspend venue')
      }

      return wrapSuccess({ venueId })
    } catch (error) {
      return wrapError('FETCH_ERROR', error instanceof Error ? error.message : 'Unknown error')
    }
  },

  async unsuspendVenue(venueId: string): Promise<ApiResponse<{ venueId: string }>> {
    try {
      const data = await httpPost<any>(`/admin/venues/${venueId}/unsuspend`)

      if (!data.success) {
        return wrapError('API_ERROR', data.error?.message || 'Failed to restore venue')
      }

      return wrapSuccess({ venueId })
    } catch (error) {
      return wrapError('FETCH_ERROR', error instanceof Error ? error.message : 'Unknown error')
    }
  },
}
