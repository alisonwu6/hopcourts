import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SavedEventsStore {
  savedIds: Array<string>
  toggleSave: (eventId: string) => void
  isSaved: (eventId: string) => boolean
  clearSavedEvents: () => void
}

export const useSavedEventsStore = create<SavedEventsStore>()(
  persist(
    (set, get) => ({
      savedIds: [],

      toggleSave: (eventId) =>
        set((state) => {
          const alreadySaved = state.savedIds.includes(eventId)
          if (alreadySaved) {
            return { savedIds: state.savedIds.filter((id) => id !== eventId) }
          }
          return { savedIds: [...state.savedIds, eventId] }
        }),

      isSaved: (eventId) => {
        return get().savedIds.includes(eventId)
      },

      clearSavedEvents: () => set({ savedIds: [] }),
    }),
    { name: 'savedEvents-store' }
  )
)
