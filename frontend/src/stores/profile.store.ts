import { create } from 'zustand'
import type { MateCardProps } from '@/features/mates/components/MateCard'

export type ProfileVM = {
  username: string
  usernameUpdatedCount: number
  card: MateCardProps
  favoriteSportKeys: string[]
  tryingSportKeys: string[]
}

interface ProfileStore {
  rawProfile: any | null
  vm: ProfileVM | null
  unreadCount: number
  isLoaded: boolean
  fetchedAt: number | null
  seedFromBootstrap: (raw: any) => void
  setRawProfile: (raw: any) => void
  setVm: (vm: ProfileVM | null) => void
  setUnreadCount: (count: number) => void
  clear: () => void
}

export const useProfileStore = create<ProfileStore>((set) => ({
  rawProfile: null,
  vm: null,
  unreadCount: 0,
  isLoaded: false,
  fetchedAt: null,

  seedFromBootstrap: (raw) => {
    set({ rawProfile: raw, fetchedAt: Date.now(), isLoaded: true })
  },

  setRawProfile: (raw) => set({ rawProfile: raw, fetchedAt: Date.now(), isLoaded: true }),
  setVm: (vm) => set({ vm }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  clear: () => set({ rawProfile: null, vm: null, unreadCount: 0, isLoaded: false, fetchedAt: null }),
}))
