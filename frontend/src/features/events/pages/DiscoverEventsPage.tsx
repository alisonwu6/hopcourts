import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  addDays,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  getYear,
  setYear,
} from 'date-fns'
import { BottomSheet } from '@/components'
import { SheetLayout } from '@/components/SheetLayout'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import { EventCard } from '@/features/events/components/EventCard'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { useSports } from '@/features/sports/hooks/useSports'
import { useAuthStore } from '@/hooks'

type SportFilterOption = { key: string; label: string; icon?: string | null }

export function DiscoverEventsPage() {
  const navigate = useNavigate()
  const today = startOfDay(new Date())
  const [selectedSports, setSelectedSports] = useState<string[]>(['all'])
  const [pendingSports, setPendingSports] = useState<string[]>(['all'])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [pendingDate, setPendingDate] = useState<Date | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState<Date>(startOfMonth(today))
  const events = useEventsStore((state) => state.events)
  const isLoading = useEventsStore((state) => state.isLoading)
  const error = useEventsStore((state) => state.error)
  const fetchEvents = useEventsStore((state) => state.fetchEvents)
  const { sports: sportsCatalog, isLoading: isSportsLoading, error: sportsError } = useSports('zh')
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const goToMySessions = () => navigate('/my-events')
  const sports = useMemo<SportFilterOption[]>(
    () => [
      { key: 'all', label: '全部', icon: '全' },
      ...sportsCatalog.map((sport) => ({
        key: sport.key,
        label: sport.label,
        icon: sport.icon,
      })),
    ],
    [sportsCatalog]
  )
  const sportsLabelMap = useMemo(
    () => new Map(sportsCatalog.map((sport) => [sport.key, sport.label])),
    [sportsCatalog]
  )

  // Fetch events once on mount.
  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  // Keep calendar month in sync with selected day.
  useEffect(() => {
    if (!isCalendarOpen && selectedDate) {
      setCalendarMonth(startOfMonth(selectedDate))
    }
  }, [isCalendarOpen, selectedDate])

  const handleCreateClick = () => {
    if (isAuthenticated) navigate('/create-event')
    else setShowLoginPrompt(true)
  }

  // Count events per day for the calendar dots.
  const eventsByDay = useMemo(
    () =>
      events.reduce<Record<string, number>>((acc, event) => {
        const key = startOfDay(new Date(event.startTime)).toISOString()
        acc[key] = (acc[key] ?? 0) + 1
        return acc
      }, {}),
    [events]
  )

  const filteredEvents = useMemo(() => {
    const dateFiltered = selectedDate
      ? events.filter((event) => isSameDay(new Date(event.startTime), selectedDate))
      : events.filter((event) => new Date(event.startTime) >= today)

    if (selectedSports.includes('all')) return dateFiltered
    return dateFiltered.filter((event) =>
      selectedSports.some((sport) => event.sport.toLowerCase() === sport.toLowerCase())
    )
  }, [events, selectedSports, selectedDate])

  const dateLabel = selectedDate ? format(selectedDate, 'EEE, dd MMM') : '選擇日期'
  const showTodayLabel = Boolean(selectedDate && isSameDay(selectedDate, today))
  const selectedSportLabels = selectedSports
    .filter((sport) => sport !== 'all')
    .map((sport) => sportsLabelMap.get(sport) ?? sport)
  return (
    <div className="min-h-screen bg-[#f4f6fb] pb-24">
      <div
        className="fixed left-0 right-0 z-40 border-b border-slate-200 bg-[#f4f6fb]/95 shadow-sm backdrop-blur"
        style={{ top: '0px' }}
      >
        <div className="mx-auto w-full max-w-4xl space-y-3 px-4 py-3">
          <div className="flex justify-center">
             <div className="flex w-full max-w-sm items-center justify-center p-1">
               <h1 className="text-lg font-bold text-slate-900">即將到來的活動</h1>
             </div>
          </div>

          <div className="flex w-full gap-3">
            <button
              type="button"
              onClick={() => {
                const baseDate = selectedDate ?? today
                setPendingDate(selectedDate)
                setCalendarMonth(startOfMonth(baseDate))
                setIsCalendarOpen(true)
              }}
              className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300"
            >
              <CalendarIcon className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-700">{dateLabel}</span>
                {showTodayLabel && <span className="text-xs font-medium text-blue-500">Today</span>}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300"
            >
              <Search className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
              <span className="flex-1 truncate">
                {isSportsLoading
                  ? '載入運動中…'
                  : selectedSports.includes('all')
                    ? '選擇運動'
                    : selectedSportLabels.join(', ')}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-6 pt-[130px]">
        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10 text-slate-500">載入活動中…</div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center text-slate-500">
            <div>沒有找到活動</div>
            <button
              type="button"
              onClick={handleCreateClick}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              新增活動
            </button>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onViewDetails={() => {
                if (isAuthenticated) {
                  navigate(`/event/${event.id}`)
                } else {
                  setShowLoginPrompt(true)
                }
              }}
            />
          ))
        )}
      </div>

      <SportFilterSheet
        open={isFilterOpen}
        selected={pendingSports}
        options={sports}
        loading={isSportsLoading}
        errorText={sportsError ? '運動清單載入失敗，請稍後再試。' : undefined}
        onClose={() => setIsFilterOpen(false)}
        onReset={() => setPendingSports(['all'])}
        onToggle={(value) => {
          setPendingSports((prev) => {
            if (value === 'all') return ['all']
            const next = prev.filter((item) => item !== value && item !== 'all')
            const exists = prev.includes(value)
            return exists ? next : [...next, value]
          })
        }}
        onApply={() => {
          setSelectedSports(pendingSports.length ? pendingSports : ['all'])
          setIsFilterOpen(false)
        }}
      />
      <CalendarSheet
        open={isCalendarOpen}
        month={calendarMonth}
        selectedDate={selectedDate}
        pendingDate={pendingDate}
        onSelect={setPendingDate}
        onMonthChange={(date) => setCalendarMonth(startOfMonth(date))}
        onClose={() => {
          setPendingDate(selectedDate)
          setIsCalendarOpen(false)
        }}
        onClear={() => setPendingDate(null)}
        onApply={() => {
          setSelectedDate(pendingDate)
          setIsCalendarOpen(false)
        }}
        counts={eventsByDay}
      />
      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onSignup={() => navigate('/signup')}
      />
    </div>
  )
}

