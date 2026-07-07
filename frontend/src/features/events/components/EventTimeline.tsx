import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bike } from 'lucide-react'
import { EmptyStateCard } from '@/components'
import type { PlayerEvent } from '@/types'
import { EventCard } from './EventCard'

export type SportsItem = { key: string; label: string; icon?: string | null }

export function groupEventsByDate(events: PlayerEvent[]) {
  const formatter = new Intl.DateTimeFormat('en-AU', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  const map = new Map<string, PlayerEvent[]>()
  events.forEach((event) => {
    const date = event.startTime ? new Date(event.startTime) : new Date(event.updatedAt || Date.now())
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    const base = formatter.format(date)
    const label = dateKey === todayKey ? `Today · ${base}` : base
    map.set(label, [...(map.get(label) ?? []), event])
  })
  return Array.from(map.entries())
}

export function getTimelineDotClass(event: PlayerEvent): string {
  const now = new Date()
  const start = new Date(event.startTime)
  const end = event.endTime ? new Date(event.endTime) : start
  const openMins = event.checkinOpenMinsBefore ?? 15
  const checkInStart = new Date(start.getTime() - openMins * 60000)
  if (now >= start && now <= end) return 'scale-125 bg-amber-500 ring-amber-300'
  if (now >= checkInStart && now < start) return 'scale-125 bg-emerald-500 ring-emerald-300'
  return 'bg-slate-200 ring-slate-200'
}

interface EventTimelineProps {
  events: PlayerEvent[]
  sportsCatalog: SportsItem[]
  mode?: 'hosted' | 'joined' | 'all' | 'saved'
  emptyState?: ReactNode
  onViewDetails?: (id: string) => void
  showBookmark?: boolean
}

export function EventTimeline({
  events,
  sportsCatalog,
  mode = 'all',
  emptyState,
  onViewDetails,
  showBookmark,
}: EventTimelineProps) {
  const navigate = useNavigate()
  const handleView = onViewDetails ?? ((id: string) => navigate(`/event/${id}`))
  const groups = groupEventsByDate(events)

  if (groups.length === 0) {
    return (
      emptyState ?? (
        <EmptyStateCard
          icon={<Bike className="h-8 w-8 text-slate-400" />}
          title="No events yet"
          description="Events will appear here."
        />
      )
    )
  }

  return (
    <div className="space-y-8">
      {groups.map(([dateLabel, groupEvents]) => (
        <div key={dateLabel}>
          <h3 className="mb-4 pl-1 text-xs font-bold uppercase tracking-wide text-gray-500">{dateLabel}</h3>
          <div className="relative ml-3 space-y-6 border-l border-slate-200 pb-2">
            {groupEvents.map((event) => {
              const sportLabel =
                sportsCatalog.find((s) => s.key.toUpperCase() === event.sport.toUpperCase())?.label ?? event.sport
              return (
                <div
                  key={event.id}
                  className="relative pl-6"
                >
                  <span
                    className={`absolute -left-[5px] top-8 h-2.5 w-2.5 rounded-full border-2 border-white ring-1 ${getTimelineDotClass(event)}`}
                  />
                  <EventCard
                    event={event}
                    sportLabel={sportLabel}
                    showBookmark={showBookmark}
                    onViewDetails={(id) => {
                      if (mode === 'hosted' && event.status === 'draft') {
                        navigate(`/create-event?id=${id}`, { state: { backTo: '/profile/hosted-events?tab=draft' } })
                      } else {
                        handleView(id)
                      }
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
