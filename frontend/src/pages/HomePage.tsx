import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, SessionCard } from '@/components'
import { useSessionsStore } from '@/hooks'

const sports = ['All', 'Running', 'Basketball', 'Climbing', 'Hiking']

const HEADER_HEIGHT_REM = 4
const FILTER_BAR_HEIGHT_REM = 3

export function HomePage() {
  const navigate = useNavigate()
  const { sessions, isLoading, fetchSessions } = useSessionsStore()
  const [selectedSport, setSelectedSport] = useState<string>('All')

  useEffect(() => {
    const filters = selectedSport === 'All' ? undefined : { sport: selectedSport }
    fetchSessions(filters)
  }, [selectedSport, fetchSessions])

  const sessionList = useMemo(() => sessions, [sessions])

  return (
    <div className="pb-24">
      <div className="fixed left-0 right-0 z-40 border-b border-slate-200 bg-white px-4 py-3.5 shadow-sm" style={{ top: `${HEADER_HEIGHT_REM}rem` }}>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1.5">
          {sports.map((sport) => {
            const active = sport === selectedSport
            return (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {sport}
              </button>
            )
          })}
        </div>
        <input
          type="text"
          placeholder="🔍 Search by sport or host"
          className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="px-4 py-6" style={{ marginTop: 'calc(7rem)' }}>
        {isLoading ? (
          <div className="py-10 text-center text-slate-500">Loading sessions…</div>
        ) : sessionList.length === 0 ? (
          <div className="py-10 text-center text-slate-500">No sessions found</div>
        ) : (
          sessionList.map((session) => (
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
