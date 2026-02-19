import { create } from 'zustand'
import { CreateEventInput, EventFilter, PlayerEvent } from '@/types'
import { eventsService } from '@/features/events/services/eventsService'

type FetchOptions = {
  force?: boolean
}

interface EventsStore {
  events: PlayerEvent[]
  myEvents: PlayerEvent[]
  myEventsLoaded: {
    upcoming: boolean
    history: boolean
  }
  selectedEvent: PlayerEvent | null
  isLoading: boolean
  error: string | null
  fetchEvents: (filters?: EventFilter, options?: FetchOptions) => Promise<void>
  fetchEventById: (id: string, options?: FetchOptions) => Promise<void>
  fetchMyEvents: (type?: 'upcoming' | 'history' | 'all', options?: FetchOptions) => Promise<void>
  createEvent: (input: CreateEventInput) => Promise<PlayerEvent>
  joinEvent: (eventId: string) => Promise<void>
  leaveEvent: (eventId: string) => Promise<void>
  checkInToEvent: (eventId: string, coords: { lat: number; lng: number }) => Promise<void>
  setSelectedEvent: (event: PlayerEvent | null) => void
}

export const useEventsStore = create<EventsStore>((set, get) => ({
  events: [],
  myEvents: [],
  myEventsLoaded: {
    upcoming: false,
    history: false,
  },
  selectedEvent: null,
  isLoading: false,
  error: null,

  fetchEvents: async (filters?: EventFilter, options?: FetchOptions) => {
    const shouldShowLoading = options?.force || get().events.length === 0
    set({ isLoading: Boolean(shouldShowLoading), error: null })
    try {
      const response = await eventsService.getEvents(filters, options)
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

  fetchEventById: async (id: string, options?: FetchOptions) => {
    const selectedEvent = get().selectedEvent
    const shouldShowLoading = options?.force || selectedEvent?.id !== id
    set({ isLoading: Boolean(shouldShowLoading), error: null })
    try {
      const response = await eventsService.getEventById(id, options)
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

  fetchMyEvents: async (type: 'upcoming' | 'history' | 'all' = 'upcoming', options?: FetchOptions) => {
    set({ isLoading: true, error: null })
    try {
      const response = await eventsService.getMyEvents(type, options)
      if (response.success && response.data) {
        if (type === 'all') {
          set({
            myEvents: response.data.data,
            isLoading: false,
            myEventsLoaded: { upcoming: true, history: true },
          })
        } else {
          set((state) => {
            const merged = Array.from(
              new Map([...state.myEvents, ...response.data!.data].map((item) => [item.id, item])).values()
            )
            return {
              myEvents: merged,
              isLoading: false,
              myEventsLoaded: {
                ...state.myEventsLoaded,
                [type]: true,
              },
            }
          })
        }
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
          myEventsLoaded: { upcoming: false, history: false },
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
          myEventsLoaded: { upcoming: false, history: false },
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
          myEventsLoaded: { upcoming: false, history: false },
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
