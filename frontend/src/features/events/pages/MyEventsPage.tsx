import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PlayerEvent } from '@/types'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'

type TabKey = 'upcoming' | 'completed'

function isCompleted(event: PlayerEvent) {
  if (event.completedDate) {
    return new Date(event.completedDate) < new Date()
  }
  return false
}

function groupByDate(events: PlayerEvent[]) {
  const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
  const map = new Map<string, PlayerEvent[]>()
  events.forEach((event) => {
    const label = formatter.format(event.startTime)
    map.set(label, [...(map.get(label) ?? []), event])
  })
  return Array.from(map.entries())
}

export function MyEventsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('upcoming')
  const events = useEventsStore((state) => state.events)
  const fetchMyEvents = useEventsStore((state) => state.fetchMyEvents)
  const isLoading = useEventsStore((state) => state.isLoading)
  const error = useEventsStore((state) => state.error)

  useEffect(() => {
    void fetchMyEvents()
  }, [fetchMyEvents])

  const upcomingEvents = useMemo(() => events.filter((event) => !isCompleted(event)), [events])
  const completedEvents = useMemo(() => events.filter((event) => isCompleted(event)), [events])

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <div className="sticky top-0 z-10 border-b border-blue-200 bg-blue-50 px-4 py-3">
        <h1 className="text-lg font-bold text-blue-900">My Events</h1>
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
          <div className="py-10 text-center text-slate-500">Loading your events…</div>
        ) : tab === 'upcoming' ? (
          <EventGroupList
            groups={groupByDate(upcomingEvents)}
            emptyState={<EmptyState icon="📭" title="No events yet" description="Browse events to join your first one" />}
          />
        ) : (
          <EventGroupList
            groups={groupByDate(completedEvents)}
            emptyState={<EmptyState icon="✓" title="No completed events" description="Completed events will appear here" />}
          />
        )}
      </div>

      <div className="px-4 py-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full py-2 text-sm font-semibold text-blue-600 hover:underline"
        >
          Browse more events
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

function EventGroupList({
  groups,
  emptyState,
}: {
  groups: Array<[string, PlayerEvent[]]>
  emptyState: JSX.Element
}) {
  const navigate = useNavigate()

  if (groups.length === 0) {
    return emptyState
  }

  return (
    <div className="space-y-6">
      {groups.map(([dateLabel, groupedEvents]) => (
        <div key={dateLabel}>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">{dateLabel}</h3>
          <div className="space-y-3">
            {groupedEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => navigate(`/event/${event.id}`)}
                className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{event.title}</h4>
                    <p className="mt-2 text-xs text-gray-600">
                      {new Date(event.startTime).toLocaleDateString()} ·{' '}
                      {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">📍 {event.location.name}</p>
                    <p className="mt-2 text-xs font-semibold text-blue-600">
                      {isCompleted(event)
                        ? '⭐⭐⭐⭐⭐ Leave review →'
                        : `✓ Joined (${event.attendeeCount}/${event.maxAttendees})`}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xl text-white">
                    {resolveSportIcon(event.sport)}
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
