import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Activity } from 'lucide-react'
import { addDays, format, isSameDay, isToday, startOfDay, startOfMonth, endOfMonth, addMonths, startOfWeek, endOfWeek, isSameMonth, getYear, setYear } from 'date-fns'
import { BottomSheet } from '@/components'
import { IntroSheet } from '@/components/IntroSheet'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import { EventCard } from '@/features/events/components/EventCard'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { useSports } from '@/features/sports/hooks/useSports'
import { useAuthStore } from '@/hooks'

type SportFilterOption = { key: string; label: string }
const INTRO_SHEET_STORAGE_KEY = 'sportsmatch_intro_sheet_v20241118'

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
  const { sports: sportsCatalog } = useSports('zh')
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [showIntroSheet, setShowIntroSheet] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [hasSeenIntro, setHasSeenIntro] = useState(false)
  const goToMySessions = () => navigate('/my-events')
  const sports = useMemo<SportFilterOption[]>(
    () => [
      { key: 'all', label: '全部' },
      ...sportsCatalog.map((sport) => ({ key: sport.key, label: sport.label })),
    ],
    [sportsCatalog]
  )
  const sportsLabelMap = useMemo(
    () => new Map(sportsCatalog.map((sport) => [sport.key, sport.label])),
    [sportsCatalog]
  )

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    if (!isCalendarOpen && selectedDate) {
      setCalendarMonth(startOfMonth(selectedDate))
    }
  }, [isCalendarOpen, selectedDate])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isAuthenticated) {
      setShowIntroSheet(false)
      return
    }
    const seen = window.localStorage.getItem(INTRO_SHEET_STORAGE_KEY) === 'dismissed'
    setHasSeenIntro(seen)
    setShowIntroSheet(!seen)
  }, [isAuthenticated])

  const handleIntroClose = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(INTRO_SHEET_STORAGE_KEY, 'dismissed')
    }
    setHasSeenIntro(true)
    setShowIntroSheet(false)
  }

  const handleCreateClick = () => {
    if (isAuthenticated) {
      navigate('/create-event')
      return
    }
    if (!hasSeenIntro) {
      setShowIntroSheet(true)
    } else {
      setShowLoginPrompt(true)
    }
  }

  const eventsByDay = useMemo(() => {
    return events.reduce<Record<string, number>>((acc, event) => {
      const key = startOfDay(new Date(event.startTime)).toISOString()
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})
  }, [events])

  const filteredEvents = useMemo(() => {
    const dateFiltered = selectedDate
      ? events.filter((event) => isSameDay(new Date(event.startTime), selectedDate))
      : events.filter((event) => new Date(event.startTime) >= today)

    const sportFiltered = selectedSports.includes('all')
      ? dateFiltered
      : dateFiltered.filter((event) =>
          selectedSports.some((sport) => event.sport.toLowerCase() === sport.toLowerCase())
        )

    return sportFiltered
  }, [events, selectedSports, selectedDate])

  const dateLabel = selectedDate ? format(selectedDate, 'EEE, dd MMM') : '選擇日期'
  const showTodayLabel = Boolean(selectedDate && isSameDay(selectedDate, today))
  const selectedSportLabels = selectedSports
    .filter((sport) => sport !== 'all')
    .map((sport) => sportsLabelMap.get(sport) ?? sport)
  return (
    <div className="min-h-screen bg-[#f4f6fb] pb-24">
      <div
        className="fixed left-0 right-0 z-40 border-b border-slate-200 bg-[#f4f6fb]/95 backdrop-blur shadow-sm"
        style={{ top: '0px' }}
      >
        <div className="mx-auto w-full max-w-4xl space-y-3 px-4 py-3">
          <div className="flex justify-center">
            <div className="flex w-full max-w-sm items-center rounded-full bg-slate-100 p-1">
              <button
                type="button"
                className="flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold text-blue-600 shadow-sm bg-white"
                aria-current="page"
              >
                即將到來的活動
              </button>
              <button
                type="button"
                onClick={goToMySessions}
                className="flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold text-slate-600 transition hover:text-slate-800"
              >
                我的場次
              </button>
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
              <CalendarIcon
                className="h-4 w-4 text-slate-400"
                strokeWidth={2}
                aria-hidden="true"
              />
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-700">
                  {dateLabel}
                </span>
                {showTodayLabel && (
                  <span className="text-xs font-medium text-blue-500">
                    Today
                  </span>
                )}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300"
            >
              <Search
                className="h-4 w-4 text-slate-400"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="flex-1 truncate">
                {selectedSports.includes('all')
                  ? '選擇運動'
                  : selectedSportLabels.join(', ')}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-6 pt-[200px]">
        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center py-10 text-slate-500">
            載入活動中…
          </div>
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
        onClose={() => setIsFilterOpen(false)}
        onReset={() => setPendingSports(['all'])}
        onToggle={(value) => {
          setPendingSports((prev) => {
            if (value === 'all') return ['all']
            const next = prev.filter(
              (item) => item !== value && item !== 'all'
            )
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
  open: boolean
  selected: string[]
  options: SportFilterOption[]
  onToggle: (sport: string) => void
  onReset: () => void
  onApply: () => void
  onClose: () => void
}

function SportFilterSheet({
  open,
  selected,
  options,
  onToggle,
  onReset,
  onApply,
  onClose,
}: SportFilterSheetProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full rounded-t-[32px] bg-white shadow-[0_-20px_45px_rgba(15,41,77,0.18)] animate-[sheetIn_0.25s_ease-out]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              運動篩選
            </p>
            <h2 className="text-xl font-semibold text-slate-900">想找什麼運動？</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            aria-label="Close filter"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-3">
            {options.map((sport) => {
              const isActive = selected.includes(sport.key) || (sport.key === 'all' && selected.includes('all'))
              return (
                <button
                  key={sport.key}
                  type="button"
                  onClick={() => onToggle(sport.key)}
                  className={clsx(
                    'flex h-16 items-center gap-3 rounded-[24px] border px-4 text-left text-sm font-semibold transition',
                    isActive
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:border-blue-200'
                  )}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg font-bold">
                    {sport.key === 'all' ? '全' : sport.label.charAt(0)}
                  </span>
                  <div className="flex flex-col">
                    <span>{sport.label}</span>
                    <span className="text-xs font-normal text-slate-500">
                      {sport.key === 'all' ? '顯示全部' : '點擊套用篩選'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            全部清除
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
          >
            套用
          </button>
        </div>
      </div>
      <style>
        {`@keyframes sheetIn { from { transform: translateY(100%); } to { transform: translateY(0); } }`}
      </style>
    </div>
  )
}

type CalendarSheetProps = {
  open: boolean
  month: Date
  selectedDate: Date | null
  pendingDate: Date | null
  onSelect: (date: Date) => void
  onMonthChange: (date: Date) => void
  onClose: () => void
  onClear: () => void
  onApply: () => void
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
    <BottomSheet open={open} onClose={onClose} showHandle={false} maxWidthClassName="max-w-[420px]" contentClassName="px-0 pb-0">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{format(month, 'yyyy 年 MM 月')}</h2>
        </div>
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
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200"
            aria-label="關閉月曆"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="px-6 py-4">
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
                  inactive && 'text-slate-300 border-transparent',
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
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold text-slate-500 hover:text-slate-800"
        >
          清除
        </button>
        <button
          type="button"
          onClick={onApply}
          className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          完成
        </button>
      </div>
    </BottomSheet>
  )
}
