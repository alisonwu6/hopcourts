import { useQuery } from '@tanstack/react-query'
import { notificationsService } from '../services/notificationsService'

const PAGE_SIZE = 20

export const NOTIFICATIONS_LIST_QUERY_KEY = ['notifications', 'list'] as const

export function useNotificationsListQuery() {
  return useQuery({
    queryKey: NOTIFICATIONS_LIST_QUERY_KEY,
    queryFn: () => notificationsService.listNotifications({ limit: PAGE_SIZE, offset: 0 }),
    staleTime: 30_000,
  })
}

export { PAGE_SIZE as NOTIFICATIONS_PAGE_SIZE }
