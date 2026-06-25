import { useQuery } from '@tanstack/react-query'
import { venuesService } from '@/features/venues/services/venuesService'
import type { VenueFilter } from '@/features/venues/services/venuesService'

export function venuesKey(filter: VenueFilter) {
  return ['venues', filter] as const
}

export function useVenuesQuery(filter: VenueFilter) {
  return useQuery({
    queryKey: venuesKey(filter),
    queryFn: () => venuesService.listVenues(filter),
    staleTime: 60_000,
  })
}
