import { useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'
import {
  adminVenuesService,
  AdminVenue,
  AdminVenueClaim,
  ClaimStatus,
  VenueStatus,
} from '../services/adminVenuesService'

const VENUE_STATUS_STYLE: Record<VenueStatus, string> = {
  unclaimed: 'bg-slate-100 text-slate-500',
  claim_pending: 'bg-amber-100 text-amber-700',
  claimed: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-red-100 text-red-600',
}

const VENUE_STATUS_LABEL: Record<VenueStatus, string> = {
  unclaimed: 'Unclaimed',
  claim_pending: 'Pending',
  claimed: 'Claimed',
  suspended: 'Suspended',
}

const CLAIM_STATUS_STYLE: Record<ClaimStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
  cancelled: 'bg-slate-100 text-slate-400',
}

const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

type Tab = 'claims' | 'venues'
type ClaimFilter = 'pending' | 'all'
type VenueTab = 'claimed' | 'suspended'

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export function AdminVenueManagementPage() {
  const [tab, setTab] = useState<Tab>('claims')

  const [allClaims, setAllClaims] = useState<AdminVenueClaim[]>([])
  const [claimFilter, setClaimFilter] = useState<ClaimFilter>('pending')
  const [claimsLoading, setClaimsLoading] = useState(true)

  const [venues, setVenues] = useState<AdminVenue[]>([])
  const [venuesLoading, setVenuesLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [venueTab, setVenueTab] = useState<VenueTab>('claimed')

  const [reviewingClaim, setReviewingClaim] = useState<AdminVenueClaim | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [editingVenue, setEditingVenue] = useState<AdminVenue | null>(null)
  const [patchData, setPatchData] = useState({
    name_display: '',
    address_display: '',
    operator_name: '',
    operator_email: '',
    operator_role: '',
    operator_phone: '',
  })
  const [suspendingVenue, setSuspendingVenue] = useState<AdminVenue | null>(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    void fetchClaims()
    void fetchVenues()
  }, [])

  const fetchClaims = async () => {
    setClaimsLoading(true)
    const res = await adminVenuesService.getAdminClaims({ status: 'all' })
    if (res.success && res.data) {
      setAllClaims(res.data)
    }
    setClaimsLoading(false)
  }

  const fetchVenues = async (venueSearch = '') => {
    setVenuesLoading(true)
    const res = await adminVenuesService.getAdminVenues({ search: venueSearch })
    if (res.success && res.data) {
      setVenues(res.data)
    }
    setVenuesLoading(false)
  }

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    void fetchVenues(search)
  }

  const handleApprove = async () => {
    if (!reviewingClaim) return

    setActionLoading(true)
    const res = await adminVenuesService.approveVenueClaim(reviewingClaim.id)
    setActionLoading(false)

    if (!res.success) {
      alert(res.error?.message || 'Approval failed')
      return
    }

    setReviewingClaim(null)
    setRejectReason('')
    void fetchClaims()
    void fetchVenues()
  }

  const handleReject = async () => {
    if (!reviewingClaim) return
    if (!rejectReason.trim()) {
      alert('Enter a rejection reason to proceed.')
      return
    }

    setActionLoading(true)
    const res = await adminVenuesService.rejectVenueClaim(reviewingClaim.id, rejectReason)
    setActionLoading(false)

    if (!res.success) {
      alert(res.error?.message || 'Rejection failed')
      return
    }

    setReviewingClaim(null)
    setRejectReason('')
    void fetchClaims()
    void fetchVenues()
  }

  const handlePatch = async () => {
    if (!editingVenue) return

    setActionLoading(true)
    const res = await adminVenuesService.patchVenueDisplay(editingVenue.id, patchData)
    setActionLoading(false)

    if (!res.success) {
      alert(res.error?.message || 'Update failed')
      return
    }

    setEditingVenue(null)
    void fetchVenues()
  }

  const handleSuspend = async () => {
    if (!suspendingVenue) return
    if (!suspendReason.trim()) {
      alert('Enter a suspension reason to proceed.')
      return
    }

    setActionLoading(true)
    const res = await adminVenuesService.suspendVenue(suspendingVenue.id, suspendReason)
    setActionLoading(false)

    if (!res.success) {
      alert(res.error?.message || 'Suspension failed')
      return
    }

    setSuspendingVenue(null)
    setSuspendReason('')
    void fetchVenues()
  }

  const handleUnsuspend = async (venue: AdminVenue) => {
    if (!window.confirm(`Restore management access for "${venue.name_display}"?`)) return

    const res = await adminVenuesService.unsuspendVenue(venue.id)
    if (!res.success) {
      alert(res.error?.message || 'Restore failed')
      return
    }

    void fetchVenues()
  }

  const pendingCount = allClaims.filter((claim) => claim.status === 'pending').length
  const displayedClaims =
    claimFilter === 'pending' ? allClaims.filter((claim) => claim.status === 'pending') : allClaims

  const claimedCount = venues.filter((v) => v.status === 'claimed').length
  const suspendedCount = venues.filter((v) => v.status === 'suspended').length
  const displayedVenues = venues.filter((v) => v.status === venueTab)

  const reviewClaim = reviewingClaim
  const venueToEdit = editingVenue
  const venueToSuspend = suspendingVenue

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-slate-700" />
                <h1 className="text-xl font-bold text-slate-900">Venue Management</h1>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Manage venue listings and verify operator claims on HopCourts
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-1">
            <button
              onClick={() => setTab('claims')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === 'claims' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              Applications
              {pendingCount > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tab === 'claims' ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-700'}`}
                >
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab('venues')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === 'venues' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              Venues
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6">
        {tab === 'claims' && (
          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">Manager Applications</h2>
                <p className="mt-0.5 text-xs text-slate-400">Review and approve venue operator applications</p>
              </div>

              <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
                {(['pending', 'all'] as ClaimFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setClaimFilter(filter)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${claimFilter === filter ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {filter === 'pending' ? `Pending (${pendingCount})` : 'All History'}
                  </button>
                ))}
              </div>
            </div>

            {claimsLoading ? (
              <div className="py-20 text-center text-sm text-slate-400">Loading…</div>
            ) : displayedClaims.length === 0 ? (
              <div className="py-20 text-center">
                <div className="mb-3 text-4xl">✅</div>
                <p className="font-semibold text-slate-600">All caught up!</p>
                <p className="mt-1 text-xs text-slate-400">All operator applications have been reviewed.</p>
              </div>
            ) : (
              <div>
                {/* Desktop Table */}
                <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="px-5 py-3">Venue</th>
                        <th className="px-5 py-3">Applicant</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Submitted</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedClaims.map((claim) => {
                        const isPending = claim.status === 'pending'
                        return (
                          <tr
                            key={claim.id}
                            className={`${isPending ? 'hover:bg-slate-50/60' : 'opacity-75'}`}
                          >
                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-900">{claim.venue_name}</div>
                              <div className="mt-0.5 text-xs text-slate-500">{claim.venue_address}</div>
                              {claim.note && (
                                <div className="mt-2 rounded-lg bg-slate-50 px-2 py-1 text-[11px] italic text-slate-600">
                                  "{claim.note}"
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-medium text-slate-900">{claim.applicant_name}</div>
                              <div className="mt-0.5 text-xs text-slate-500">{claim.applicant_role}</div>
                              <div className="mt-1 text-[11px] text-slate-500">{claim.applicant_email}</div>
                              <div className="text-[11px] text-slate-400">{claim.applicant_phone}</div>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded px-2 py-1 text-[10px] font-bold uppercase ${CLAIM_STATUS_STYLE[claim.status]}`}
                              >
                                {CLAIM_STATUS_LABEL[claim.status]}
                              </span>
                              {!isPending && claim.reviewed_at && (
                                <div className="mt-1 text-[11px] text-slate-500">
                                  {fmtDateTime(claim.reviewed_at)}
                                  {claim.reviewed_by && <span className="ml-1">({claim.reviewed_by})</span>}
                                </div>
                              )}
                              {claim.status === 'rejected' && claim.rejection_reason && (
                                <div className="mt-2 rounded-md bg-red-50 px-2 py-1 text-[11px] italic text-red-600">
                                  "{claim.rejection_reason}"
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 text-xs text-slate-500">{fmtDateTime(claim.submitted_at)}</td>
                            <td className="px-5 py-4 text-right">
                              {isPending ? (
                                <button
                                  onClick={() => {
                                    setReviewingClaim(claim)
                                    setRejectReason('')
                                  }}
                                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
                                >
                                  Review
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400">Reviewed</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="grid gap-3 md:hidden">
                  {displayedClaims.map((claim) => {
                    const isPending = claim.status === 'pending'
                    return (
                      <div
                        key={claim.id}
                        className={`rounded-2xl border bg-white shadow-sm ${isPending ? 'border-slate-200' : 'border-slate-100 opacity-75'}`}
                      >
                        <div className="flex items-start gap-5 p-5">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-900">{claim.venue_name}</span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${CLAIM_STATUS_STYLE[claim.status]}`}
                              >
                                {CLAIM_STATUS_LABEL[claim.status]}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500">{claim.venue_address}</p>

                            <div className="mt-3 space-y-1 text-xs text-slate-600">
                              <div>
                                <span className="font-semibold text-slate-700">{claim.applicant_name}</span>
                              </div>
                              <div className="text-slate-500">{claim.applicant_role}</div>
                              <div className="text-slate-500">{claim.applicant_email}</div>
                              <div className="text-slate-500">{claim.applicant_phone}</div>
                              <div className="pt-1 text-[10px] text-slate-400">
                                Submitted {fmtDateTime(claim.submitted_at)}
                              </div>
                            </div>

                            {claim.note ? (
                              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs italic text-slate-600">
                                "{claim.note}"
                              </p>
                            ) : (
                              <p className="mt-3 text-[11px] text-slate-300">No supporting note provided.</p>
                            )}

                            {!isPending && claim.reviewed_at && (
                              <div
                                className={`mt-3 rounded-lg px-3 py-2 text-xs ${claim.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : claim.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}
                              >
                                <span className="font-semibold">{CLAIM_STATUS_LABEL[claim.status]}</span>
                                <span className="ml-2">{fmtDateTime(claim.reviewed_at)}</span>
                                {claim.reviewed_by && <span className="ml-2 opacity-70">by {claim.reviewed_by}</span>}
                                {claim.rejection_reason && <p className="mt-1 italic">"{claim.rejection_reason}"</p>}
                              </div>
                            )}

                            {claim.status === 'cancelled' && !claim.reviewed_at && (
                              <p className="mt-2 text-[10px] text-slate-400">Withdrawn by applicant</p>
                            )}
                          </div>

                          {isPending && (
                            <button
                              onClick={() => {
                                setReviewingClaim(claim)
                                setRejectReason('')
                              }}
                              className="flex-shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
                            >
                              Review
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'venues' && (
          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
                {(
                  [
                    { key: 'claimed' as VenueTab, label: 'Claimed', count: claimedCount },
                    { key: 'suspended' as VenueTab, label: 'Suspended', count: suspendedCount },
                  ] as { key: VenueTab; label: string; count: number }[]
                ).map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setVenueTab(key)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${venueTab === key ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {label}
                    {count > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${venueTab === key ? (key === 'suspended' ? 'bg-red-400 text-white' : 'bg-emerald-400 text-slate-900') : key === 'suspended' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleSearch}
              className="mb-5 flex gap-2"
            >
              <input
                type="text"
                placeholder="Search by venue name or ID…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Search
              </button>
            </form>

            {venuesLoading ? (
              <div className="py-20 text-center text-sm text-slate-400">Loading…</div>
            ) : displayedVenues.length === 0 ? (
              <div className="py-20 text-center text-sm text-slate-400">No venues found</div>
            ) : (
              <div className="space-y-3 md:overflow-hidden md:rounded-2xl md:border md:border-slate-200 md:bg-white md:shadow-sm">
                {/* Desktop table */}
                <div className="hidden md:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="px-5 py-3">Venue</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Operator</th>
                        <th className="px-5 py-3">Last Activity</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedVenues.map((venue) => (
                        <tr
                          key={venue.id}
                          className={`hover:bg-slate-50/60 ${venue.status === 'suspended' ? 'bg-red-50/30' : ''}`}
                        >
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900">{venue.name_display}</div>
                            <div className="mt-0.5 font-mono text-[10px] text-slate-300">{venue.id}</div>
                            <div className="mt-0.5 text-xs text-slate-500">{venue.address_display}</div>
                            {venue.suspended_reason && venue.status === 'suspended' && (
                              <div className="mt-1.5 rounded-md bg-red-50 px-2 py-1 text-[10px] text-red-500">
                                {venue.suspended_reason}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${VENUE_STATUS_STYLE[venue.status]}`}
                            >
                              {venue.status === 'claim_pending' && (
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                              )}
                              {VENUE_STATUS_LABEL[venue.status]}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {venue.operator_name || venue.operator_email ? (
                              <>
                                {venue.operator_name && (
                                  <div className="font-medium text-slate-900">{venue.operator_name}</div>
                                )}
                                {venue.operator_role && (
                                  <div className="mt-0.5 text-xs text-slate-500">{venue.operator_role}</div>
                                )}
                                {venue.operator_email && (
                                  <div className="mt-1 text-[11px] text-slate-500">{venue.operator_email}</div>
                                )}
                                {venue.operator_phone && (
                                  <div className="text-[11px] text-slate-400">{venue.operator_phone}</div>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500">
                            {venue.last_activity_at ? fmtDateTime(venue.last_activity_at) : '—'}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col items-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingVenue(venue)
                                  setPatchData({
                                    name_display: venue.name_display,
                                    address_display: venue.address_display,
                                    operator_name: venue.operator_name || '',
                                    operator_email: venue.operator_email || '',
                                    operator_role: venue.operator_role || '',
                                    operator_phone: venue.operator_phone || '',
                                  })
                                }}
                                className="min-w-[92px] rounded-md border border-blue-200 px-2.5 py-1 text-[11px] font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                              >
                                Edit Info
                              </button>

                              {venue.status === 'suspended' ? (
                                <button
                                  onClick={() => void handleUnsuspend(venue)}
                                  className="min-w-[92px] rounded-md border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
                                >
                                  Restore
                                </button>
                              ) : venue.status === 'claimed' ? (
                                <button
                                  onClick={() => {
                                    setSuspendingVenue(venue)
                                    setSuspendReason('')
                                  }}
                                  className="min-w-[92px] rounded-md border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-500 transition-colors hover:bg-red-50"
                                >
                                  Suspend
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="grid gap-3 px-4 py-3 md:hidden">
                  {displayedVenues.map((venue) => (
                    <div
                      key={venue.id}
                      className={`rounded-xl border border-slate-200 p-4 ${venue.status === 'suspended' ? 'bg-red-50/30' : 'bg-white'}`}
                    >
                      {/* Venue info */}
                      <div className="mb-3 border-b border-slate-100 pb-3">
                        <div className="font-semibold text-slate-900">{venue.name_display}</div>
                        <div className="mt-0.5 font-mono text-[10px] text-slate-300">{venue.id}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{venue.address_display}</div>
                        {venue.suspended_reason && venue.status === 'suspended' && (
                          <div className="mt-1.5 rounded-md bg-red-50 px-2 py-1 text-[10px] text-red-500">
                            {venue.suspended_reason}
                          </div>
                        )}
                      </div>

                      {/* Status and operator */}
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                          <span
                            className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${VENUE_STATUS_STYLE[venue.status]}`}
                          >
                            {venue.status === 'claim_pending' && (
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                            )}
                            {VENUE_STATUS_LABEL[venue.status]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operator</p>
                          <div className="mt-1">
                            {venue.operator_name || venue.operator_email ? (
                              <>
                                {venue.operator_name && (
                                  <div className="text-xs font-medium text-slate-900">{venue.operator_name}</div>
                                )}
                                {venue.operator_role && (
                                  <div className="text-[11px] text-slate-500">{venue.operator_role}</div>
                                )}
                                {venue.operator_email && (
                                  <div className="mt-0.5 text-[10px] text-slate-500">{venue.operator_email}</div>
                                )}
                                {venue.operator_phone && (
                                  <div className="text-[10px] text-slate-400">{venue.operator_phone}</div>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Last activity */}
                      <div className="mb-3 border-b border-slate-100 pb-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Activity</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {venue.last_activity_at ? fmtDateTime(venue.last_activity_at) : '—'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setEditingVenue(venue)
                            setPatchData({
                              name_display: venue.name_display,
                              address_display: venue.address_display,
                              operator_name: venue.operator_name || '',
                              operator_email: venue.operator_email || '',
                              operator_role: venue.operator_role || '',
                              operator_phone: venue.operator_phone || '',
                            })
                          }}
                          className="w-full rounded-md border border-blue-200 px-2.5 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                        >
                          Edit Info
                        </button>

                        {venue.status === 'suspended' ? (
                          <button
                            onClick={() => void handleUnsuspend(venue)}
                            className="w-full rounded-md border border-emerald-200 px-2.5 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
                          >
                            Restore
                          </button>
                        ) : venue.status === 'claimed' ? (
                          <button
                            onClick={() => {
                              setSuspendingVenue(venue)
                              setSuspendReason('')
                            }}
                            className="w-full rounded-md border border-red-200 px-2.5 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                          >
                            Suspend
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {reviewClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 pb-4 pt-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Review Claim</h2>
                <p className="mt-0.5 font-mono text-[10px] text-slate-400">{reviewClaim.id}</p>
              </div>
              <button
                onClick={() => setReviewingClaim(null)}
                className="text-lg leading-none text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Venue</p>
                <p className="font-semibold text-slate-900">{reviewClaim.venue_name}</p>
                <p className="text-xs text-slate-500">{reviewClaim.venue_address}</p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Applicant</p>
                <div className="space-y-1.5 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name</span>
                    <span className="font-medium text-slate-800">{reviewClaim.applicant_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role</span>
                    <span className="font-medium text-slate-800">{reviewClaim.applicant_role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email</span>
                    <span className="font-medium text-slate-800">{reviewClaim.applicant_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone</span>
                    <span className="font-medium text-slate-800">{reviewClaim.applicant_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Submitted</span>
                    <span className="font-medium text-slate-800">{fmtDateTime(reviewClaim.submitted_at)}</span>
                  </div>
                </div>
              </div>

              {reviewClaim.note ? (
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Applicant Note / Proof
                  </p>
                  <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm italic text-slate-600">"{reviewClaim.note}"</p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-400">
                  No supporting note provided by applicant.
                </div>
              )}

              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Rejection Reason <span className="normal-case text-slate-300">(required only when rejecting)</span>
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="e.g. Unable to verify identity or ownership of this venue…"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 px-6 pb-6">
              <button
                onClick={() => setReviewingClaim(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleReject()}
                disabled={actionLoading}
                className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => void handleApprove()}
                disabled={actionLoading}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing…' : 'Approve ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {venueToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 pb-4 pt-6">
              <h2 className="text-lg font-bold text-slate-900">Edit Venue Info</h2>
              <button
                onClick={() => setEditingVenue(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Display Name
                </label>
                <input
                  type="text"
                  value={patchData.name_display}
                  onChange={(event) => setPatchData({ ...patchData, name_display: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Display Address
                </label>
                <textarea
                  value={patchData.address_display}
                  onChange={(event) => setPatchData({ ...patchData, address_display: event.target.value })}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                />
              </div>

              <div className="border-t border-slate-100 pt-2">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Operator Details</p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Name
                    </label>
                    <input
                      type="text"
                      value={patchData.operator_name}
                      onChange={(event) => setPatchData({ ...patchData, operator_name: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Role
                    </label>
                    <input
                      type="text"
                      value={patchData.operator_role}
                      onChange={(event) => setPatchData({ ...patchData, operator_role: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Email
                    </label>
                    <input
                      type="email"
                      value={patchData.operator_email}
                      onChange={(event) => setPatchData({ ...patchData, operator_email: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={patchData.operator_phone}
                      onChange={(event) => setPatchData({ ...patchData, operator_phone: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 px-6 pb-6">
              <button
                onClick={() => setEditingVenue(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => void handlePatch()}
                disabled={actionLoading}
                className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {actionLoading ? 'Updating' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {venueToSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 pb-4 pt-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Suspend Venue</h2>
                <p className="mt-0.5 text-xs text-slate-400">{venueToSuspend.name_display}</p>
              </div>
              <button
                onClick={() => setSuspendingVenue(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">
                Suspending a venue removes operator access until it is restored.
              </div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Suspension Reason <span className="normal-case text-slate-300">(required)</span>
              </label>
              <textarea
                value={suspendReason}
                onChange={(event) => setSuspendReason(event.target.value)}
                placeholder="e.g. Multiple user complaints under investigation…"
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 px-6 pb-6">
              <button
                onClick={() => setSuspendingVenue(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSuspend()}
                disabled={actionLoading}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing…' : 'Confirm Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
