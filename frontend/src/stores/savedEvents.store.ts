import { create } from 'zustand'
import { eventsService } from '@/features/events/services/eventsService'

interface SavedEventsStore {
  savedIds: string[]
  isSaving: Record<string, boolean>
  toggleSave: (eventId: string) => Promise<void>
  isSaved: (eventId: string) => boolean
  fetchBookmarks: () => Promise<void>
  clearSavedEvents: () => void
}

export const useSavedEventsStore = create<SavedEventsStore>()((set, get) => ({
  savedIds: [],
  isSaving: {},

  toggleSave: async (eventId) => {
    const { savedIds } = get()
    const currentlySaved = savedIds.includes(eventId)

    // Optimistic update
    set((state) => ({
      isSaving: { ...state.isSaving, [eventId]: true },
      savedIds: currentlySaved
        ? state.savedIds.filter((id) => id !== eventId)
        : [...state.savedIds, eventId],
    }))

    const res = await eventsService.toggleBookmark(eventId, currentlySaved)

    if (!res.success) {
      // Rollback on failure
      set((state) => ({
        savedIds: currentlySaved
          ? [...state.savedIds, eventId]
          : state.savedIds.filter((id) => id !== eventId),
      }))
    }

    set((state) => {
      const { [eventId]: _, ...rest } = state.isSaving
      return { isSaving: rest }
    })
  },

  isSaved: (eventId) => get().savedIds.includes(eventId),

  fetchBookmarks: async () => {
    const res = await eventsService.fetchBookmarkIds()
    if (res.success && res.data) {
      set({ savedIds: res.data.ids })
    }
  },

  clearSavedEvents: () => set({ savedIds: [], isSaving: {} }),
}))