type SportFilterSheetProps = {
  /** Controls the sheet visibility */
  open: boolean
  /** Selected sports keys */
  selected: string[]
  /** All available sport options */
  options: SportFilterOption[]
  /** Loading state for options */
  loading?: boolean
  /** Error message shown in header */
  errorText?: string
  /** Toggle a sport option */
  onToggle: (sport: string) => void
  /** Reset all selections */
  onReset: () => void
  /** Apply current selections */
  onApply: () => void
  /** Close sheet callback */
  onClose: () => void
}

function SportFilterSheet({
  open,
  selected,
  options,
  loading,
  errorText,
  onToggle,
  onReset,
  onApply,
  onClose,
}: SportFilterSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} showHandle disableContainer>
      <SheetLayout
        onClose={onClose}
        title="想找什麼運動？"
        subtitle="運動篩選"
        height="tall"
        className="w-full rounded-t-[32px] bg-white shadow-[0_-20px_45px_rgba(15,41,77,0.18)]"
        contentClassName="px-6"
        primaryButton={{
          label: '套用',
          onClick: onApply,
          disabled: loading,
        }}
        secondaryButton={{
          label: '全部清除',
          onClick: onReset,
          variant: 'ghost',
        }}
        headerRight={
          loading ? (
            <p className="text-xs font-medium text-blue-500">運動清單載入中…</p>
          ) : errorText ? (
            <p className="text-xs font-medium text-rose-500">{errorText}</p>
          ) : null
        }
      >
        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            {options.map((sport) => {
              const isActive =
                selected.includes(sport.key) || (sport.key === 'all' && selected.includes('all'))
              return (
                <button
                  key={sport.key}
                  type="button"
                  onClick={() => onToggle(sport.key)}
                  className={clsx(
                    'flex h-16 items-center gap-3 rounded-[24px] border px-4 text-left text-sm font-semibold transition',
                    isActive
                      ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-[0_12px_28px_rgba(37,99,235,0.12)]'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-blue-200 hover:bg-blue-50/60'
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-lg">
                    {sport.icon || '🏀'}
                  </div>
                  <span className="flex-1">{sport.label}</span>
                  {isActive && <span className="text-xs font-semibold text-blue-500">已選</span>}
                </button>
              )
            })}
          </div>

          <div className="h-16" />
        </div>
      </SheetLayout>
    </BottomSheet>
  )
}

