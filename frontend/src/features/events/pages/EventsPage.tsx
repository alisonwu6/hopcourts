import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPinPlus, Search, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react'
import { addDays, format, isSameDay, isToday, startOfDay, startOfMonth, endOfMonth, addMonths, startOfWeek, endOfWeek, isSameMonth, getYear, setYear } from 'date-fns'
import { Button, BottomSheet } from '@/components'
import { IntroSheet } from '@/components/IntroSheet'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import { EventCard } from '@/features/events/components/EventCard'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { useAuthStore } from '@/hooks'

const sports = ['All', 'Basketball', 'Badminton', 'Pickleball', 'Climbing', 'Running', 'Hiking']
const skillOptions = [
  { value: 'all', label: 'All Levels' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const INTRO_SHEET_STORAGE_KEY = 'sportsmatch_intro_sheet_v20241118'

export function EventsPage() {
  const navigate = useNavigate()
  const today = startOfDay(new Date())
  const [selectedSports, setSelectedSports] = useState<string[]>(['All'])
  const [pendingSports, setPendingSports] = useState<string[]>(['All'])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [pendingDate, setPendingDate] = useState<Date | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState<Date>(startOfMonth(today))
  const [selectedSkill, setSelectedSkill] = useState('all')
  const [isSkillFilterOpen, setIsSkillFilterOpen] = useState(false)
  const events = useEventsStore((state) => state.events)
  const isLoading = useEventsStore((state) => state.isLoading)
  const error = useEventsStore((state) => state.error)
  const fetchEvents = useEventsStore((state) => state.fetchEvents)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [showIntroSheet, setShowIntroSheet] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [hasSeenIntro, setHasSeenIntro] = useState(false)

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

    const sportFiltered = selectedSports.includes('All')
      ? dateFiltered
      : dateFiltered.filter((event) =>
          selectedSports.some((sport) => event.sport.toLowerCase() === sport.toLowerCase())
        )

    if (selectedSkill === 'all') return sportFiltered
    return sportFiltered.filter((event) => event.skillLevel === selectedSkill)
  }, [events, selectedSports, selectedSkill, selectedDate])

  const dateLabel = selectedDate ? format(selectedDate, 'EEE, dd MMM') : 'Select a date'
  const showTodayLabel = Boolean(selectedDate && isSameDay(selectedDate, today))
  const skillLabel = skillOptions.find((option) => option.value === selectedSkill)?.label ?? 'All Levels'

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <div
        className="fixed left-0 right-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm"
        style={{ top: '80px' }}
      >
        <div className="mx-auto w-full max-w-4xl space-y-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300"
          >
            <Search
              className="h-4 w-4 text-slate-400"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span className="flex-1 truncate">
              {selectedSports.includes('All')
                ? 'Start your search'
                : selectedSports.join(', ')}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              sport
            </span>
          </button>

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
              onClick={() => setIsSkillFilterOpen(true)}
              className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300"
            >
              <BarChart3
                className="h-4 w-4 text-slate-400"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="flex-1 truncate">{skillLabel}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                skill
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-30 w-full max-w-4xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center py-10 text-slate-500">
            Loading events…
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-10 text-center text-slate-500">No events found</div>
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

      {/* <Button
      className="fixed bottom-10 left-1/2 z-50 flex h-14 w-14 -translate-x-1/2 transform items-center justify-center rounded-full bg-player-600 text-white"
      onClick={handleCreateClick}
      aria-label="Create event"
    >
        <span className="relative flex h-6 w-6 items-center justify-center">
          <MapPinPlus className="h-6 w-6" aria-hidden="true" />
        </span>
      </Button> */}

      <SportFilterSheet
        open={isFilterOpen}
        selected={pendingSports}
        onClose={() => setIsFilterOpen(false)}
        onReset={() => setPendingSports(['All'])}
        onToggle={(value) => {
          setPendingSports((prev) => {
            if (value === 'All') return ['All']
            const next = prev.filter((item) => item !== value && item !== 'All')
            const exists = prev.includes(value)
            return exists ? next : [...next, value]
          })
        }}
        onApply={() => {
          setSelectedSports(pendingSports.length ? pendingSports : ['All'])
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
      <SkillFilterSheet
        open={isSkillFilterOpen}
        selected={selectedSkill}
        onSelect={(value) => {
          setSelectedSkill(value)
          setIsSkillFilterOpen(false)
        }}
        onClose={() => setIsSkillFilterOpen(false)}
      />

      <IntroSheet
        open={showIntroSheet}
        onClose={handleIntroClose}
        description={
          'SportsMatch helps you find people who play like you — not just events.'
        }
        dismissLabel={null}
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
  onToggle: (sport: string) => void
  onReset: () => void
  onApply: () => void
  onClose: () => void
}

function SportFilterSheet({
  open,
  selected,
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
              sport filter
            </p>
            <h2 className="text-xl font-semibold text-slate-900">What do you want to play?</h2>
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
            {sports.map((sport) => {
              const isActive = selected.includes(sport) || (sport === 'All' && selected.includes('All'))
              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => onToggle(sport)}
                  className={clsx(
                    'flex h-16 items-center gap-3 rounded-[24px] border px-4 text-left text-sm font-semibold transition',
                    isActive
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:border-blue-200'
                  )}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg font-bold">
                    {sport.charAt(0)}
                  </span>
                  <div className="flex flex-col">
                    <span>{sport}</span>
                    <span className="text-xs font-normal text-slate-500">
                      {sport === 'All' ? 'Show everything' : 'Tap to filter'}
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
            Clear all
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
          >
            Apply
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
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">full calendar</p>
          <h2 className="text-xl font-semibold text-slate-900">{format(month, 'MMMM yyyy')}</h2>
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
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200"
            aria-label="Close calendar"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
            <span key={label}>{label}</span>
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
          Clear
        </button>
        <button
          type="button"
          onClick={onApply}
          className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    </BottomSheet>
  )
}

type SkillSheetProps = {
  open: boolean
  selected: string
  onSelect: (value: string) => void
  onClose: () => void
}

function SkillFilterSheet({ open, selected, onSelect, onClose }: SkillSheetProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full rounded-t-[32px] bg-white shadow-[0_-20px_45px_rgba(15,41,77,0.18)] animate-[sheetIn_0.25s_ease-out]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">skill filter</p>
            <h2 className="text-xl font-semibold text-slate-900">Pick your pace</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            aria-label="Close skill filter"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="flex flex-col gap-3">
            {skillOptions.map((option) => {
              const active = option.value === selected
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSelect(option.value)}
                  className={clsx(
                    'flex h-16 items-center justify-between rounded-[24px] border px-4 text-left text-sm font-semibold transition',
                    active
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:border-blue-200'
                  )}
                >
                  <span>{option.label}</span>
                  {active && <span className="text-xs text-blue-500">Selected</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <style>
        {`@keyframes sheetIn { from { transform: translateY(100%); } to { transform: translateY(0); } }`}
      </style>
    </div>
  )
}
