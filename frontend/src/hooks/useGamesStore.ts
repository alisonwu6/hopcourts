import { create } from 'zustand'
import { CreateGameInput, GameFilter, PlayerGame } from '@/types'
import { gamesService } from '@/services'

interface GamesStore {
  games: PlayerGame[]
  selectedGame: PlayerGame | null
  isLoading: boolean
  error: string | null
  fetchGames: (filters?: GameFilter) => Promise<void>
  fetchGameById: (id: string) => Promise<void>
  fetchMyGames: () => Promise<void>
  createGame: (input: CreateGameInput) => Promise<PlayerGame>
  joinGame: (gameId: string) => Promise<void>
  leaveGame: (gameId: string) => Promise<void>
  setSelectedGame: (game: PlayerGame | null) => void
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

  fetchMyGames: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await gamesService.getMyGames()
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

  createGame: async (input: CreateGameInput) => {
    try {
      const response = await gamesService.createGame(input)
      if (response.success && response.data) {
        set((state) => ({
          games: [...state.games, response.data!],
          error: null,
        }))
        return response.data
      }
      const message = response.error?.message ?? 'Failed to create game'
      set({ error: message })
      throw new Error(message)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      set({ error: message })
      throw new Error(message)
    }
  },

  joinGame: async (gameId: string) => {
    try {
      const response = await gamesService.joinGame(gameId)
      if (response.success && response.data) {
        set((state) => ({
          games: state.games.map((game) => (game.id === gameId ? response.data! : game)),
          selectedGame: state.selectedGame?.id === gameId ? response.data! : state.selectedGame,
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

  leaveGame: async (gameId: string) => {
    try {
      const response = await gamesService.leaveGame(gameId)
      if (response.success && response.data) {
        set((state) => ({
          games: state.games.map((game) => (game.id === gameId ? response.data! : game)),
          selectedGame: state.selectedGame?.id === gameId ? response.data! : state.selectedGame,
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

  setSelectedGame: (game: PlayerGame | null) => set({ selectedGame: game }),
}))
