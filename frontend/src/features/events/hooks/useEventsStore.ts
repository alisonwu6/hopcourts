import { create } from 'zustand'
import { CreateEventInput, EventFilter, PlayerEvent } from '@/types'
import { eventsService } from '@/features/events/services/eventsService'

interface EventsStore {
  events: PlayerEvent[]
  selectedEvent: PlayerEvent | null
  isLoading: boolean
  error: string | null
  fetchEvents: (filters?: EventFilter) => Promise<void>
  fetchEventById: (id: string) => Promise<void>
  fetchMyEvents: () => Promise<void>
  createEvent: (input: CreateEventInput) => Promise<PlayerEvent>
  joinEvent: (eventId: string) => Promise<void>
  leaveEvent: (eventId: string) => Promise<void>
  checkInToEvent: (eventId: string, coords: { lat: number; lng: number }) => Promise<void>
  setSelectedEvent: (event: PlayerEvent | null) => void
}

export const useEventsStore = create<EventsStore>((set) => ({
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,

  fetchEvents: async (filters?: EventFilter) => {
    set({ isLoading: true, error: null })
    try {
      const response = await eventsService.getEvents(filters)
      if (response.success && response.data) {
        set({ events: response.data.data, isLoading: false })
      } else {
        set({
          error: response.error?.message ?? 'Failed to load events',
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

  fetchEventById: async (id: string) => {
    set({ isLoading: true })
    try {
      const response = await eventsService.getEventById(id)
      if (response.success && response.data) {
        set({ selectedEvent: response.data, isLoading: false })
      } else {
        set({
          error: response.error?.message ?? 'Failed to load event',
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

  fetchMyEvents: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await eventsService.getMyEvents()
      if (response.success && response.data) {
        set({ events: response.data.data, isLoading: false })
      } else {
        set({
          error: response.error?.message ?? 'Failed to load events',
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

  createEvent: async (input: CreateEventInput) => {
    try {
      const response = await eventsService.createEvent(input)
      if (response.success && response.data) {
        set((state) => ({
          events: [...state.events, response.data!],
          error: null,
        }))
        return response.data
      }
      const message = response.error?.message ?? 'Failed to create event'
      set({ error: message })
      throw new Error(message)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      set({ error: message })
      throw new Error(message)
    }
  },

  joinEvent: async (eventId: string) => {
    try {
      const response = await eventsService.joinEvent(eventId)
      if (response.success && response.data) {
        set((state) => ({
          events: state.events.map((event) => (event.id === eventId ? response.data! : event)),
          selectedEvent: state.selectedEvent?.id === eventId ? response.data! : state.selectedEvent,
        }))
      } else {
        set({
          error: response.error?.message ?? 'Failed to join event',
        })
      }
    } catch {
      set({ error: 'An error occurred' })
    }
  },

  leaveEvent: async (eventId: string) => {
    try {
      const response = await eventsService.leaveEvent(eventId)
      if (response.success && response.data) {
        set((state) => ({
          events: state.events.map((event) => (event.id === eventId ? response.data! : event)),
          selectedEvent: state.selectedEvent?.id === eventId ? response.data! : state.selectedEvent,
        }))
      } else {
        set({
          error: response.error?.message ?? 'Failed to leave event',
        })
      }
    } catch {
      set({ error: 'An error occurred' })
    }
  },

  checkInToEvent: async (eventId: string, coords: { lat: number; lng: number }) => {
    try {
      const response = await eventsService.checkIn(eventId, coords)
      if (response.success) {
        // Maybe refresh event to show checked-in status? API doesn't return updated event usually, just status.
        // But let's assume we might want to refresh.
        // For now just allow UI to react to success.
      } else {
        set({
          error: response.error?.message ?? 'Failed to check in',
        })
        throw response.error // Throw the full error object containing code/details
      }
    } catch (err: any) {
      // If it's the object we threw above, just rethrow it
      if (err?.code) throw err
      
      const message = err?.message || 'Check-in failed'
      set({ error: message })
      throw err
    }
  },

  setSelectedEvent: (event: PlayerEvent | null) => set({ selectedEvent: event }),
}))
