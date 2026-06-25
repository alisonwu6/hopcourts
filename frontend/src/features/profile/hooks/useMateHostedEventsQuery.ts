import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/features/events/services/eventsService'

export function mateHostedEventsKey(username: string) {
  return ['events', 'mate', username, 'hosted', 'upcoming'] as const
}

export function useMateHostedEventsQuery(username: string | undefined) {
  return useQuery({
    queryKey: mateHostedEventsKey(username ?? ''),
    queryFn: () =>
      eventsService.getProfileEventsByUsername(username!, {
        role: 'hosted',
        time: 'upcoming',
        limit: 10,
        offset: 0,
      }),
    enabled: !!username,
    staleTime: 30_000,
  })
}
