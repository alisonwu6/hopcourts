import { apiRequest } from './apiClient'
import {
  ApiResponse,
  PaginatedResponse,
  CreateGameInput,
  GameFilter,
  PlayerGame,
  GameApi,
} from '@/types'
import { format } from 'date-fns'
import { useAuthStore } from '@/store/authStore'

const SPORT_ICONS: Record<string, string> = {
  basketball: '🏀',
  badminton: '🏸',
  pickleball: '🏓',
  climbing: '🧗',
  running: '🏃',
  hiking: '🥾',
  tennis: '🎾',
  volleyball: '🏐',
}

const mapGameApiToPlayerGame = (game: GameApi, currentUserId?: string): PlayerGame => ({
  id: String(game.id),
  title: game.title,
  sport: game.sport,
  vibeIcon: SPORT_ICONS[game.sport.toLowerCase()] ?? '🎯',
  skillLevel: game.skill_level ?? 'mixed',
  startTime: new Date(game.start_time),
  endTime: new Date(game.end_time),
  location: {
    name: game.location_name || game.venue_name || 'Location TBC',
    address: game.location_address || game.venue_address || '',
    city: game.city || game.venue_city || '',
  },
  host: {
    id: String(game.creator_id),
    name: game.host_name || 'Host',
    avatarUrl: game.host_avatar || undefined,
  },
  highFives: game.energy ?? 0,
  joined: currentUserId
    ? (game.attendees ?? []).some((participant) => String(participant.player_id) === currentUserId)
    : false,
  attendeeCount: game.attendee_count ?? game.attendees?.length ?? 0,
  maxAttendees: game.max_players,
  difficulty: Math.min(Math.max(['beginner', 'mixed', 'intermediate', 'advanced'].indexOf(game.skill_level ?? 'mixed') + 1, 1), 4) as 1 | 2 | 3 | 4,
  isFree: !game.price,
  price: game.price ?? 0,
  priceRange: game.price ? `$${game.price}` : 'Free to join',
  description: game.description ?? '',
  participants: (game.attendees ?? []).map((participant) => ({
    id: String(participant.player_id),
    name: participant.full_name,
    avatarUrl: participant.avatar_url ?? undefined,
  })),
  detail: {
    description: game.description ?? '',
    lookingFor: {
      skillLevel: game.skill_level ?? 'mixed',
    },
    rules: {
      duration: `${getDurationMinutes(game.start_time, game.end_time)} mins`,
    },
  },
  completedDate: game.status === 'completed' ? new Date(game.end_time) : undefined,
})

const getDurationMinutes = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return Math.max(30, Math.round((endDate.getTime() - startDate.getTime()) / 60000))
}

const wrapSuccess = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date(),
})

export const gamesService = {
  async getGames(filters?: GameFilter): Promise<ApiResponse<PaginatedResponse<PlayerGame>>> {
    const params: Record<string, string> = {}
    if (filters?.sport) params.sport = filters.sport
    if (filters?.startDate) params.startDate = format(filters.startDate, 'yyyy-MM-dd')
    if (filters?.endDate) params.endDate = format(filters.endDate, 'yyyy-MM-dd')
    if (filters?.lat) params.lat = String(filters.lat)
    if (filters?.lng) params.lng = String(filters.lng)

    const response = await apiRequest<{ data: GameApi[] }>('GET', '/discover/games', {
      auth: false,
      params,
    })
    const games = response.data.map(mapGameApiToPlayerGame)
    return wrapSuccess({
      data: games,
      total: games.length,
      page: 1,
      pageSize: games.length,
      hasMore: false,
    })
  },

  async getGameById(id: string): Promise<ApiResponse<PlayerGame>> {
    const currentUserId = useAuthStore.getState().user?.id
    const response = await apiRequest<GameApi>('GET', `/games/${id}`, {})
    return wrapSuccess(mapGameApiToPlayerGame(response, currentUserId))
  },

  async getMyGames(): Promise<ApiResponse<PaginatedResponse<PlayerGame>>> {
    const currentUserId = useAuthStore.getState().user?.id
    const response = await apiRequest<{ data: GameApi[] }>('GET', '/games/mine', {})
    const games = response.data.map((apiGame) => mapGameApiToPlayerGame(apiGame, currentUserId))
    return wrapSuccess({
      data: games,
      total: games.length,
      page: 1,
      pageSize: games.length,
      hasMore: false,
    })
  },

  async createGame(input: CreateGameInput): Promise<ApiResponse<PlayerGame>> {
    const payload = {
      title: input.title,
      sport: input.sport,
      description: input.description,
      skillLevel: input.skillLevel,
      startTime: input.startTime.toISOString(),
      endTime: new Date(input.startTime.getTime() + input.duration * 60000).toISOString(),
      maxPlayers: input.maxAttendees,
      locationName: input.location?.address,
      locationAddress: input.location?.address,
      latitude: input.location?.lat,
      longitude: input.location?.lng,
      price: input.isFree ? 0 : input.pricePerPerson ?? 0,
      energy: input.difficulty ? input.difficulty * 20 : 60,
    }
    const game = await apiRequest<GameApi>('POST', '/games', { body: payload })
    return wrapSuccess(mapGameApiToPlayerGame(game))
  },

  async joinGame(gameId: string): Promise<ApiResponse<PlayerGame>> {
    await apiRequest('POST', `/games/${gameId}/join`, {})
    return this.getGameById(gameId)
  },

  async leaveGame(gameId: string): Promise<ApiResponse<PlayerGame>> {
    await apiRequest('DELETE', `/games/${gameId}/leave`, {})
    return this.getGameById(gameId)
  },
}
