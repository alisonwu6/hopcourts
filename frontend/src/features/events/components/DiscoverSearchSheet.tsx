import clsx from 'clsx'
import { useEffect, useState } from 'react'
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BottomSheet } from '@/components'
import { SheetLayout } from '@/components/SheetLayout'

export type SportFilterOption = { key: string; label: string; icon?: string | null }

type DiscoverEventsSearchSheetProps = {
  open: boolean
  onClose: () => void
  initialDateRange: { start: Date | null; end: Date | null }
  initialSports: string[]
  sportsOptions: SportFilterOption[]
  eventsByDay: Record<string, number>
  onApply: (range: { start: Date | null; end: Date | null }, sports: string[]) => void
}

export function DiscoverEventsSearchSheet({
  open,
  onClose,
  initialDateRange,
  initialSports,
  sportsOptions,
  eventsByDay,
  onApply,
}: DiscoverEventsSearchSheetProps) {
  const [pendingRange, setPendingRange] = useState(initialDateRange)
  const [pendingSports, setPendingSports] = useState<string[]>(initialSports)
  const [calendarMonth, setCalendarMonth] = useState<Date>(startOfMonth(new Date()))
  const [activeTab, setActiveTab] = useState<'date' | 'sport'>('date')

  useEffect(() => {
    if (open) {
      setPendingRange(initialDateRange)
      setPendingSports(initialSports)
      if (initialDateRange.start) setCalendarMonth(startOfMonth(initialDateRange.start))
      else setCalendarMonth(startOfMonth(new Date()))
      setActiveTab('date')
    }
  }, [open, initialDateRange, initialSports])

  const handleClear = () => {
    setPendingRange({ start: null, end: null })
    setPendingSports(['all'])
  }

  const handleApply = () => {
    onApply(pendingRange, pendingSports)
  }

  if (!open) return null

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      showHandle
      disableContainer
      sheetClassName="flex h-[92vh] flex-col"
      contentClassName="flex flex-1 flex-col"
      maxWidthClassName="max-w-[480px]"
    >
      <SheetLayout
        onClose={onClose}
        title="Search Filters"
        subtitle="Customize your search filters"
        height="tall"
        className="flex h-full w-full flex-col rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
        contentClassName="flex-1 space-y-6 overflow-y-auto px-5 pb-6 pt-4"
        primaryButton={{
          label: 'Apply',
          onClick: handleApply,
        }}
        secondaryButton={{
          label: 'Clear All',
          onClick: handleClear,
          variant: 'ghost',
        }}
      >
        <div className="flex w-full rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('date')}
            className={clsx(
              'flex-1 rounded-full py-2 text-sm font-bold transition-all',
              activeTab === 'date' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            )}
          >
            Date
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sport')}
            className={clsx(
              'flex-1 rounded-full py-2 text-sm font-bold transition-all',
              activeTab === 'sport' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            )}
          >
            Sport
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'date' ? (
            <div className="p-2">
              <CalendarContent
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                range={pendingRange}
                onSelectRange={setPendingRange}
                counts={eventsByDay}
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sportsOptions.map((sport) => {
                const active =
                  pendingSports.includes(sport.key) ||
                  (sport.key === 'all' && pendingSports.includes('all'))
                return (
                  <button
                    key={sport.key}
                    onClick={() => {
                      setPendingSports((prev) => {
                        if (sport.key === 'all') return ['all']
                        const next = prev.filter((item) => item !== 'all' && item !== sport.key)
                        if (prev.includes(sport.key)) return next.length ? next : ['all']
                        return [...next, sport.key]
                      })
                    }}
                    className={clsx(
                      'flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition',
                      active
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700'
                    )}
                  >
                    <span className="text-base">{sport.icon || ''}</span>
                    <span>{sport.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </SheetLayout>
    </BottomSheet>
  )
}

type CalendarContentProps = {
  month: Date
  onMonthChange: (date: Date) => void
  range: { start: Date | null; end: Date | null }
  onSelectRange: (range: { start: Date | null; end: Date | null }) => void
  counts: Record<string, number>
}

function CalendarContent({
  month,
  onMonthChange,
  range,
  onSelectRange,
  counts,
}: CalendarContentProps) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const start = startOfWeek(monthStart, { weekStartsOn: 1 })
  const end = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let current = start
  while (current <= end) {
    days.push(current)
    current = addDays(current, 1)
  }

  const handleDayClick = (day: Date) => {
    if (!range.start || (range.start && range.end)) {
      onSelectRange({ start: day, end: null })
      return
    }

    if (isSameDay(day, range.start)) {
      onSelectRange({ start: day, end: null })
      return
    }

    if (day < range.start) {
      onSelectRange({ start: day, end: null })
      return
    }

    onSelectRange({ start: range.start, end: day })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between px-2">
        <span className="text-lg font-bold text-slate-900">{format(month, 'yyyy MMM')}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 transition"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 transition"
          >
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2">
        {days.map((day) => {
          const isMonth = isSameMonth(day, month)
          const dayStart = startOfDay(day)
          const isStart = range.start && isSameDay(day, range.start)
          const isEnd = range.end && isSameDay(day, range.end)
          const inRange = range.start && range.end && day > range.start && day < range.end
          const isSelected = isStart || isEnd
          const isToday = isSameDay(day, new Date())
          const key = dayStart.toISOString()
          const hasEvents = Boolean(counts?.[key])

          if (!isMonth) return <span key={day.toISOString()} />

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => handleDayClick(day)}
              className={clsx(
                'relative mx-auto flex h-10 w-10 items-center justify-center text-sm font-semibold transition',
                isSelected
                  ? 'z-10 rounded-full bg-blue-600 text-white shadow-md'
                  : 'rounded-full text-slate-700',
                inRange &&
                  !isSelected &&
                  'mx-0 w-full max-w-none rounded-none bg-blue-50 text-blue-900',
                isToday && !isSelected && !inRange && 'bg-blue-50 text-blue-600'
              )}
            >
              <span>{format(day, 'd')}</span>
              {hasEvents && !isSelected && !inRange && (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-blue-400" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
