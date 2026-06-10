import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PlayerEvent } from '@/types'
import { EventCard } from './EventCard'

type SportsItem = { key: string; label: string; icon?: string | null }
type CalendarSpan = 'week' | 'month'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function DayCell({
  day,
  isSelected,
  isToday,
  inCurrentMonth,
  eventDots,
  onClick,
}: {
  day: Date
  isSelected: boolean
  isToday: boolean
  inCurrentMonth: boolean
  eventDots: number
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-0.5 py-1">
      <span
        className={[
          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
          isSelected
            ? 'bg-slate-900 text-white'
            : isToday
              ? 'bg-slate-100 text-slate-900'
              : inCurrentMonth
                ? 'text-slate-700'
                : 'text-slate-300',
        ].join(' ')}
      >
        {format(day, 'd')}
      </span>
      {eventDots > 0 && (
        <span className="flex gap-0.5">
          {Array.from({ length: Math.min(eventDots, 3) }).map((_, i) => (
            <span
              key={i}
              className={`h-1 w-1 rounded-full ${isSelected ? 'bg-slate-900' : 'bg-indigo-400'}`}
            />
          ))}
        </span>
      )}
    </button>
  )
}

function CalendarPanel({
  events,
  sportsCatalog,
  onViewDetails,
  onExplore,
  showBookmark,
}: {
  events: PlayerEvent[]
  sportsCatalog: SportsItem[]
  onViewDetails: (id: string, event: PlayerEvent) => void
  onExplore?: () => void
  showBookmark?: boolean
}) {
  const today = useMemo(() => new Date(), [])
  const [span, setSpan] = useState<CalendarSpan>('week')
  const [cursor, setCursor] = useState<Date>(() => today)
  const [selected, setSelected] = useState<Date>(() => today)

  const { days, prefixBlanks, navLabel } = useMemo(() => {
    if (span === 'week') {
      const weekStart = startOfWeek(cursor)
      const weekEnd = endOfWeek(cursor)
      const label =
        isSameMonth(weekStart, weekEnd)
          ? `${format(weekStart, 'd')} – ${format(weekEnd, 'd MMM yyyy')}`
          : `${format(weekStart, 'd MMM')} – ${format(weekEnd, 'd MMM yyyy')}`
      return { days: eachDayOfInterval({ start: weekStart, end: weekEnd }), prefixBlanks: 0, navLabel: label }
    }
    const monthStart = startOfMonth(cursor)
    return {
      days: eachDayOfInterval({ start: monthStart, end: endOfMonth(cursor) }),
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
          onClick={() => setCursor((c) => span === 'week' ? subWeeks(c, 1) : subMonths(c, 1))}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 active:bg-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="flex-1 text-center text-sm font-bold text-slate-800">{navLabel}</span>
        <button
          type="button"
          onClick={() => setCursor((c) => span === 'week' ? addWeeks(c, 1) : addMonths(c, 1))}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 active:bg-slate-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
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

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 text-center">
        {DAY_LABELS.map((d) => (
          <span key={d} className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{d}</span>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {Array.from({ length: prefixBlanks }).map((_, i) => <span key={`b-${i}`} />)}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          return (
            <DayCell
              key={key}
              day={day}
              isSelected={isSameDay(day, selected)}
              isToday={isSameDay(day, today)}
              inCurrentMonth={isSameMonth(day, cursor)}
              eventDots={(eventsByDay.get(key) ?? []).length}
              onClick={() => setSelected(day)}
            />
          )
        })}
      </div>

      {/* Selected day events */}
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
            const sportLabel = sportsCatalog.find((s) => s.key.toUpperCase() === event.sport.toUpperCase())?.label ?? event.sport
            return (
              <EventCard
                key={event.id}
                event={event}
                sportLabel={sportLabel}
                onViewDetails={(id) => onViewDetails(id, event)}
                showBookmark={showBookmark}
              />
            )
          })
        )}
      </div>
    </div>
  )
}


export function EventsViewPanel({
  events,
  sportsCatalog,
  onViewDetails,
  onExplore,
  showBookmark,
}: {
  events: PlayerEvent[]
  sportsCatalog: SportsItem[]
  onViewDetails: (id: string, event: PlayerEvent) => void
  onExplore?: () => void
  showBookmark?: boolean
}) {
  return (
    <CalendarPanel
      events={events}
      sportsCatalog={sportsCatalog}
      onViewDetails={onViewDetails}
      onExplore={onExplore}
      showBookmark={showBookmark}
    />
  )
}
