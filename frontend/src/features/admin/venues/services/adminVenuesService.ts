import { ApiResponse } from '@/types'

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

// ─── Mock data (in-memory, resets on page refresh) ────────────────────────────

let mockVenues: AdminVenue[] = [
  {
    id: 'v-brisbane-001',
    name_display: '33 Brodie St Court',
    address_display: '33 Brodie Street, Brisbane QLD 4000',
    status: 'claimed',
    operator_name: 'Dave Okafor',
    operator_email: 'owner@brodiestcourt.com',
    operator_role: 'Owner',
    operator_phone: '+61 7 3215 6789',
    last_activity_at: daysAgo(1),
  },
  {
    id: 'v-brisbane-002',
    name_display: 'Southside Sports Hall',
    address_display: '12 River Rd, South Brisbane QLD 4101',
    status: 'claim_pending',
    last_activity_at: daysAgo(2),
  },
  {
    id: 'v-brisbane-003',
    name_display: 'Northside Tennis Centre',
    address_display: '88 Eagle St, Fortitude Valley QLD 4006',
    status: 'unclaimed',
    last_activity_at: daysAgo(10),
  },
  {
    id: 'v-brisbane-004',
    name_display: 'Valley Badminton Club',
    address_display: '22 Brunswick St, Fortitude Valley QLD 4006',
    status: 'suspended',
    operator_name: 'Admin Team',
    operator_email: 'admin@valleybadminton.com',
    operator_role: 'Operations',
    operator_phone: '+61 7 4444 4444',
    last_activity_at: daysAgo(5),
    suspended_reason: 'Multiple user complaints about misleading event descriptions. Under investigation.',
  },
]

let mockClaims: AdminVenueClaim[] = [
  {
    id: 'claim-pending-001',
    venue_id: 'v-brisbane-002',
    venue_name: 'Southside Sports Hall',
    venue_address: '12 River Rd, South Brisbane QLD 4101',
    applicant_name: 'Sam Chen',
    applicant_email: 'sam@southsidehall.com',
    applicant_role: 'Venue Manager',
    applicant_phone: '+61 7 3123 4567',
    note: 'I have been managing this hall for the past 3 years as the facility director. Happy to provide ID and council lease agreement.',
    status: 'pending',
    submitted_at: daysAgo(2),
  },
  {
    id: 'claim-pending-002',
    venue_id: 'v-brisbane-003',
    venue_name: 'Northside Tennis Centre',
    venue_address: '88 Eagle St, Fortitude Valley QLD 4006',
    applicant_name: 'Lisa Park',
    applicant_email: 'lisa.park@ntc.com.au',
    applicant_role: 'Operations Director',
    applicant_phone: '+61 7 3890 2341',
    note: '',
    status: 'pending',
    submitted_at: daysAgo(1),
  },
  {
    id: 'claim-approved-001',
    venue_id: 'v-brisbane-001',
    venue_name: '33 Brodie St Court',
    venue_address: '33 Brodie Street, Brisbane QLD 4000',
    applicant_name: 'Dave Okafor',
    applicant_email: 'owner@brodiestcourt.com',
    applicant_role: 'Owner',
    applicant_phone: '+61 7 3215 6789',
    note: 'I am the registered owner. Lease docs attached.',
    status: 'approved',
    submitted_at: daysAgo(30),
    reviewed_at: daysAgo(28),
    reviewed_by: 'admin@sportsmatch.com',
  },
  {
    id: 'claim-rejected-001',
    venue_id: 'v-brisbane-003',
    venue_name: 'Northside Tennis Centre',
    venue_address: '88 Eagle St, Fortitude Valley QLD 4006',
    applicant_name: 'Fake Operator',
    applicant_email: 'fake@scam.io',
    applicant_role: 'Staff',
    applicant_phone: '+61 9999 9999',
    note: 'I want to manage this venue.',
    status: 'rejected',
    submitted_at: daysAgo(15),
    reviewed_at: daysAgo(14),
    reviewed_by: 'admin@sportsmatch.com',
    rejection_reason: 'Unable to verify identity or any connection to this venue.',
  },
  {
    id: 'claim-cancelled-001',
    venue_id: 'v-brisbane-002',
    venue_name: 'Southside Sports Hall',
    venue_address: '12 River Rd, South Brisbane QLD 4101',
    applicant_name: 'Marcus Brown',
    applicant_email: 'marcus@outlook.com',
    applicant_role: 'Consultant',
    applicant_phone: '+61 7 3567 1234',
    note: '',
    status: 'cancelled',
    submitted_at: daysAgo(20),
  },
]

