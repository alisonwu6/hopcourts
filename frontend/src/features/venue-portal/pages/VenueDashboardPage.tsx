import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { venuePortalService, ManagedVenue, VenueDashboardData } from '../services/venuePortalService'
import { VenueDashboardView } from '../views/VenueDashboardView'

export function VenueDashboardPage() {
  const { venueId } = useParams<{ venueId?: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [venues, setVenues] = useState<ManagedVenue[]>([])
  const [dashboardData, setDashboardData] = useState<VenueDashboardData | null>(null)

  useEffect(() => {
    fetchMyVenues()
  }, [])

  useEffect(() => {
    if (venueId && venues.length > 0) {
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
