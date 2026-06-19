import { create } from 'zustand'
import { notificationsService } from '@/features/notifications/services/notificationsService'

interface ProfileStore {
  rawProfile: any | null
  unreadCount: number
  isLoaded: boolean
  fetchedAt: number | null
  seedFromBootstrap: (raw: any) => void
  setRawProfile: (raw: any) => void
  setUnreadCount: (count: number) => void
  clear: () => void
}

export const useProfileStore = create<ProfileStore>((set) => ({
  rawProfile: null,
  unreadCount: 0,
  isLoaded: false,
  fetchedAt: null,

  seedFromBootstrap: (raw) => {
    set({ rawProfile: raw, fetchedAt: Date.now(), isLoaded: true })
    notificationsService.listNotifications({ limit: 1 })
      .then((res: any) => {
        const unread = res?.data?.unread_count
        if (typeof unread === 'number') set({ unreadCount: unread })
      })
      .catch(() => {})
  },

  setRawProfile: (raw) => set({ rawProfile: raw, fetchedAt: Date.now(), isLoaded: true }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  clear: () => set({ rawProfile: null, unreadCount: 0, isLoaded: false, fetchedAt: null }),
}))
