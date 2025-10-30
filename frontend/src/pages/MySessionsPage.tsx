import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PLAYER_MOCK_SESSIONS, type PlayerSession } from '@/data/playerMocks'

type TabKey = 'upcoming' | 'completed'

function isCompleted(session: PlayerSession) {
  return Boolean(session.completedDate && session.completedDate < new Date())
}

function groupByDate(sessions: PlayerSession[]) {
  const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
  const map = new Map<string, PlayerSession[]>()
  sessions.forEach((session) => {
    const label = formatter.format(session.startTime)
    map.set(label, [...(map.get(label) ?? []), session])
  })
  return Array.from(map.entries())
}

export function MySessionsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('upcoming')

  const upcomingSessions = useMemo(
    () => PLAYER_MOCK_SESSIONS.filter((session) => !isCompleted(session)),
    []
  )
  const completedSessions = useMemo(
    () => PLAYER_MOCK_SESSIONS.filter((session) => isCompleted(session)),
    []
  )

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <div className="sticky top-0 z-10 border-b border-blue-200 bg-blue-50 px-4 py-3">
        <h1 className="text-lg font-bold text-blue-900">My Games</h1>
      </div>

      <div className="sticky top-14 z-10 flex border-b border-blue-200 bg-blue-50">
        <TabButton label={`Upcoming (${upcomingSessions.length})`} active={tab === 'upcoming'} onClick={() => setTab('upcoming')} />
        <TabButton label={`Completed (${completedSessions.length})`} active={tab === 'completed'} onClick={() => setTab('completed')} />
      </div>

      <div className="px-4 py-6">
        {tab === 'upcoming' ? (
          <SessionGroupList
            groups={groupByDate(upcomingSessions)}
            emptyState={
              <EmptyState icon="📭" title="No games yet" description="Browse games to join your first one" />
            }
          />
        ) : (
          <SessionGroupList
            groups={groupByDate(completedSessions)}
            emptyState={
              <EmptyState icon="✓" title="No completed games" description="Completed games will appear here" />
            }
          />
        )}
      </div>

      <div className="px-4 py-4">
        <button
          type="button"
          onClick={() => navigate('/home')}
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

function SessionGroupList({
  groups,
  emptyState,
}: {
  groups: Array<[string, PlayerSession[]]>
  emptyState: JSX.Element
}) {
  const navigate = useNavigate()

  if (groups.length === 0) {
    return emptyState
  }

  return (
    <div className="space-y-6">
      {groups.map(([dateLabel, sessions]) => (
        <div key={dateLabel}>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">{dateLabel}</h3>
          <div className="space-y-3">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => navigate(`/session/${session.id}`)}
                className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{session.title}</h4>
                    <p className="mt-2 text-xs text-gray-600">
                      {session.startTime.toLocaleDateString()} ·{' '}
                      {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">📍 {session.location.name}</p>
                    <p className="mt-2 text-xs font-semibold text-blue-600">
                      {isCompleted(session)
                        ? '⭐⭐⭐⭐⭐ Leave review →'
                        : `✓ Joined (${session.attendeeCount}/${session.maxAttendees})`}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xl text-white">
                    {resolveSportIcon(session.sport)}
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
