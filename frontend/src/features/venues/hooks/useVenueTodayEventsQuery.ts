import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/features/events/services/eventsService'

function getTodayBoundaries() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

export function venueTodayEventsKey(venueId: string) {
  return ['events', 'venue', venueId, 'today'] as const
}

export function useVenueTodayEventsQuery(venueId: string | undefined) {
  const { start, end } = getTodayBoundaries()
  return useQuery({
    queryKey: venueTodayEventsKey(venueId ?? ''),
    queryFn: () =>
      eventsService.getEvents(
        { venueId: venueId!, startDate: start, endDate: end },
        { limit: 50 }
      ),
    enabled: !!venueId,
    staleTime: 30_000,
  })
}
