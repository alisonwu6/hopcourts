import { useState, useEffect, useRef, useMemo } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { BadgeCheck, Plus, ShieldX } from 'lucide-react'
import { venuePortalService, ManagedVenue } from '../services/venuePortalService'
import { VenueBottomNav } from '../components/VenueBottomNav'

export interface VenuePortalOutletCtx {
  venues: ManagedVenue[]
  activeVenue: ManagedVenue | null
  setActiveVenueId: (id: string) => void
}

function daysUntil(dateStr?: string | null) {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function formatTrialEnd(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function VenuePortalLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { venueId } = useParams<{ venueId: string }>()

  const [venues, setVenues] = useState<ManagedVenue[]>([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const didFetch = useRef(false)

  useEffect(() => {
    if (didFetch.current) return
    didFetch.current = true
    fetchVenues()
  }, [])

  useEffect(() => {
    if (venueId && venues.length > 0) {
      const owned = venues.some((v) => v.id === venueId)
      if (!owned) setUnauthorized(true)
    }
  }, [venueId, venues])

  const fetchVenues = async () => {
    setLoading(true)
    try {
      const res = await venuePortalService.getMyVenues()

      if (res.success && res.data && res.data.length > 0) {
        setVenues(res.data)
        if (!venueId) {
          navigate(`/admin/${res.data[0].id}`, { replace: true })
        }
      } else if (venueId) {
        const profileRes = await venuePortalService.getVenueProfile(venueId)
        if (profileRes.success && profileRes.data) {
          setVenues([
            {
              id: venueId,
              name_display: profileRes.data.name_display || 'My Venue',
              address_display: profileRes.data.address_display || '',
              status: 'claimed',
              claim_status: 'approved',
            },
          ])
        } else {
          navigate('/', { replace: true })
        }
      } else {
        navigate('/', { replace: true })
      }
    } catch {
      // Reset the guard so a remount (e.g. after reconnect) can retry.
      didFetch.current = false
      navigate('/', { replace: true })
    }
    setLoading(false)
  }

  const setActiveVenueId = (id: string) => navigate(`/admin/${id}`)

  const activeVenue = useMemo(
    () => venues.find((v) => v.id === venueId) ?? venues[0] ?? null,
    [venues, venueId]
  )

  const isDashboard =
    !pathname.includes('/schedule') &&
    !pathname.includes('/profile') &&
    !pathname.includes('/sessions')
  const isSchedule = pathname.includes('/schedule')

  const pageSubtitle = useMemo(() => {
    if (pathname.includes('/sessions/create')) return 'Create event'
    if (pathname.includes('/schedule')) return activeVenue?.name_display || 'Schedule'
    if (pathname.includes('/profile')) return 'Venue profile'
    return 'Venue dashboard'
  }, [pathname, activeVenue?.name_display])

  const pageTitle = useMemo(() => {
    if (pathname.includes('/schedule')) return 'Court schedule'
    return activeVenue?.name_display ?? 'My Venue'
  }, [pathname, activeVenue?.name_display])

  const trialEndsAt = activeVenue?.trial_ends_at
  const daysLeft = daysUntil(trialEndsAt)

  if (unauthorized) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#f5f7f0] px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <ShieldX className="h-7 w-7 text-red-400" />
        </div>
        <h1 className="text-base font-black uppercase tracking-widest text-slate-800">Access Denied</h1>
        <p className="max-w-xs text-sm text-slate-500">
          You don't have permission to manage this venue.
        </p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="mt-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white"
        >
          Go Home
        </button>
      </div>
    )
  }

  // Always render the shell — header and bottom nav are never blocked by loading.
  // The content area shows a spinner only during the very first fetch (venues === []).
  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-[1024px] bg-[#f5f7f0] font-sans text-slate-900">
      {/* Persistent header — stays mounted across all tab navigations */}
      <header className="px-5 pb-3 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {venues.length > 1 ? (
              <div className="relative inline-block">
                <h1 className="text-2xl font-black leading-tight text-[#1A3A0A]">{pageTitle}</h1>
                <select
                  value={venueId ?? ''}
                  onChange={(e) => setActiveVenueId(e.target.value)}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name_display}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <h1 className="text-2xl font-black leading-tight text-[#1A3A0A]">{pageTitle}</h1>
            )}
            <p className="mt-0.5 text-sm font-semibold text-[#5a7a2a]">{pageSubtitle}</p>
          </div>

          {isSchedule ? (
            <button
              type="button"
              onClick={() => venueId && navigate(`/admin/${venueId}/sessions/create`)}
              className="flex-none rounded-2xl border border-slate-300 bg-white px-5 py-3 text-lg font-semibold text-slate-950 shadow-sm transition hover:bg-slate-50 active:scale-95"
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="h-5 w-5 text-slate-500" /> Add slot
              </span>
            </button>
          ) : isDashboard && (
            <button
              type="button"
              onClick={() => venueId && window.open(`/venues/${venueId}`, '_blank')}
              className="flex-none rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
            >
              Public page ↗
            </button>
          )}
        </div>

        {isDashboard && daysLeft !== null && (
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#1A3A0A] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#2d5a1a]">
                <BadgeCheck className="h-4 w-4 text-[#a8d060]" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Official trial active</p>
                {trialEndsAt && (
                  <p className="text-xs text-[#a8d060]/80">
                    Ends {formatTrialEnd(trialEndsAt)} · reminder at 3 days
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black leading-none text-[#c8f060]">{daysLeft}</span>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#a8d060]/80">days left</p>
            </div>
          </div>
        )}
      </header>

      {/* Content — only this area changes on navigation */}
      <div className="pb-24">
        {loading && venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="mb-3 h-7 w-7 animate-spin rounded-full border-4 border-[#3c4a22] border-t-transparent" />
            <p className="text-sm font-semibold text-slate-400">Loading your venue…</p>
          </div>
        ) : (
          <Outlet context={{ venues, activeVenue, setActiveVenueId } satisfies VenuePortalOutletCtx} />
        )}
      </div>

      <VenueBottomNav venueId={venueId ?? activeVenue?.id ?? null} />
    </div>
  )
}
