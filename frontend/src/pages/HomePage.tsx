import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPinPlus, Search, X } from 'lucide-react'
import { Button, GameCard } from '@/components'
import { useAuthStore, useGamesStore } from '@/hooks'

const sports = ['All', 'Basketball', 'Badminton', 'Pickleball', 'Climbing', 'Running', 'Hiking']

export function HomePage() {
  const navigate = useNavigate()
  const [selectedSports, setSelectedSports] = useState<string[]>(['All'])
  const [pendingSports, setPendingSports] = useState<string[]>(['All'])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const games = useGamesStore((state) => state.games)
  const isLoading = useGamesStore((state) => state.isLoading)
  const error = useGamesStore((state) => state.error)
  const fetchGames = useGamesStore((state) => state.fetchGames)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    void fetchGames()
  }, [fetchGames])

  const filteredGames = useMemo(() => {
    if (selectedSports.includes('All')) return games
    return games.filter((game) =>
      selectedSports.some((sport) => game.sport.toLowerCase() === sport.toLowerCase())
    )
  }, [games, selectedSports])

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <div
        className="fixed left-0 right-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm"
        style={{ top: '80px' }}
      >
        <div className="mx-auto flex w-full max-w-4xl items-center px-4 py-3">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300"
          >
            <Search className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
            <span className="flex-1 truncate">
              {selectedSports.includes('All') ? 'Start your search' : selectedSports.join(', ')}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              sport
            </span>
          </button>
        </div>
      </div>

      <div className="mx-auto mt-[6rem] w-full max-w-4xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center py-10 text-slate-500">Loading games…</div>
        ) : filteredGames.length === 0 ? (
          <div className="py-10 text-center text-slate-500">No games found</div>
        ) : (
          filteredGames.map((game) => (
            <GameCard key={game.id} game={game} onViewDetails={() => navigate(`/game/${game.id}`)} />
          ))
        )}
      </div>

      <Button
        className="fixed bottom-10 left-1/2 z-50 flex h-14 w-14 -translate-x-1/2 transform items-center justify-center rounded-full bg-player-600 text-white"
        onClick={() => navigate(isAuthenticated ? '/create-game' : '/login')}
        aria-label="Create game"
      >
        <span className="relative flex h-6 w-6 items-center justify-center">
          <MapPinPlus className="h-6 w-6" aria-hidden="true" />
        </span>
      </Button>

      <SportFilterSheet
        open={isFilterOpen}
        selected={pendingSports}
        onClose={() => setIsFilterOpen(false)}
        onReset={() => setPendingSports(['All'])}
        onToggle={(value) => {
          setPendingSports((prev) => {
            if (value === 'All') return ['All']
            const next = prev.filter((item) => item !== value && item !== 'All')
            const exists = prev.includes(value)
            return exists ? next : [...next, value]
          })
        }}
        onApply={() => {
          setSelectedSports(pendingSports.length ? pendingSports : ['All'])
          setIsFilterOpen(false)
        }}
      />
    </div>
  )
}

type SportFilterSheetProps = {
  open: boolean
  selected: string[]
  onToggle: (sport: string) => void
  onReset: () => void
  onApply: () => void
  onClose: () => void
}

function SportFilterSheet({
  open,
  selected,
  onToggle,
  onReset,
  onApply,
  onClose,
}: SportFilterSheetProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full rounded-t-[32px] bg-white shadow-[0_-20px_45px_rgba(15,41,77,0.18)] animate-[sheetIn_0.25s_ease-out]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              sport filter
            </p>
            <h2 className="text-xl font-semibold text-slate-900">What do you want to play?</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            aria-label="Close filter"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-3">
            {sports.map((sport) => {
              const isActive = selected.includes(sport) || (sport === 'All' && selected.includes('All'))
              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => onToggle(sport)}
                  className={clsx(
                    'flex h-16 items-center gap-3 rounded-[24px] border px-4 text-left text-sm font-semibold transition',
                    isActive
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:border-blue-200'
                  )}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg font-bold">
                    {sport.charAt(0)}
                  </span>
                  <div className="flex flex-col">
                    <span>{sport}</span>
                    <span className="text-xs font-normal text-slate-500">
                      {sport === 'All' ? 'Show everything' : 'Tap to filter'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
      <style>
        {`@keyframes sheetIn { from { transform: translateY(100%); } to { transform: translateY(0); } }`}
      </style>
    </div>
  )
}
