import { useQuery } from '@tanstack/react-query'
import { profileService } from '@/features/profile/services/profileService'

export const PROFILE_QUERY_KEY = ['profile'] as const

export function useProfileQuery(enabled: boolean) {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => profileService.getProfile(),
    enabled,
    staleTime: 30_000,
  })
}
