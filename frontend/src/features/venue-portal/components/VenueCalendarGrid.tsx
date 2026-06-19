import React from 'react'
import { format, isSameDay, isSameMonth, isToday, subMonths, addMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { VenueBadge } from './ui/VenueBadge'

interface GeneratedSession {
  id: string
  date: Date
  start_time: string
  end_time: string
  sport: string
  status: 'published' | 'cancelled' | 'draft' | 'completed' | 'full'
  participants_count: number
}

interface CalendarGridProps {
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  calendarDays: Date[]
  generatedSessions: GeneratedSession[]
  isCompact: boolean
  setIsCompact: (compact: boolean) => void
  setSelectedSession: (session: GeneratedSession) => void
  setViewMode: (mode: 'calendar' | 'template') => void
}

export const VenueCalendarGrid: React.FC<CalendarGridProps> = ({
  currentMonth,
  setCurrentMonth,
  calendarDays,
  generatedSessions,
  isCompact,
  setIsCompact,
  setSelectedSession,
  setViewMode,
}) => {
  return (
    <div className="border-collapse overflow-hidden rounded-2xl border border-slate-100 bg-white font-sans text-slate-900 shadow-md">
      {/* Calendar Controls */}
      <div className="flex items-center justify-between border-b border-slate-50 p-4 md:p-5">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-1 rounded-lg border border-slate-100 bg-slate-50/50 p-0.5 shadow-inner">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="rounded-md p-1 transition-colors hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4 text-slate-400" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:text-venue-600"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="rounded-md p-1 transition-colors hover:bg-white"
            >
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCompact(!isCompact)}
            className={`rounded-lg border px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${isCompact ? 'border-venue-100 bg-venue-50 text-venue-600' : 'border-slate-100 bg-white text-slate-400 hover:text-slate-600'}`}
          >
            {isCompact ? 'Standard' : 'Compact'}
          </button>
          <div className="hidden items-center gap-1.5 rounded-xl border border-emerald-100/50 bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 ring-1 ring-emerald-400/20 md:flex">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></div>
            Inventory Live
          </div>
        </div>
      </div>

      {/* Calendar Grid Header */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 shadow-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-[9px] font-black uppercase tracking-widest text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="grid grid-cols-7 bg-white">
          {calendarDays.map((day, idx) => {
            const sessionsOnDay = generatedSessions.filter((s) => isSameDay(s.date, day))
            const is_Today = isToday(day)
            const is_CurrentMonth = isSameMonth(day, currentMonth)

            return (
              <div
                key={idx}
                className={`${isCompact ? 'min-h-[85px] p-1.5' : 'min-h-[140px] p-2.5'} border-b border-r border-slate-50 transition-all ${!is_CurrentMonth ? 'bg-slate-50/10' : 'bg-white hover:bg-slate-50/30'}`}
              >
                <div className="mb-2 flex items-center justify-center">
                  <span
                    className={`${isCompact ? 'h-5 w-5 text-[9px]' : 'h-7 w-7 text-xs'} flex items-center justify-center rounded-xl font-black transition-all ${is_Today ? 'bg-venue-600 text-white shadow-lg shadow-venue-200' : is_CurrentMonth ? 'border border-slate-100 text-slate-900' : 'text-slate-200'}`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {sessionsOnDay.map((session) => {
                    const isCancelled = session.status === 'cancelled'
                    const isCompleted = session.status === 'completed'
                    const isFull = session.status === 'full'

                    return (
                      <div
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className={`group cursor-pointer rounded-xl border p-1.5 shadow-sm transition-all hover:scale-[1.02] ${isCancelled ? 'border-slate-100 bg-slate-50 opacity-50 grayscale' : isCompleted ? 'border-slate-200/50 bg-slate-100/50' : 'border-slate-100 bg-white hover:border-venue-100 hover:shadow-md hover:shadow-venue-50'}`}
                      >
                        <div className="flex items-center justify-between gap-1 overflow-hidden">
                          <div className="truncate text-[9px] font-black uppercase leading-none tracking-tight text-slate-800">
                            {session.sport}
                          </div>
                          {isFull && (
                            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400 shadow-sm shadow-amber-200"></div>
                          )}
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                          <div className="text-[8px] font-black uppercase tabular-nums text-slate-400 transition-colors group-hover:text-venue-500">
                            {session.start_time}
                          </div>
                          {!isCancelled && !isCompact && (
                            <div className="text-[7px] font-black uppercase text-slate-300">
                              {session.participants_count} Joins
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
