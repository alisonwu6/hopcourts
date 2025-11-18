import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PlayerGame } from '@/types'
import { useGamesStore } from '@/hooks'

type TabKey = 'upcoming' | 'completed'

function isCompleted(game: PlayerGame) {
  if (game.completedDate) {
    return new Date(game.completedDate) < new Date()
  }
  return false
}

function groupByDate(games: PlayerGame[]) {
  const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
  const map = new Map<string, PlayerGame[]>()
  games.forEach((game) => {
    const label = formatter.format(game.startTime)
    map.set(label, [...(map.get(label) ?? []), game])
  })
  return Array.from(map.entries())
}

export function MyGamesPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('upcoming')
  const games = useGamesStore((state) => state.games)
  const fetchMyGames = useGamesStore((state) => state.fetchMyGames)
  const isLoading = useGamesStore((state) => state.isLoading)
  const error = useGamesStore((state) => state.error)

  useEffect(() => {
    void fetchMyGames()
  }, [fetchMyGames])

  const upcomingGames = useMemo(
    () => games.filter((game) => !isCompleted(game)),
    [games]
  )
  const completedGames = useMemo(
    () => games.filter((game) => isCompleted(game)),
    [games]
  )

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <div className="sticky top-0 z-10 border-b border-blue-200 bg-blue-50 px-4 py-3">
        <h1 className="text-lg font-bold text-blue-900">My Games</h1>
      </div>

      <div className="sticky top-14 z-10 flex border-b border-blue-200 bg-blue-50">
        <TabButton label={`Upcoming (${upcomingGames.length})`} active={tab === 'upcoming'} onClick={() => setTab('upcoming')} />
        <TabButton label={`Completed (${completedGames.length})`} active={tab === 'completed'} onClick={() => setTab('completed')} />
      </div>

      <div className="px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="py-10 text-center text-slate-500">Loading your games…</div>
        ) : tab === 'upcoming' ? (
          <GameGroupList
            groups={groupByDate(upcomingGames)}
            emptyState={
              <EmptyState icon="📭" title="No games yet" description="Browse games to join your first one" />
            }
          />
        ) : (
          <GameGroupList
            groups={groupByDate(completedGames)}
            emptyState={
              <EmptyState icon="✓" title="No completed games" description="Completed games will appear here" />
            }
          />
        )}
      </div>

      <div className="px-4 py-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full py-2 text-sm font-semibold text-blue-600 hover:underline"
        >
          Browse more games
        </button>
      </div>
    </div>
  )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 text-center text-sm font-semibold transition ${
        active ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
      }`}
    >
      {label}
    </button>
  )
}

function GameGroupList({
  groups,
  emptyState,
}: {
  groups: Array<[string, PlayerGame[]]>
  emptyState: JSX.Element
}) {
  const navigate = useNavigate()

  if (groups.length === 0) {
    return emptyState
  }

  return (
    <div className="space-y-6">
      {groups.map(([dateLabel, games]) => (
        <div key={dateLabel}>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">{dateLabel}</h3>
          <div className="space-y-3">
            {games.map((game) => (
              <button
                key={game.id}
                type="button"
                onClick={() => navigate(`/game/${game.id}`)}
                className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{game.title}</h4>
                    <p className="mt-2 text-xs text-gray-600">
                      {new Date(game.startTime).toLocaleDateString()} ·{' '}
                      {new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">📍 {game.location.name}</p>
                    <p className="mt-2 text-xs font-semibold text-blue-600">
                      {isCompleted(game)
                        ? '⭐⭐⭐⭐⭐ Leave review →'
                        : `✓ Joined (${game.attendeeCount}/${game.maxAttendees})`}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xl text-white">
                    {resolveSportIcon(game.sport)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-center">
      <div className="text-4xl">{icon}</div>
      <h3 className="mt-3 text-lg font-bold text-blue-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  )
}

const sportIcons: Record<string, string> = {
  running: '🏃',
  basketball: '🏀',
  climbing: '🧗',
  tennis: '🎾',
}

function resolveSportIcon(sport: string) {
  return sportIcons[sport.toLowerCase()] ?? '⚽'
}
