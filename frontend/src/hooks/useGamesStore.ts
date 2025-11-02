import { create } from 'zustand'
import { CreateGameInput, Game, GameFilter } from '@/types'
import { gamesService } from '@/services'

interface GamesStore {
  games: Game[]
  selectedGame: Game | null
  isLoading: boolean
  error: string | null
  fetchGames: (filters?: GameFilter) => Promise<void>
  fetchGameById: (id: string) => Promise<void>
  createGame: (input: CreateGameInput, hostId: string) => Promise<void>
  joinGame: (gameId: string, userId: string) => Promise<void>
  leaveGame: (gameId: string, userId: string) => Promise<void>
  setSelectedGame: (game: Game | null) => void
}

export const useGamesStore = create<GamesStore>((set) => ({
  games: [],
  selectedGame: null,
  isLoading: false,
  error: null,

  fetchGames: async (filters?: GameFilter) => {
    set({ isLoading: true, error: null })
    try {
      const response = await gamesService.getGames(filters)
      if (response.success && response.data) {
        set({ games: response.data.data, isLoading: false })
      } else {
        set({
          error: response.error?.message ?? 'Failed to load games',
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

  fetchGameById: async (id: string) => {
    set({ isLoading: true })
    try {
      const response = await gamesService.getGameById(id)
      if (response.success && response.data) {
        set({ selectedGame: response.data, isLoading: false })
      } else {
        set({
          error: response.error?.message ?? 'Failed to load game',
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

  createGame: async (input: CreateGameInput, hostId: string) => {
    try {
      const response = await gamesService.createGame(input, hostId)
      if (response.success && response.data) {
        set((state) => ({
          games: [...state.games, response.data!],
        }))
      } else {
        set({
          error: response.error?.message ?? 'Failed to create game',
        })
      }
    } catch {
      set({ error: 'An error occurred' })
    }
  },

  joinGame: async (gameId: string, userId: string) => {
    try {
      const response = await gamesService.joinGame(gameId, userId)
      if (response.success && response.data) {
        set((state) => ({
          games: state.games.map((game) => (game.id === gameId ? response.data! : game)),
        }))
      } else {
        set({
          error: response.error?.message ?? 'Failed to join game',
        })
      }
    } catch {
      set({ error: 'An error occurred' })
    }
  },

  leaveGame: async (gameId: string, userId: string) => {
    try {
      const response = await gamesService.leaveGame(gameId, userId)
      if (response.success && response.data) {
        set((state) => ({
          games: state.games.map((game) => (game.id === gameId ? response.data! : game)),
        }))
      } else {
        set({
          error: response.error?.message ?? 'Failed to leave game',
        })
      }
    } catch {
      set({ error: 'An error occurred' })
    }
  },

  setSelectedGame: (game: Game | null) => set({ selectedGame: game }),
}))
