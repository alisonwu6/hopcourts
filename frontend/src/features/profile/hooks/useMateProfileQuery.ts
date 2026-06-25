import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { ApiResponse } from '@/api/types'

export function mateProfileKey(username: string) {
  return ['profiles', 'mate', username] as const
}

export function useMateProfileQuery(username: string | undefined) {
  return useQuery({
    queryKey: mateProfileKey(username ?? ''),
    queryFn: () => api.profiles.getByUsername(username!) as Promise<ApiResponse<any>>,
    enabled: !!username,
    staleTime: 60_000,
  })
}
