import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { venuePortalService, ManagedVenue, VenueDashboardData } from '../services/venuePortalService'
import { VenueDashboardView } from '../views/VenueDashboardView'

export function VenueDashboardPage() {
  const { venueId } = useParams<{ venueId?: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [venues, setVenues] = useState<ManagedVenue[]>([])
  const [dashboardData, setDashboardData] = useState<VenueDashboardData | null>(null)

  useEffect(() => {
    fetchMyVenues()
  }, [])

  useEffect(() => {
    if (venueId && venues.length > 0) {
      const owned = venues.some((v) => v.id === venueId)
      if (!owned) {
        setUnauthorized(true)
        return
      }
      fetchVenueStats(venueId)
    }
  }, [venueId, venues])

  const fetchMyVenues = async () => {
    setLoading(true)
    const res = await venuePortalService.getMyVenues()
    if (res.success && res.data && res.data.length > 0) {
      setVenues(res.data)
      if (!venueId) {
        navigate(`/admin/${res.data[0].id}`, { replace: true })
      }
    } else {
      navigate('/', { replace: true })
    }
    setLoading(false)
  }

  const fetchVenueStats = async (id: string) => {
    const now = new Date()
    const from = new Date(now)
    from.setMonth(from.getMonth() - 6)
    const to = new Date(now)
    to.setMonth(to.getMonth() + 6)

    const [statsRes, eventsRes] = await Promise.all([
      venuePortalService.getVenueStats(id),
      venuePortalService.listVenueEvents(id, {
        from: from.toISOString(),
        to: to.toISOString(),
      }),
    ])

    if (!statsRes.success || !statsRes.data) return

    const targetVenue = venues.find((v) => v.id === id) ||
      venues[0] || {
        id,
        name_display: 'My Venue',
        address_display: '',
        status: 'claimed',
        claim_status: 'approved',
      }

    const groupedEvents = eventsRes.success && eventsRes.data ? eventsRes.data : {}
    const eventDateTimes = Object.entries(groupedEvents).flatMap(([dateKey, events]) => {
      const [day, month, year] = dateKey.split('/').map((v) => Number(v))
      if (!day || !month || !year) return []

      return events.map((event) => {
        const [hourStr, minuteStr] = String(event?.start_at || '00:00').split(':')
        const hour = Number(hourStr || 0)
        const minute = Number(minuteStr || 0)
        return new Date(year, month - 1, day, hour, minute, 0, 0)
      })
    })

    const sessionsCompleted = eventDateTimes.filter((d) => d.getTime() < now.getTime()).length
    const sessionsActive = eventDateTimes.filter((d) => d.getTime() >= now.getTime()).length

    const data: VenueDashboardData = {
      venue: targetVenue,
      claim_info: null,
      stats: {
        sessions_completed: sessionsCompleted,
        active_events: sessionsActive,
        participants_this_week: statsRes.data.participants_of_the_week,
        players_played_here: statsRes.data.total_players,
      },
    }
    setDashboardData(data)
  }

  const handleSetVenueId = (id: string) => {
    navigate(`/admin/${id}`)
  }

  if (unauthorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <ShieldX className="h-7 w-7 text-red-400" />
        </div>
        <h1 className="text-base font-black uppercase tracking-widest text-slate-800">
          Access Denied
        </h1>
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

  return (
    <VenueDashboardView
      loading={loading}
      venues={venues}
      selectedVenueId={venueId || null}
      setSelectedVenueId={handleSetVenueId}
      dashboardData={dashboardData}
    />
  )
}
