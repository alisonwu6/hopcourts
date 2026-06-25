import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/features/events/services/eventsService'

export function venueUpcomingEventsKey(venueId: string) {
  return ['events', 'venue', venueId, 'upcoming'] as const
}

export function useVenueUpcomingEventsQuery(venueId: string | undefined) {
  return useQuery({
    queryKey: venueUpcomingEventsKey(venueId ?? ''),
    queryFn: () => eventsService.getEvents({ venueId: venueId! }, { limit: 10 }),
    enabled: !!venueId,
    staleTime: 30_000,
  })
}
