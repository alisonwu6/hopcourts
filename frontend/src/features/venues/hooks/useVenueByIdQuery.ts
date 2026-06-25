import { useQuery } from '@tanstack/react-query'
import { venuesService } from '../services/venuesService'

export function venueByIdKey(venueId: string) {
  return ['venues', 'detail', venueId] as const
}

export function useVenueByIdQuery(venueId: string | undefined) {
  return useQuery({
    queryKey: venueByIdKey(venueId ?? ''),
    queryFn: () => venuesService.getVenueById(venueId!),
    enabled: !!venueId,
    staleTime: 60_000,
  })
}
