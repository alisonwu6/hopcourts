import { apiRequest } from './apiClient'
import {
  ApiResponse,
  PaginatedResponse,
  CreateGameInput,
  GameFilter,
  PlayerGame,
  GameCardDTO,
  GameDetailDTO,
  GameApi,
  SaveGamePayload,
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

type GameSource = GameCardDTO | GameDetailDTO | GameApi

const isGameApi = (game: GameSource): game is GameApi => 'creator_id' in game

const mapGameDtoToPlayerGame = (
  game: GameSource,
  currentUserId?: string,
): PlayerGame => ({
  id: String(game.id),
  title: game.title,
  sport: game.sport,
  heroImageUrl: isGameApi(game) ? game.hero_image_url ?? undefined : game.coverPhotoUrl ?? undefined,
  vibeIcon: SPORT_ICONS[game.sport.toLowerCase()] ?? '🎯',
  skillLevel: (isGameApi(game) ? game.skill_level : game.skillLevel) ?? 'mixed',
  startTime: new Date(isGameApi(game) ? game.start_time : game.startDateTime),
  endTime: new Date(isGameApi(game) ? game.end_time : game.endDateTime),
  location: {
    name: (isGameApi(game) ? game.location_name : game.locationName) || 'Location TBC',
    address: isGameApi(game)
      ? game.location_address || ''
      : 'addressLine' in game && game.addressLine
      ? game.addressLine
      : '',
    city: (isGameApi(game) ? game.city : (game as GameCardDTO | GameDetailDTO).city) ?? '',
  },
  host: {
    id: isGameApi(game) ? String(game.creator_id) : String(game.host.id),
    name: isGameApi(game) ? game.host_name || 'Host' : game.host.displayName || 'Host',
    avatarUrl: isGameApi(game) ? game.host_avatar ?? undefined : game.host.avatarUrl ?? undefined,
  },
  highFives: 0, // TODO: wire to a proper "energy" or kudos metric when available in the DTO
  joined:
    'isUserJoined' in game && typeof game.isUserJoined === 'boolean'
      ? game.isUserJoined
      : false,
  attendeeCount: isGameApi(game) ? Number(game.attendee_count ?? 0) : game.joinedCount ?? 0,
  maxAttendees: isGameApi(game) ? game.max_players : game.capacity,
  difficulty: Math.min(
    Math.max(
      ['beginner', 'mixed', 'intermediate', 'advanced'].indexOf(
        ((isGameApi(game) ? game.skill_level : game.skillLevel) ?? 'mixed').toLowerCase(),
      ) + 1,
      1,
    ),
    4,
  ) as 1 | 2 | 3 | 4,
  isFree: isGameApi(game)
    ? game.price_type === 'free' || !game.price
    : game.isFree ?? game.priceType === 'free',
  price: ((): number => {
    if (isGameApi(game)) return game.price ?? 0
    return game.priceAmount ?? 0
  })(),
  priceRange:
    (isGameApi(game) ? game.price_type === 'free' || !game.price : game.priceType === 'free' || !game.priceAmount)
      ? 'Free to join'
      : `$${(isGameApi(game) ? game.price ?? 0 : game.priceAmount ?? 0).toFixed(2)}`,
  description: (game as GameSource).description ?? '',
  participants: (() => {
    if ('attendees' in game && game.attendees) {
      return game.attendees.map((participant) => ({
        id: String(isGameApi(game) ? participant.player_id : participant.id),
        name: isGameApi(game) ? participant.full_name ?? 'Player' : participant.displayName,
        avatarUrl: isGameApi(game) ? participant.avatar_url ?? undefined : participant.avatarUrl ?? undefined,
      }))
    }
    return []
  })(),
  detail: {
    description: (game as GameSource).description ?? '',
    lookingFor: {
      skillLevel: (isGameApi(game) ? game.skill_level : game.skillLevel) ?? 'mixed',
    },
    rules: {
      duration: `${getDurationMinutes(
        isGameApi(game) ? game.start_time : game.startDateTime,
        isGameApi(game) ? game.end_time : game.endDateTime,
      )} mins`,
    },
    heroImageUrl: isGameApi(game) ? game.hero_image_url ?? undefined : game.coverPhotoUrl ?? undefined,
  },
  completedDate:
    (game as any).status === 'completed'
      ? new Date(isGameApi(game) ? game.end_time : game.endDateTime)
      : undefined,
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

    const response = await apiRequest<{ data: (GameCardDTO | GameApi)[] }>('GET', '/games', {
      auth: false,
      params,
    })
    const games = response.data.map((game) => mapGameDtoToPlayerGame(game))
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
    const response = await apiRequest<GameDetailDTO>('GET', `/games/${id}`, {})
    return wrapSuccess(mapGameDtoToPlayerGame(response, currentUserId))
  },

  async getMyGames(): Promise<ApiResponse<PaginatedResponse<PlayerGame>>> {
    const currentUserId = useAuthStore.getState().user?.id
    const response = await apiRequest<{ data: (GameCardDTO | GameApi)[] }>('GET', '/games/mine', {})
    const games = response.data.map((apiGame) => mapGameDtoToPlayerGame(apiGame, currentUserId))
    return wrapSuccess({
      data: games,
      total: games.length,
      page: 1,
      pageSize: games.length,
      hasMore: false,
    })
  },

  async createGame(input: CreateGameInput): Promise<ApiResponse<PlayerGame>> {
    const payload: SaveGamePayload = {
      id: undefined,
      title: input.title,
      sport: input.sport,
      skillLevel: input.skillLevel,
      startDateTime: input.startTime.toISOString(),
      endDateTime: new Date(input.startTime.getTime() + input.duration * 60000).toISOString(),
      locationName: input.location?.name || input.location?.address || 'Location TBC',
      addressLine: input.location?.address ?? null,
      area: input.location?.area ?? null,
      city: input.location?.city ?? null,
      countryCode: input.location?.countryCode ?? null,
      latitude: input.location?.lat ?? null,
      longitude: input.location?.lng ?? null,
      capacity: input.maxAttendees,
      priceType: input.isFree ? 'free' : 'fixed',
      priceAmount: input.isFree ? null : input.pricePerPerson ?? null,
      description: input.description ?? '',
      notesForAttendees: input.notesForAttendees ?? null,
      coverPhotoUrl: input.coverPhotoUrl ?? null,
      status: 'published',
    }
    const game = await apiRequest<GameDetailDTO>('POST', '/games', { body: payload })
    return wrapSuccess(mapGameDtoToPlayerGame(game))
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
