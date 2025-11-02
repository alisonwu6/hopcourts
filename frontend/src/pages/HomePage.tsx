import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CirclePlus } from 'lucide-react'
import { Button, GameCard } from '@/components'
import { FilterChips } from '@/components/athlete/FilterChips'
import { PLAYER_MOCK_GAMES } from '@/data/playerMocks'

const sports = ['All', 'Running', 'Basketball', 'Climbing', 'Tennis']


export function HomePage() {
  const navigate = useNavigate()
  const [selectedSport, setSelectedSport] = useState('All')

  const filteredGames = useMemo(() => {
    return selectedSport === 'All'
      ? PLAYER_MOCK_GAMES
      : PLAYER_MOCK_GAMES.filter(
          (game) => game.sport.toLowerCase() === selectedSport.toLowerCase()
        )
  }, [selectedSport])

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
        {filteredGames.length === 0 ? (
          <div className="py-10 text-center text-slate-500">No games found</div>
        ) : (
          filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onJoin={() => console.info('Join', game.id)}
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
        <CirclePlus className="h-26 w-26" />
      </Button>
    </div>
  )
}