type CalendarSheetProps = {
  /** Controls visibility of the calendar sheet */
  open: boolean
  /** Current month displayed */
  month: Date
  /** Already selected date (applied) */
  selectedDate: Date | null
  /** Pending date (not yet applied) */
  pendingDate: Date | null
  /** Choose a date in the calendar */
  onSelect: (date: Date) => void
  /** Change month (also handles year change) */
  onMonthChange: (date: Date) => void
  /** Close the sheet */
  onClose: () => void
  /** Clear pending selection */
  onClear: () => void
  /** Apply pending selection */
  onApply: () => void
  /** Optional per-day count for dot indicators */
  counts: Record<string, number>
}

function CalendarSheet({
  open,
  month,
  selectedDate,
  pendingDate,
  onSelect,
  onMonthChange,
  onClose,
  onClear,
  onApply,
  counts = {},
}: CalendarSheetProps) {
  if (!open) return null

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

  const currentYear = getYear(month)
  const years = Array.from({ length: 7 }, (_, index) => currentYear - 3 + index)

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      showHandle={false}
      maxWidthClassName="max-w-[420px]"
      contentClassName="px-0 pb-0"
      disableContainer
    >
      <SheetLayout
        onClose={onClose}
        title={format(month, 'yyyy 年 MM 月')}
        height="medium"
        contentClassName="px-6"
        className="w-full rounded-t-[32px] bg-white shadow-[0_-20px_45px_rgba(15,41,77,0.18)]"
        headerRight={
          <div className="flex items-center gap-2">
            <select
              value={currentYear}
              onChange={(event) => onMonthChange(setYear(monthStart, Number(event.target.value)))}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 focus:outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onMonthChange(addMonths(month, -1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200"
              aria-label="上一個月"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onMonthChange(addMonths(month, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200"
              aria-label="下一個月"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        }
        primaryButton={{ label: '套用', onClick: onApply }}
        secondaryButton={{ label: '清除', onClick: onClear, variant: 'ghost' }}
      >
        <div className="grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
          {['一', '二', '三', '四', '五', '六', '日'].map((label) => (
            <span key={label}>週{label}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {days.map((day) => {
            const inactive = !isSameMonth(day, month)
            const active = pendingDate ? isSameDay(day, pendingDate) : false
            const key = startOfDay(day).toISOString()
            const hasEvents = Boolean(counts?.[key])
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onSelect(day)}
                className={clsx(
                  'flex h-12 flex-col items-center justify-center rounded-full border text-sm font-semibold transition',
                  inactive && 'border-transparent text-slate-300',
                  !inactive && 'border-transparent',
                  active && '!border-blue-500 bg-blue-50 text-blue-700'
                )}
              >
                <span>{format(day, 'd')}</span>
                {hasEvents && <span className="mt-1 h-1 w-1 rounded-full bg-blue-500" />}
              </button>
            )
          })}
        </div>
      </SheetLayout>
    </BottomSheet>
  )
}
