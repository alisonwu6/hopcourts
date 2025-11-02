import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CirclePlus } from 'lucide-react'
import { Button, SessionCard } from '@/components'
import { FilterChips } from '@/components/athlete/FilterChips'
import { PLAYER_MOCK_SESSIONS } from '@/data/playerMocks'

const sports = ['All', 'Running', 'Basketball', 'Climbing', 'Tennis']


export function HomePage() {
  const navigate = useNavigate()
  const [selectedSport, setSelectedSport] = useState('All')

  const filteredSessions = useMemo(() => {
    return selectedSport === 'All'
      ? PLAYER_MOCK_SESSIONS
      : PLAYER_MOCK_SESSIONS.filter(
          (session) => session.sport.toLowerCase() === selectedSport.toLowerCase()
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
        {filteredSessions.length === 0 ? (
          <div className="py-10 text-center text-slate-500">No games found</div>
        ) : (
          filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onJoin={() => console.info('Join', session.id)}
              onViewDetails={() => navigate(`/session/${session.id}`)}
            />
          ))
        )}
      </div>

      <Button
        className="fixed bottom-24 right-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-player-600 text-white shadow-lg transition hover:bg-player-700"
        onClick={() => navigate('/create-session')}
        aria-label="Create session"
      >
        <CirclePlus className="h-26 w-26" />
      </Button>
    </div>
  )
}
