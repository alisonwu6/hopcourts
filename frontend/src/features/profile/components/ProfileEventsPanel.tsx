import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import type { PlayerEvent } from '@/types'
import { useAuthStore } from '@/hooks'
import { useSports } from '@/features/dictionaries/hooks'
import { eventsService } from '@/features/events/services/eventsService'
import { EventCard } from '@/features/events/components/EventCard'
import { Bike, BicepsFlexed, ChevronLeft, ChevronRight } from 'lucide-react'

type TabKey = 'upcoming' | 'history'
type PanelMode = 'all' | 'hosted' | 'joined'
type SportsItem = { key: string; label: string; icon?: string | null }
type EventStatus = 'check-in-open' | 'ongoing' | null

function groupByDate(events: PlayerEvent[]) {
  const formatter = new Intl.DateTimeFormat('en-AU', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const map = new Map<string, PlayerEvent[]>()
  events.forEach((event) => {
    const date = event.startTime ? new Date(event.startTime) : new Date(event.updatedAt || Date.now())
    const label = formatter.format(date)
    map.set(label, [...(map.get(label) ?? []), event])
  })
  return Array.from(map.entries())
}

function getEventStatus(event: PlayerEvent): EventStatus {
  const now = new Date()
  const start = new Date(event.startTime)
  const end = event.endTime ? new Date(event.endTime) : start

  if (event.status === 'draft') return null

  const openMins = event.checkinOpenMinsBefore ?? 15
  const checkInStart = new Date(start.getTime() - openMins * 60000)
  if (now >= start && now <= end) return 'ongoing'
  if (now >= checkInStart && now < start) return 'check-in-open'
  return null
}

function EventGroupList({
  groups,
  mode,
  sportsCatalog,
  emptyState,
}: {
  groups: Array<[string, PlayerEvent[]]>
  mode: PanelMode
  sportsCatalog: SportsItem[]
  emptyState: React.ReactNode
}) {
  const navigate = useNavigate()
  if (groups.length === 0) return emptyState

  return (
    <div className="space-y-8">
      {groups.map(([dateLabel, groupedEvents]) => (
        <div key={dateLabel}>
          <h3 className="mb-4 pl-1 text-xs font-bold uppercase tracking-wide text-gray-500">{dateLabel}</h3>
          <div className="relative ml-3 space-y-6 border-l border-slate-200 pb-2">
            {groupedEvents.map((event) => {
              const status = getEventStatus(event)
              const sportItem = sportsCatalog.find((s) => s.key.toUpperCase() === event.sport.toUpperCase())
              const sportLabel = sportItem?.label || event.sport
              return (
                <div
                  key={event.id}
                  className="relative pl-6"
                >
                  <span
                    className={`absolute -left-[5px] top-8 h-2.5 w-2.5 rounded-full border-2 border-white ring-1 ${status === 'check-in-open' ? 'scale-125 bg-emerald-500 ring-emerald-300' : status === 'ongoing' ? 'scale-125 bg-amber-500 ring-amber-300' : 'bg-slate-200 ring-slate-200'}`}
                  />
                  <EventCard
                    event={event}
                    sportLabel={sportLabel}
                    showStatus={mode === 'hosted'}
                    onViewDetails={(id) => {
                      if (mode === 'hosted' && event.status === 'draft') {
                        navigate(`/create-event?id=${id}`)
                      } else {
                        navigate(`/event/${id}`)
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

function EmptyState({
  icon,
  title,
  description,
  onExplore,
}: {
  icon: ReactNode
  title: string
  description: string
  onExplore?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
      <div className="p-2 text-4xl">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1 px-10 text-sm text-slate-500">{description}</p>
      {onExplore && (
        <button
          type="button"
          onClick={onExplore}
          className="mt-5 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition"
        >
          Explore Events
        </button>
      )}
    </div>
  )
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

type CalendarSpan = 'week' | 'month'

function CalendarView({
  events,
  sportsCatalog,
  mode,
  onExplore,
}: {
  events: PlayerEvent[]
  sportsCatalog: SportsItem[]
  mode: PanelMode
  onExplore?: () => void
}) {
  const navigate = useNavigate()
  const today = useMemo(() => new Date(), [])
  const [span, setSpan] = useState<CalendarSpan>('week')
  const [cursor, setCursor] = useState<Date>(() => today)
  const [selected, setSelected] = useState<Date>(() => today)

  // Derived grid days based on span
  const { days, prefixBlanks, navLabel } = useMemo(() => {
    if (span === 'week') {
      const weekStart = startOfWeek(cursor)
      const weekEnd = endOfWeek(cursor)
      const weekLabel =
        isSameMonth(weekStart, weekEnd)
          ? `${format(weekStart, 'd')} – ${format(weekEnd, 'd MMM yyyy')}`
          : `${format(weekStart, 'd MMM')} – ${format(weekEnd, 'd MMM yyyy')}`
      return { days: eachDayOfInterval({ start: weekStart, end: weekEnd }), prefixBlanks: 0, navLabel: weekLabel }
    }
    const monthStart = startOfMonth(cursor)
    const monthEnd = endOfMonth(cursor)
    return {
      days: eachDayOfInterval({ start: monthStart, end: monthEnd }),
      prefixBlanks: getDay(monthStart),
      navLabel: format(cursor, 'MMMM yyyy'),
    }
  }, [span, cursor])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, PlayerEvent[]>()
    events.forEach((e) => {
      const key = format(new Date(e.startTime), 'yyyy-MM-dd')
      map.set(key, [...(map.get(key) ?? []), e])
    })
    return map
  }, [events])

  const selectedDayEvents = useMemo(
    () => eventsByDay.get(format(selected, 'yyyy-MM-dd')) ?? [],
    [selected, eventsByDay]
  )
  const selectedIsToday = isSameDay(selected, today)

  function goBack() {
    setCursor((c) => span === 'week' ? subWeeks(c, 1) : subMonths(c, 1))
  }
  function goForward() {
    setCursor((c) => span === 'week' ? addWeeks(c, 1) : addMonths(c, 1))
  }
  function switchSpan(next: CalendarSpan) {
    setSpan(next)
    setCursor(selected)
  }

  return (
    <div className="space-y-3">
      {/* Navigation bar */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 active:bg-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="flex-1 text-center text-sm font-bold text-slate-800">{navLabel}</span>
        <button
          type="button"
          onClick={goForward}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 active:bg-slate-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Week / Month pill */}
        <div className="flex shrink-0 rounded-full bg-slate-100 p-0.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => switchSpan('week')}
            className={`rounded-full px-3 py-1 transition ${span === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
          >
            W
          </button>
          <button
            type="button"
            onClick={() => switchSpan('month')}
            className={`rounded-full px-3 py-1 transition ${span === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
          >
            M
          </button>
        </div>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 text-center">
        {DAY_LABELS.map((d) => (
          <span key={d} className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{d}</span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {Array.from({ length: prefixBlanks }).map((_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayEvents = eventsByDay.get(key) ?? []
          const hasEvents = dayEvents.length > 0
          const isSelected = isSameDay(day, selected)
          const isToday = isSameDay(day, today)

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(day)}
              className="flex flex-col items-center gap-0.5 py-1"
            >
              <span
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : isToday
                      ? 'bg-slate-100 text-slate-900'
                      : isSameMonth(day, cursor)
                        ? 'text-slate-700'
                        : 'text-slate-300',
                ].join(' ')}
              >
                {format(day, 'd')}
              </span>
              {hasEvents && (
                <span className="flex gap-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white/60' : 'bg-indigo-400'}`}
                    />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day events — always shown */}
      <div className="space-y-3 pt-1">
        <p className="pl-1 text-xs font-bold uppercase tracking-wide text-slate-500">
          {selectedIsToday ? 'Today · ' : ''}{format(selected, 'EEE, d MMM')}
        </p>
        {selectedDayEvents.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm font-medium text-slate-500">
              {selectedIsToday ? 'No events for today' : 'No events this day'}
            </p>
            {selectedIsToday && onExplore && (
              <button
                type="button"
                onClick={onExplore}
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-95"
              >
                Explore events
              </button>
            )}
          </div>
        ) : (
          selectedDayEvents.map((event) => {
            const sportLabel =
              sportsCatalog.find((s) => s.key.toUpperCase() === event.sport.toUpperCase())?.label ?? event.sport
            return (
              <EventCard
                key={event.id}
                event={event}
                sportLabel={sportLabel}
                showStatus={mode === 'hosted'}
                onViewDetails={(id) => {
                  if (mode === 'hosted' && event.status === 'draft') {
                    navigate(`/create-event?id=${id}`)
                  } else {
                    navigate(`/event/${id}`)
                  }
                }}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

export function ProfileEventsPanel({
  mode,
  showTimeTabs = true,
  onExplore,
}: {
  mode: PanelMode
  showTimeTabs?: boolean
  onExplore?: () => void
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as TabKey) || 'upcoming'
  const [events, setEvents] = useState<PlayerEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setTab = (newTab: TabKey) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('tab', newTab)
        return next
      },
      { replace: true }
    )
  }

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { items: sportsCatalog } = useSports('en')

  useEffect(() => {
    if (!isAuthenticated) {
      setEvents([])
      setIsLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const role = mode === 'all' ? 'all' : mode
        const time: 'upcoming' | 'history' = showTimeTabs ? tab : 'upcoming'
        const res = await eventsService.getMyEventsScoped({ role, time }, { force: true })
        if (cancelled) return
        if (res.success && res.data) {
          setEvents(res.data.data ?? [])
        } else {
          setEvents([])
          setError(res.error?.message ?? 'Failed to load events')
        }
      } catch {
        if (!cancelled) {
          setEvents([])
          setError('An error occurred')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, mode, showTimeTabs, tab])

  const upcomingEvents = useMemo(() => events.filter((event) => new Date(event.endTime) >= new Date()), [events])
  const historyEvents = useMemo(() => events.filter((event) => new Date(event.endTime) < new Date()), [events])

  const activeTab: TabKey = showTimeTabs ? tab : 'upcoming'
  const activeEvents = activeTab === 'upcoming' ? upcomingEvents : historyEvents
  const upcomingLabel = 'Upcoming'
  const historyLabel = 'History'
  const empty =
    activeTab === 'upcoming'
      ? {
          icon: <Bike className="h-8 w-8" />,
          title:
            mode === 'hosted' ? 'No hosted events yet' : mode === 'joined' ? 'No joined events yet' : 'No events yet',
          description:
            mode === 'hosted'
              ? 'Create an event and invite your mates!'
              : 'Browse games happening around you and join the action.',
        }
      : {
          icon: <BicepsFlexed className="h-8 w-8" />,
          title:
            mode === 'hosted'
              ? 'No past hosted events'
              : mode === 'joined'
                ? 'No past joined events'
                : 'No past events',
          description: 'Completed events will appear here.',
        }

  return (
    <div className="space-y-4">
      {showTimeTabs && (
        <div className="flex rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab('upcoming')}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${tab === 'upcoming' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
          >
            {upcomingLabel}
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${tab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
          >
            {historyLabel}
          </button>
        </div>
      )}

      <div className="min-h-[200px]">
        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}
        {isLoading ? (
          <div className="py-10 text-center text-slate-500">Loading your events...</div>
        ) : (
          <CalendarView
            events={activeEvents}
            sportsCatalog={sportsCatalog}
            mode={mode === 'all' ? 'hosted' : mode}
            onExplore={onExplore}
          />
        )}
      </div>
    </div>
  )
}
