import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, SessionCard } from '@/components'
import { FilterChips } from '@/components/athlete/FilterChips'
import { PLAYER_MOCK_SESSIONS } from '@/data/playerMocks'

const sports = ['All', 'Running', 'Basketball', 'Climbing', 'Tennis']

const HEADER_HEIGHT_REM = 4
const FILTER_BAR_HEIGHT_REM = 0

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
        style={{ top: `${HEADER_HEIGHT_REM}rem` }}
      >
        <FilterChips
          filters={sports}
          selected={selectedSport}
          onSelect={setSelectedSport}
          className="pt-4"
        />
      </div>

      <div className="px-4 py-6 mt-[3rem]">
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
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full text-2xl"
        onClick={() => navigate('/create-session')}
      >
        +
      </Button>
    </div>
  )
}
