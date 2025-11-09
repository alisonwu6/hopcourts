import { create } from 'zustand'
import { PlayerVenue, VenueFilter } from '@/types'
import { venuesService } from '@/services'

interface VenuesStore {
  venues: PlayerVenue[]
  selectedVenue: PlayerVenue | null
  isLoading: boolean
  error: string | null
  fetchVenues: (filters?: VenueFilter) => Promise<void>
  fetchVenueById: (id: string) => Promise<void>
  setSelectedVenue: (venue: PlayerVenue | null) => void
}

export const useVenuesStore = create<VenuesStore>((set) => ({
  venues: [],
  selectedVenue: null,
  isLoading: false,
  error: null,

  fetchVenues: async (filters?: VenueFilter) => {
    set({ isLoading: true, error: null })
    try {
      const response = await venuesService.getVenues(filters)
      if (response.success && response.data) {
        set({ venues: response.data.data, isLoading: false })
      } else {
        set({
          error: response.error?.message ?? 'Failed to load venues',
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

  fetchVenueById: async (id: string) => {
    set({ isLoading: true })
    try {
      const response = await venuesService.getVenueById(id)
      if (response.success && response.data) {
        set({ selectedVenue: response.data, isLoading: false })
      } else {
        set({
          error: response.error?.message ?? 'Failed to load venue',
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

  setSelectedVenue: (venue: PlayerVenue | null) => set({ selectedVenue: venue }),
}))
