import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, PenLine } from 'lucide-react'
import { Button, GameCard } from '@/components'
import { FilterChips } from '@/components/athlete/FilterChips'
import { useGamesStore } from '@/hooks'

const sports = ['All', 'Basketball', 'Badminton', 'Pickleball', 'Climbing', 'Running', 'Hiking']


export function HomePage() {
  const navigate = useNavigate()
  const [selectedSport, setSelectedSport] = useState('All')
  const games = useGamesStore((state) => state.games)
  const isLoading = useGamesStore((state) => state.isLoading)
  const error = useGamesStore((state) => state.error)
  const fetchGames = useGamesStore((state) => state.fetchGames)

  useEffect(() => {
    void fetchGames()
  }, [fetchGames])

  const filteredGames = useMemo(() => {
    if (selectedSport === 'All') return games
    return games.filter(
      (game) => game.sport.toLowerCase() === selectedSport.toLowerCase()
    )
  }, [games, selectedSport])

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <div
        className="fixed left-0 right-0 z-40 border-b border-slate-200 bg-white shadow-sm"
        style={{ top: '80px'}}
      >
        <div className="mx-auto w-full max-w-4xl px-4">
          <FilterChips
            filters={sports}
            selected={selectedSport}
            onSelect={setSelectedSport}
          />
        </div>
      </div>

      <div className="mx-auto mt-[3rem] w-full max-w-4xl px-4 py-6">
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
            <GameCard
              key={game.id}
              game={game}
              onViewDetails={() => navigate(`/game/${game.id}`)}
            />
          ))
        )}
      </div>

      <Button
        className="fixed bottom-24 right-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-player-600 text-white shadow-lg transition hover:bg-player-700"
        onClick={() => navigate('/create-game')}
        aria-label="Create game"
      >
        <span className="relative flex h-6 w-6 items-center justify-center">
          <MapPin className="h-6 w-6" strokeWidth={2} />
          <PenLine className="absolute bottom-0 right-0 h-3 w-3" strokeWidth={2} />
        </span>
      </Button>
    </div>
  )
}
