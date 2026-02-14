import { httpGet, httpPatch } from '@/api/http'

export interface NotificationItem {
  id: string
  type: string
  entity_type?: string
  entity_id?: string
  title: string
  message: string
  is_read: boolean
  read_at?: string
  created_at: string
  metadata?: any
}

interface ListNotificationsParams {
  unread_only?: boolean
  limit?: number
  offset?: number
}

interface ListNotificationsResponse {
  ok: boolean
  data: {
    items: NotificationItem[]
    unread_count: number
    next_cursor?: string | null
  }
}

export const notificationsService = {
  async listNotifications(params?: ListNotificationsParams) {
    const query: Record<string, string | number | boolean> = {}
    if (params?.limit) query.limit = params.limit
    if (params?.offset) query.offset = params.offset
    if (params?.unread_only) query.unread_only = params.unread_only

    return httpGet<ListNotificationsResponse>('/notifications', { params: query })
  },

  async markRead(id: string) {
    return httpPatch<{ ok: boolean }>(`/notifications/${id}/read`)
  },

  async markAllRead() {
    return httpPatch<{ ok: boolean }>('/notifications/read-all')
  }
}
