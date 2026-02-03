import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search,
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Map as MapIcon,
  List as ListIcon,
} from 'lucide-react'
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
import { PageLoading } from '@/components/PageLoading'
import { SheetLayout } from '@/components/SheetLayout'
import { EventCard } from '@/features/events/components/EventCard'
import { EventMap } from '@/features/events/components/EventMap'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { useSports } from '@/features/dictionaries/hooks'
import { useAuthStore } from '@/hooks'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'

type SportFilterOption = { key: string; label: string; icon?: string | null }

import { profileService } from '@/features/profile/profile.service'
import { ProfileRequiredSheet } from '@/features/profile/components/ProfileRequiredSheet'

export function DiscoverEventsPage() {
  const navigate = useNavigate()
  const today = startOfDay(new Date())

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const showMap = searchParams.get('view') === 'map'
  const selectedEventId = searchParams.get('event')

  const toggleMap = () => {
    setSearchParams(
      (prev) => {
        if (showMap) prev.delete('view')
        else prev.set('view', 'map')
        return prev
      },
      { replace: true }
    )
  }

  // Filter State (Sync with URL)
  const sportsParam = searchParams.get('sports')
  const startParam = searchParams.get('startDate')
  const endParam = searchParams.get('endDate')

  const selectedSports = useMemo(() => {
    if (!sportsParam) return ['all']
    return sportsParam.split(',')
  }, [sportsParam])

  const dateRange = useMemo(
    () => ({
      start: startParam ? new Date(startParam) : null,
      end: endParam ? new Date(endParam) : null,
    }),
    [startParam, endParam]
  )

  const events = useEventsStore((state) => state.events)
  const isLoading = useEventsStore((state) => state.isLoading)
  const error = useEventsStore((state) => state.error)
  const fetchEvents = useEventsStore((state) => state.fetchEvents)
  const { items: sportsCatalog, isLoading: isSportsLoading, error: sportsError } = useSports('zh')
  const { isAuthenticated, profileCache, setProfileCache } = useAuthStore()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showProfileRequiredSheet, setShowProfileRequiredSheet] = useState(false)

  const sports = useMemo<SportFilterOption[]>(
    () => [
      ...sportsCatalog.map((sport) => ({
        key: sport.key,
        label: sport.label,
        icon: sport.icon,
      })),
    ],
    [sportsCatalog]
  )

  // Fetch events once on mount.
  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  const handleCreateClick = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }

    if (profileCache?.name) {
      navigate('/create-event')
      return
    }

    try {
      const res = await profileService.getProfile()
      const data: any = (res as any).data ?? res
      
      // If we got data but display_name is missing or is explicitly "新夥伴" (default), treat as incomplete
      // Note: Backend might define "新夥伴" as default.
      const hasName = data.display_name && data.display_name !== '新夥伴'
      
      if (hasName) {
        setProfileCache({ ...data, name: data.display_name })
        navigate('/create-event')
      } else {
        setShowProfileRequiredSheet(true)
      }
    } catch (err: any) {
      // If 404, definitely needs profile creation
      if (err?.status === 404 || err?.response?.status === 404) {
        setShowProfileRequiredSheet(true)
      } else {
        // For other errors, we might let them proceed or show validation
        // But safer to assume they might need to check profile
         console.error('Check profile failed', err)
         // Fallback: let them try, or blocking? 
         // User wants strict check. Let's show sheet if we fail to confirm profile.
         // But maybe network error? Let's just navigate and let CreateEvent handle it if network error.
         navigate('/create-event')
      }
    }
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
    let filtered = events.filter((event) => new Date(event.startTime) >= today)

    if (dateRange.start) {
      if (dateRange.end) {
        // Range filter
        const start = startOfDay(dateRange.start)
        const end = dateTimeEndOfDay(dateRange.end)
        filtered = events.filter((event) => {
          const time = new Date(event.startTime)
          return time >= start && time <= end
        })
      } else {
        // Single day filter
        filtered = events.filter((event) => isSameDay(new Date(event.startTime), dateRange.start!))
      }
    }

    if (selectedSports.includes('all')) return filtered
    return filtered.filter((event) =>
      selectedSports.some((sport) => event.sport.toLowerCase() === sport.toLowerCase())
    )
  }, [events, selectedSports, dateRange, today])

  // Header Label Logic
  const dateLabel = dateRange.start
    ? dateRange.end
      ? `${format(dateRange.start, 'MM/dd')} - ${format(dateRange.end, 'MM/dd')}`
      : format(dateRange.start, 'MM/dd')
    : '任何時間'

  const sportLabel = useMemo(() => {
    if (selectedSports.includes('all')) return '任何運動'

    // Map keys to labels
    const names = selectedSports
      .map((key) => sports.find((s) => s.key === key)?.label)
      .filter(Boolean) as string[]

    if (names.length === 0) return '運動'
    if (names.length <= 2) return names.join('、')
    return `${names[0]}、${names[1]} +${names.length - 2}`
  }, [selectedSports, sports])

  const hasFilter = Boolean(dateRange.start || !selectedSports.includes('all'))

  return (
    <div className="min-h-screen pb-24">
      {/* Airbnb-style Header */}
      <div
        className={clsx(
          'fixed left-0 right-0 z-40 mx-auto w-full max-w-md p-4 transition-all duration-300',
          showMap ? 'bg-transparent pointer-events-none' : 'bg-white/95 backdrop-blur'
        )}
        style={{ top: '0px' }}
      >
        <div className="flex w-full items-center gap-3">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-1 items-center gap-1 rounded-full border border-slate-200 bg-white p-3 shadow-sm transition  pointer-events-auto"
          >
            <Search className="ml-2 h-5 w-5 text-slate-800" strokeWidth={2.5} />
            <div className="flex flex-col items-start px-1">
              {!hasFilter ? (
                <>
                  <span className="text-sm font-bold text-slate-900">開始搜尋</span>
                  <span className="text-xs font-medium text-slate-500">
                    {dateLabel} • {sportLabel}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold leading-tight text-slate-900">
                    {dateLabel}
                  </span>
                  <span className="text-sm font-bold leading-tight text-slate-900">
                    {sportLabel}
                  </span>
                </>
              )}
            </div>
            {(dateRange.start || !selectedSports.includes('all')) && (
              <>
                <div className="ml-auto mr-2 flex h-6 min-w-[24px] items-center justify-center rounded-full border border-slate-200 bg-transparent px-1.5 text-xs font-bold text-slate-600">
                  {filteredEvents.length}
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  className="mr-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition "
                  onClick={(e) => {
                    e.stopPropagation()
                    setSearchParams(
                      (prev) => {
                        prev.delete('startDate')
                        prev.delete('endDate')
                        prev.delete('sports')
                        return prev
                      },
                      { replace: true }
                    )
                  }}
                >
                  <X className="h-4 w-4 text-slate-500" />
                </div>
              </>
            )}
          </button>

          <button
            onClick={toggleMap}
            className="flex h-[58px] w-[58px] flex-none items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition   pointer-events-auto"
          >
            {showMap ? (
              <ListIcon className="h-6 w-6 text-slate-700" />
            ) : (
              <MapIcon className="h-6 w-6 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {showMap ? (
        <EventMap
          events={filteredEvents}
          sports={sportsCatalog}
          mode="events"
          selectedEventId={selectedEventId}
          onSelectEvent={(e) => {
            setSearchParams(
              (prev) => {
                if (e) prev.set('event', e.id)
                else prev.delete('event')
                return prev
              },
              { replace: true }
            )
          }}
        />
      ) : (
        <div className="mx-auto w-full max-w-4xl px-4 py-6 pt-[100px]">
          {error && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {isLoading ? (
            <PageLoading fullScreen={false} className="py-20" />
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 shadow-sm">
                <span className="text-5xl">😮</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">目前附近沒看到活動呢</h3>
              <p className="mt-2 text-sm text-slate-500">
                嘿！發佈一個活動，<br />
                讓有相同運動興趣的夥伴們找到你吧！
              </p>
              <button
                type="button"
                onClick={handleCreateClick}
                className="mt-8 rounded-full bg-blue-600 px-8 py-3 text-base font-bold text-white shadow-lg shadow-blue-200 transition "
              >
                發起活動
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
      )}

      <SearchSheet
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialDateRange={dateRange}
        initialSports={selectedSports}
        sportsOptions={sports}
        eventsByDay={eventsByDay}
        onApply={(range, sports) => {
          setSearchParams(
            (prev) => {
              if (range.start) prev.set('startDate', range.start.toISOString())
              else prev.delete('startDate')

              if (range.end) prev.set('endDate', range.end.toISOString())
              else prev.delete('endDate')

              if (sports.length && !sports.includes('all')) {
                prev.set('sports', sports.join(','))
              } else {
                prev.delete('sports')
              }
              return prev
            },
            { replace: true }
          )
          setIsSearchOpen(false)
        }}
      />

      <ProfileRequiredSheet
        open={showProfileRequiredSheet}
        onClose={() => setShowProfileRequiredSheet(false)}
      />

      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onSignup={() => navigate('/signup')}
      />
    </div>
  )
}

function dateTimeEndOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

// --- Search Sheet Components ---

type SearchSheetProps = {
  open: boolean
  onClose: () => void
  initialDateRange: { start: Date | null; end: Date | null }
  initialSports: string[]
  sportsOptions: SportFilterOption[]
  eventsByDay: Record<string, number>
  onApply: (range: { start: Date | null; end: Date | null }, sports: string[]) => void
}

function SearchSheet({
  open,
  onClose,
  initialDateRange,
  initialSports,
  sportsOptions,
  eventsByDay,
  onApply,
}: SearchSheetProps) {
  const [pendingRange, setPendingRange] = useState(initialDateRange)
  const [pendingSports, setPendingSports] = useState<string[]>(initialSports)
  const [calendarMonth, setCalendarMonth] = useState<Date>(startOfMonth(new Date()))
  const [activeTab, setActiveTab] = useState<'date' | 'sport'>('date')

  // Sync when opening
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
      sheetClassName="h-[92vh] flex flex-col"
      contentClassName="flex-1 flex flex-col"
      maxWidthClassName="max-w-[480px]"
    >
      <SheetLayout
        onClose={onClose}
        title="搜尋篩選"
        subtitle="自訂你的搜尋條件"
        height="tall"
        className="flex h-full w-full flex-col rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
        contentClassName="flex-1 overflow-y-auto px-5 pb-6 pt-4 space-y-6"
        primaryButton={{
          label: '套用',
          onClick: handleApply,
        }}
        secondaryButton={{
          label: '全部清除',
          onClick: handleClear,
          variant: 'ghost',
        }}
      >
        {/* Tab Switcher */}
        <div className="flex w-full rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('date')}
            className={clsx(
              'flex-1 rounded-full py-2 text-sm font-bold transition-all',
              activeTab === 'date'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500'
            )}
          >
            日期
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sport')}
            className={clsx(
              'flex-1 rounded-full py-2 text-sm font-bold transition-all',
              activeTab === 'sport'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500'
            )}
          >
            運動
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'date' ? (
            <div className="p-2">
              {/* Removed border/shadow container, just padding */}
              <CalendarContent
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                range={pendingRange}
                onSelectRange={setPendingRange}
                counts={eventsByDay}
              />
            </div>
          ) : (
            <div>
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
                          const next = prev.filter((p) => p !== 'all' && p !== sport.key)
                          if (prev.includes(sport.key)) return next.length ? next : ['all']
                          return [...next, sport.key]
                        })
                      }}
                      className={clsx(
                        'flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition ',
                        active
                          ? 'border-black bg-neutral-900 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700'
                      )}
                    >
                      <span className="text-base">{sport.icon || ''}</span>
                      <span>{sport.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </SheetLayout>
    </BottomSheet>
  )
}

// --- Calendar Component ---

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
      // Start new selection (if previously complete or empty)
      onSelectRange({ start: day, end: null })
    } else {
      // Have start, selection end
      if (isSameDay(day, range.start)) {
        // Click same day -> just that day
        onSelectRange({ start: day, end: null })
      } else if (day < range.start) {
        // Click before start -> new start
        onSelectRange({ start: day, end: null })
      } else {
        // Valid end
        onSelectRange({ start: range.start, end: day })
      }
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900">{format(month, 'yyyy 年 M 月')}</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 transition "
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 transition "
          >
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
        {['一', '二', '三', '四', '五', '六', '日'].map((label) => (
          <span key={label}>週{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2">
        {days.map((day) => {
          const isMonth = isSameMonth(day, month)
          const dayStart = startOfDay(day)

          // Range logic
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
                  'mx-0 w-full max-w-none rounded-none bg-blue-50 text-blue-900', // Connect range
                // Add rounded corners for range ends visually if needed, but simplified here
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
