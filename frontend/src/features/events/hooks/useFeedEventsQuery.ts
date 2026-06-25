import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/features/events/services/eventsService'

type FeedType = 'interests' | 'relations'

export function feedEventsKey(feedType: FeedType) {
  return ['events', 'feed', feedType] as const
}

export function useFeedEventsQuery(feedType: FeedType, enabled: boolean) {
  return useQuery({
    queryKey: feedEventsKey(feedType),
    queryFn: () => eventsService.getEvents({ feedType }),
    enabled,
    staleTime: 10_000,
  })
}
