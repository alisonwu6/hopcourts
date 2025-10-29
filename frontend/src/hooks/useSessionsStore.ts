import { create } from 'zustand'
import { CreateSessionInput, Session, SessionFilter } from '@/types'
import { sessionsService } from '@/services'

interface SessionsStore {
  sessions: Session[]
  selectedSession: Session | null
  isLoading: boolean
  error: string | null
  fetchSessions: (filters?: SessionFilter) => Promise<void>
  fetchSessionById: (id: string) => Promise<void>
  createSession: (input: CreateSessionInput, hostId: string) => Promise<void>
  joinSession: (sessionId: string, userId: string) => Promise<void>
  leaveSession: (sessionId: string, userId: string) => Promise<void>
  setSelectedSession: (session: Session | null) => void
}

export const useSessionsStore = create<SessionsStore>((set) => ({
  sessions: [],
  selectedSession: null,
  isLoading: false,
  error: null,

  fetchSessions: async (filters?: SessionFilter) => {
    set({ isLoading: true, error: null })
    try {
      const response = await sessionsService.getSessions(filters)
      if (response.success && response.data) {
        set({ sessions: response.data.data, isLoading: false })
      } else {
        set({
          error: response.error?.message ?? 'Failed to load sessions',
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

  fetchSessionById: async (id: string) => {
    set({ isLoading: true })
    try {
      const response = await sessionsService.getSessionById(id)
      if (response.success && response.data) {
        set({ selectedSession: response.data, isLoading: false })
      } else {
        set({
          error: response.error?.message ?? 'Failed to load session',
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

  createSession: async (input: CreateSessionInput, hostId: string) => {
    try {
      const response = await sessionsService.createSession(input, hostId)
      if (response.success && response.data) {
        set((state) => ({
          sessions: [...state.sessions, response.data!],
        }))
      } else {
        set({
          error: response.error?.message ?? 'Failed to create session',
        })
      }
    } catch {
      set({ error: 'An error occurred' })
    }
  },

  joinSession: async (sessionId: string, userId: string) => {
    try {
      const response = await sessionsService.joinSession(sessionId, userId)
      if (response.success && response.data) {
        set((state) => ({
          sessions: state.sessions.map((session) => (session.id === sessionId ? response.data! : session)),
        }))
      } else {
        set({
          error: response.error?.message ?? 'Failed to join session',
        })
      }
    } catch {
      set({ error: 'An error occurred' })
    }
  },

  leaveSession: async (sessionId: string, userId: string) => {
    try {
      const response = await sessionsService.leaveSession(sessionId, userId)
      if (response.success && response.data) {
        set((state) => ({
          sessions: state.sessions.map((session) => (session.id === sessionId ? response.data! : session)),
        }))
      } else {
        set({
          error: response.error?.message ?? 'Failed to leave session',
        })
      }
    } catch {
      set({ error: 'An error occurred' })
    }
  },

  setSelectedSession: (session: Session | null) => set({ selectedSession: session }),
}))
