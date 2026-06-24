import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import { venuePortalService, VenueDashboardData } from '../services/venuePortalService'
import { VenuePortalOutletCtx } from '../layouts/VenuePortalLayout'
import { VenueDashboardView } from '../views/VenueDashboardView'

export function VenueDashboardPage() {
  const { venueId } = useParams<{ venueId: string }>()
  const { venues, activeVenue } = useOutletContext<VenuePortalOutletCtx>()
  const [dashboardData, setDashboardData] = useState<VenueDashboardData | null>(null)

  useEffect(() => {
    if (venueId) fetchVenueStats(venueId)
  }, [venueId])

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

    const targetVenue = venues.find((v) => v.id === id) ?? venues[0] ?? activeVenue ?? {
      id,
      name_display: 'My Venue',
      address_display: '',
      status: 'claimed' as const,
      claim_status: 'approved' as const,
    }

    const groupedEvents = eventsRes.success && eventsRes.data ? eventsRes.data : {}
    const eventDateTimes = Object.entries(groupedEvents).flatMap(([dateKey, events]) => {
      const [day, month, year] = dateKey.split('/').map((v) => Number(v))
      if (!day || !month || !year) return []
      return events.map((event) => {
        const [hourStr, minuteStr] = String(event?.start_at || '00:00').split(':')
        return new Date(year, month - 1, day, Number(hourStr || 0), Number(minuteStr || 0))
      })
    })

    const sessionsCompleted = eventDateTimes.filter((d) => d.getTime() < now.getTime()).length
    const sessionsActive = eventDateTimes.filter((d) => d.getTime() >= now.getTime()).length

    setDashboardData({
      venue: targetVenue,
      claim_info: null,
      stats: {
        sessions_completed: sessionsCompleted,
        active_events: sessionsActive,
        participants_this_week: statsRes.data.participants_of_the_week,
        players_played_here: statsRes.data.total_players,
      },
    })
  }

  return (
    <VenueDashboardView
      venues={venues}
      selectedVenueId={venueId || null}
      dashboardData={dashboardData}
    />
  )
}