// ─── Service ──────────────────────────────────────────────────────────────────

export const adminVenuesService = {
  async getAdminVenues(params: { search?: string } = {}): Promise<ApiResponse<AdminVenue[]>> {
    await wait()
    const keyword = (params.search || '').trim().toLowerCase()
    const rows = keyword
      ? mockVenues.filter(
          (v) =>
            v.name_display.toLowerCase().includes(keyword) ||
            v.id.toLowerCase().includes(keyword) ||
            v.address_display.toLowerCase().includes(keyword),
        )
      : mockVenues
    return wrapSuccess([...rows])
  },

  async getAdminClaims(params: { status?: ClaimStatus | 'all' } = {}): Promise<ApiResponse<AdminVenueClaim[]>> {
    await wait()
    const rows =
      !params.status || params.status === 'all'
        ? mockClaims
        : mockClaims.filter((c) => c.status === params.status)
    return wrapSuccess([...rows])
  },

  async approveVenueClaim(claimId: string): Promise<ApiResponse<{ claimId: string }>> {
    await wait()
    const claim = mockClaims.find((c) => c.id === claimId)
    if (!claim) return wrapError('NOT_FOUND', 'Claim not found')

    mockClaims = mockClaims.map((c) =>
      c.id === claimId ? { ...c, status: 'approved', reviewed_at: new Date().toISOString() } : c,
    )
    mockVenues = mockVenues.map((v) =>
      v.id === claim.venue_id
        ? { 
            ...v, 
            status: 'claimed', 
            operator_name: claim.applicant_name,
            operator_email: claim.applicant_email,
            operator_role: claim.applicant_role,
            operator_phone: claim.applicant_phone
          }
        : v,
    )
    return wrapSuccess({ claimId })
  },

  async rejectVenueClaim(claimId: string, reason: string): Promise<ApiResponse<{ claimId: string }>> {
    await wait()
    if (!reason?.trim()) return wrapError('VALIDATION', 'Rejection reason is required')
    const claim = mockClaims.find((c) => c.id === claimId)
    if (!claim) return wrapError('NOT_FOUND', 'Claim not found')

    mockClaims = mockClaims.map((c) =>
      c.id === claimId ? { ...c, status: 'rejected', reviewed_at: new Date().toISOString() } : c,
    )
    mockVenues = mockVenues.map((v) =>
      v.id === claim.venue_id ? { ...v, status: 'unclaimed' } : v,
    )
    return wrapSuccess({ claimId })
  },

  async patchVenueDisplay(
    venueId: string,
    data: { 
      name_display?: string; 
      address_display?: string;
      operator_name?: string;
      operator_email?: string;
      operator_role?: string;
      operator_phone?: string;
    },
  ): Promise<ApiResponse<AdminVenue>> {
    await wait()
    mockVenues = mockVenues.map((v) =>
      v.id !== venueId
        ? v
        : {
            ...v,
            name_display: data.name_display ?? v.name_display,
            address_display: data.address_display ?? v.address_display,
            operator_name: data.operator_name !== undefined ? data.operator_name : v.operator_name,
            operator_email: data.operator_email !== undefined ? data.operator_email : v.operator_email,
            operator_role: data.operator_role !== undefined ? data.operator_role : v.operator_role,
            operator_phone: data.operator_phone !== undefined ? data.operator_phone : v.operator_phone,
          },
    )
    const updated = mockVenues.find((v) => v.id === venueId)!
    return wrapSuccess(updated)
  },

  async suspendVenue(venueId: string, reason: string): Promise<ApiResponse<{ venueId: string }>> {
    await wait()
    if (!reason?.trim()) return wrapError('VALIDATION', 'Suspension reason is required')
    mockVenues = mockVenues.map((v) =>
      v.id === venueId ? { ...v, status: 'suspended', suspended_reason: reason } : v,
    )
    return wrapSuccess({ venueId })
  },

  async unsuspendVenue(venueId: string): Promise<ApiResponse<{ venueId: string }>> {
    await wait()
    mockVenues = mockVenues.map((v) =>
      v.id === venueId ? { ...v, status: 'claimed', suspended_reason: undefined } : v,
    )
    return wrapSuccess({ venueId })
  },
}
