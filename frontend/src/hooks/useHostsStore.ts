import { create } from 'zustand'
import { Host, HostFilter, UpdateHostProfileInput } from '@/types'
import { hostsService } from '@/services'

interface HostsStore {
  hosts: Host[]
  selectedHost: Host | null
  isLoading: boolean
  error: string | null
  fetchHosts: (filters?: HostFilter) => Promise<void>
  fetchHostById: (id: string) => Promise<void>
  updateHostProfile: (hostId: string, input: UpdateHostProfileInput) => Promise<void>
  createHostProfile: (userId: string, name: string, type: Host['type']) => Promise<void>
  setSelectedHost: (host: Host | null) => void
}

export const useHostsStore = create<HostsStore>((set, get) => ({
  hosts: [],
  selectedHost: null,
  isLoading: false,
  error: null,

  fetchHosts: async (filters?: HostFilter) => {
    set({ isLoading: true, error: null })
    try {
      const response = await hostsService.getHosts(filters)
      if (response.success && response.data) {
        set({ hosts: response.data.data, isLoading: false })
      } else {
        set({
          error: response.error?.message ?? 'Failed to load hosts',
          isLoading: false,
        })
      }
    } catch {
      set({
        error: 'An error occurred',
        isLoading: false,
      })
    }
  },

  fetchHostById: async (id: string) => {
    set({ isLoading: true })
    try {
      const response = await hostsService.getHostById(id)
      if (response.success && response.data) {
        set({ selectedHost: response.data, isLoading: false })
      } else {
        set({
          error: response.error?.message ?? 'Failed to load host',
          isLoading: false,
        })
      }
    } catch {
      set({
        error: 'An error occurred',
        isLoading: false,
      })
    }
  },

  updateHostProfile: async (hostId: string, input: UpdateHostProfileInput) => {
    try {
      const response = await hostsService.updateHostProfile(hostId, input)
      if (response.success && response.data) {
        set((state) => ({
          hosts: state.hosts.map((host) => (host.id === hostId ? response.data! : host)),
          selectedHost: state.selectedHost?.id === hostId ? response.data! : state.selectedHost,
        }))
      } else {
        set({
          error: response.error?.message ?? 'Failed to update host',
        })
      }
    } catch {
      set({ error: 'An error occurred' })
    }
  },

  createHostProfile: async (userId: string, name: string, type: Host['type']) => {
    try {
      const response = await hostsService.createHostProfile(userId, name, type)
      if (response.success && response.data) {
        set((state) => ({
          hosts: [...state.hosts, response.data!],
        }))
      } else {
        set({
          error: response.error?.message ?? 'Failed to create host profile',
        })
      }
    } catch {
      set({ error: 'An error occurred' })
    }
  },

  setSelectedHost: (host: Host | null) => set({ selectedHost: host }),
}))
