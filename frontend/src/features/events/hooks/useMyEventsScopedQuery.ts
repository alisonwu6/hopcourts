import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/features/events/services/eventsService'

type Role = 'all' | 'hosted' | 'joined'
type Time = 'upcoming' | 'history'

export function myEventsScopedKey(role: Role, time: Time) {
  return ['events', 'my', role, time] as const
}

export function useMyEventsScopedQuery(params: { role: Role; time: Time; enabled: boolean }) {
  return useQuery({
    queryKey: myEventsScopedKey(params.role, params.time),
    queryFn: () => eventsService.getMyEventsScoped({ role: params.role, time: params.time }),
    enabled: params.enabled,
    staleTime: 30_000,
  })
}
