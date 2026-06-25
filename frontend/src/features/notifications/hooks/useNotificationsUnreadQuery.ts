import { useQuery } from '@tanstack/react-query'
import { notificationsService } from '@/features/notifications/services/notificationsService'

export const NOTIFICATIONS_UNREAD_QUERY_KEY = ['notifications', 'unread'] as const

export function useNotificationsUnreadQuery(enabled: boolean) {
  return useQuery({
    queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY,
    queryFn: () => notificationsService.listNotifications({ limit: 1 }),
    enabled,
    staleTime: 60_000,
  })
}
