import React, { useState, useMemo } from 'react'
import { format, isSameDay, isSameMonth, isToday, subMonths, addMonths, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { VenueMatrixGrid } from './VenueMatrixGrid'

interface OperatingDay {
  day: string        // 'Monday', 'Tuesday', …
  open_time: string  // 'HH:mm'
  close_time: string // 'HH:mm'
  is_closed: boolean
}

function hoursForDate(date: Date, operatingHours: OperatingDay[]): string[] {
  const dayName = format(date, 'EEEE') // 'Monday', …
  const config = operatingHours.find((h) => h.day === dayName)
  if (!config || config.is_closed) return []
  const open = parseInt(config.open_time.split(':')[0], 10)
  const close = parseInt(config.close_time.split(':')[0], 10)
  // open >= close means misconfigured (e.g. 22:00–22:00) — treat as closed.
  if (open >= close) return []
  const result: string[] = []
  for (let h = open; h < close; h++) result.push(String(h).padStart(2, '0'))
  return result
}

const FALLBACK_HOURS = ['07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22']

interface GeneratedSession {
  id: string
  date: Date
  start_time: string
  end_time: string
  sport: string
  status: 'published' | 'cancelled' | 'draft' | 'completed' | 'full'
  participants_count: number
}

interface Court {
  id: string
  name: string
}

interface CalendarGridProps {
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  calendarDays: Date[]
  generatedSessions: GeneratedSession[]
  setSelectedSession: (session: GeneratedSession) => void
  courts: Court[]
  operatingHours?: OperatingDay[]
  venueName?: string
}

type CalViewMode = 'month' | 'daily_grid'

function getWeekStart(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

// ─── Week date strip ──────────────────────────────────────────────────────────

function WeekStrip({
  date,
  onChange,
}: {
  date: Date
  onChange: (d: Date) => void
}) {
  // Keep the operator view aligned with the public calendar week strip.
  const weekStart = useMemo(() => {
    return getWeekStart(date)
  }, [date])

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  return (
    <div className="border-b border-slate-100 bg-white px-4 pb-5 pt-4">
      <div className="grid grid-cols-7 text-center">
        {['MO','TU','WE','TH','FR','SA','SU'].map((d) => (
          <div key={d} className="text-[10px] font-bold tracking-wider text-slate-400">{d}</div>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-7 text-center">
        {days.map((d) => {
          const selected = isSameDay(d, date)
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onChange(d)}
              className="flex flex-col items-center"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  selected
                    ? 'bg-[#1A3A0A] text-white'
                    : 'text-slate-600 hover:bg-[#eef8df] hover:text-[#1A3A0A]'
                }`}
              >
                {format(d, 'd')}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export const VenueCalendarGrid: React.FC<CalendarGridProps> = ({
  currentMonth,
  setCurrentMonth,
  calendarDays,
  generatedSessions,
  setSelectedSession,
  courts,
  operatingHours = [],
}) => {
  const navigate = useNavigate()
  const { venueId } = useParams<{ venueId: string }>()
  const [calViewMode, setCalViewMode] = useState<CalViewMode>('daily_grid')
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())

  // Derive hours for the currently selected day from venue operating hours.
  const activeHours = useMemo(() => {
    if (!operatingHours.length) return FALLBACK_HOURS
    const derived = hoursForDate(selectedDay, operatingHours)
    return derived.length ? derived : FALLBACK_HOURS
  }, [selectedDay, operatingHours])

  const openCreateAvailableSlot = (cell: {
    courtId: string
    courtName: string
    sport?: string
    hour: string
  }) => {
    if (!venueId) return

    const startHour = Number(cell.hour)
    const endHour = Math.min(startHour + 1, 23)
    const params = new URLSearchParams({
      courtId: cell.courtId,
      courtName: cell.courtName,
      date: format(selectedDay, 'yyyy-MM-dd'),
      startTime: `${String(startHour).padStart(2, '0')}:00`,
      endTime: `${String(endHour).padStart(2, '0')}:00`,
    })

    if (cell.sport) params.set('sport', cell.sport)
    navigate(`/admin/${venueId}/sessions/create?${params.toString()}`)
  }

  const selectDay = (day: Date) => {
    setSelectedDay(day)
    setCurrentMonth(day)
  }

  const handleDayClick = (day: Date) => {
    selectDay(day)
  }

  const shiftDay = (delta: number) => {
    const next = new Date(selectedDay)
    next.setDate(next.getDate() + delta)
    setSelectedDay(next)
    setCurrentMonth(next)
  }

  const shiftMonth = (delta: number) => {
    const next = delta > 0 ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1)
    setCurrentMonth(next)
    setSelectedDay(next)
  }

  const shiftCalendar = (delta: number) => {
    if (calViewMode === 'month') {
      shiftMonth(delta)
      return
    }
    shiftDay(delta * 7)
  }

  const weekStart = getWeekStart(selectedDay)
  const weekEnd = addDays(weekStart, 6)
  const calendarTitle = calViewMode === 'month'
    ? format(currentMonth, 'MMMM yyyy')
    : `${format(weekStart, 'd MMM')} – ${format(weekEnd, 'd MMM yyyy')}`

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-[#dfe7dc] bg-white font-sans text-slate-900 shadow-sm">
        <div className="border-b border-slate-100 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => shiftCalendar(-1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-[#eef8df] hover:text-[#1A3A0A]"
              aria-label={calViewMode === 'month' ? 'Previous month' : 'Previous week'}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                const today = new Date()
                setSelectedDay(today)
                setCurrentMonth(today)
              }}
              className="min-w-0 flex-1 truncate text-center text-sm font-black text-slate-900"
            >
              {calendarTitle}
            </button>

            <button
              type="button"
              onClick={() => shiftCalendar(1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-[#eef8df] hover:text-[#1A3A0A]"
              aria-label={calViewMode === 'month' ? 'Next month' : 'Next week'}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="flex shrink-0 rounded-full bg-slate-100 p-0.5 shadow-inner">
              <button
                type="button"
                onClick={() => setCalViewMode('daily_grid')}
                className={`h-8 min-w-9 rounded-full px-3 text-xs font-black transition ${
                  calViewMode === 'daily_grid'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400'
                }`}
              >
                W
              </button>
              <button
                type="button"
                onClick={() => setCalViewMode('month')}
                className={`h-8 min-w-9 rounded-full px-3 text-xs font-black transition ${
                  calViewMode === 'month'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400'
                }`}
              >
                M
              </button>
            </div>
          </div>
        </div>

        {/* ── Date picker: month or week ── */}
        {calViewMode === 'month' && (
          <div className="border-b border-slate-100 bg-white px-4 pb-6 pt-4">
            <div className="grid grid-cols-7 text-center">
              {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((d) => (
                <div
                  key={d}
                  className="text-[10px] font-black tracking-wider text-slate-400"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-7 gap-y-5 text-center">
              {calendarDays.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isTodayDay = isToday(day)
                const selected = isSameDay(day, selectedDay)

                return (
                  <button
                    key={idx}
                    onClick={() => isCurrentMonth && handleDayClick(day)}
                    disabled={!isCurrentMonth}
                    className="flex h-8 items-center justify-center disabled:pointer-events-none"
                  >
                    {isCurrentMonth && (
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${
                          selected
                            ? 'bg-slate-900 text-white'
                            : isTodayDay
                              ? 'bg-[#eef8df] text-[#1A3A0A]'
                              : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {calViewMode === 'daily_grid' && (
          <WeekStrip date={selectedDay} onChange={selectDay} />
        )}

        {/* ── Matrix table always reflects the selected date ── */}
        <div className="p-4">
          <VenueMatrixGrid
            date={selectedDay}
            courts={courts}
            hours={activeHours}
            onViewSession={setSelectedSession as (s: any) => void}
            onCreateAvailableSlot={openCreateAvailableSlot}
            sessions={generatedSessions}
          />
        </div>
      </div>
    </>
  )
}
