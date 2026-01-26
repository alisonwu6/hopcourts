import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PlayerEvent } from '@/types'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { useAuthStore } from '@/hooks'
import { BottomSheet } from '@/components/BottomSheet'
import { LoginPanel } from '@/components/LoginPanel'
import { Calendar, MapPin, PersonStanding, type LucideIcon } from 'lucide-react'

type TabKey = 'upcoming' | 'completed'

function isCompleted(event: PlayerEvent) {
  const now = new Date()
  
  if (event.completedDate && new Date(event.completedDate) < now) {
    return true
  }
  // Also check if endTime has passed
  if (event.endTime && new Date(event.endTime) < now) {
    return true
  }
  return false
}

function groupByDate(events: PlayerEvent[]) {
  const formatter = new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'long',
  })
  const map = new Map<string, PlayerEvent[]>()
  events.forEach((event) => {
    const label = formatter.format(new Date(event.startTime))
    map.set(label, [...(map.get(label) ?? []), event])
  })
  return Array.from(map.entries())
}

export function MyEventsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('upcoming')
  const events = useEventsStore((state) => state.events)
  const fetchMyEvents = useEventsStore((state) => state.fetchMyEvents)
  const isLoading = useEventsStore((state) => state.isLoading)
  const error = useEventsStore((state) => state.error)
  const { isAuthenticated } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
  }))
  const [showLoginSheet, setShowLoginSheet] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      void fetchMyEvents()
    }
  }, [fetchMyEvents, isAuthenticated])

  const upcomingEvents = useMemo(() => events.filter((event) => !isCompleted(event)), [events])
  const completedEvents = useMemo(() => events.filter((event) => isCompleted(event)), [events])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen px-4 pb-24 pt-4">
        <div className="mx-auto w-full max-w-4xl space-y-4">
          <div className="flex justify-center">
            <div className="flex w-full max-w-sm items-center rounded-full bg-slate-100">
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold text-slate-600 transition hover:text-slate-800"
              >
                即將到來的活動
              </button>
              <button
                type="button"
                className="flex-1 rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-blue-600 shadow-sm"
                aria-current="page"
              >
                我的場次
              </button>
            </div>
          </div>

          <div className="mx-auto w-full max-w-4xl space-y-4 px-4 pt-4">
            <h1 className="text-[22px] font-bold leading-tight text-slate-900">我的場次</h1>
            <p className="text-base text-slate-700">
              登入後就能看到你已加入、即將到來的場次，以及過去的紀錄。
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowLoginSheet(true)}
                className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition"
                style={{ background: 'var(--gradient-secondary)' }}
              >
                登入
              </button>
            </div>
          </div>
        </div>
        <BottomSheet
          open={showLoginSheet}
          onClose={() => setShowLoginSheet(false)}
          showHandle
          sheetClassName="rounded-t-[32px] border border-white/40 bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.35)]"
          contentClassName="px-4 pb-8 pt-4"
          maxWidthClassName="max-w-lg"
        >
          <LoginPanel variant="sheet" />
        </BottomSheet>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-20 border-b border-blue-200 bg-[#f4f6fb]/80 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex justify-center">
          <div className="flex w-full max-w-sm items-center rounded-full bg-slate-100">
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold text-slate-600 transition hover:text-slate-800"
            >
              即將到來的活動
            </button>
            <button
              type="button"
              className="flex-1 rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-blue-600 shadow-sm"
              aria-current="page"
            >
              我的場次
            </button>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-3">
          <TagPill
            label={`即將到來 (${upcomingEvents.length})`}
            active={tab === 'upcoming'}
            onClick={() => setTab('upcoming')}
          />
          <TagPill
            label={`已完成 (${completedEvents.length})`}
            active={tab === 'completed'}
            onClick={() => setTab('completed')}
          />
        </div>
      </div>

      <div className="px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="py-10 text-center text-slate-500">載入你的場次中…</div>
        ) : tab === 'upcoming' ? (
          <EventGroupList
            groups={groupByDate(upcomingEvents)}
            emptyState={
              <EmptyState icon="📭" title="目前沒有場次" description="去看看其他活動並加入吧" />
            }
          />
        ) : (
          <EventGroupList
            groups={groupByDate(completedEvents)}
            emptyState={
              <EmptyState icon="✓" title="尚無已完成的場次" description="完成的場次會顯示在這裡" />
            }
          />
        )}
      </div>
    </div>
  )
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${
        active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
      }`}
    >
      {label}
    </button>
  )
}

function TagPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold ${
        active ? 'bg-[#0B7CFA] text-white shadow-sm' : 'bg-slate-200 text-slate-700'
      }`}
    >
      {label}
    </button>
  )
}

function EventGroupList({
  groups,
  emptyState,
}: {
  groups: Array<[string, PlayerEvent[]]>
  emptyState: JSX.Element
}) {
  const navigate = useNavigate()

  if (groups.length === 0) {
    return emptyState
  }

  const formatTimeRange = (start: Date | string, end: Date | string) => {
    const s = new Date(start)
    const e = new Date(end)
    const date = s.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
    const startStr = s.toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })
    const endStr = e.toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })
    return `${date} ${startStr}-${startStr !== endStr ? endStr : ''}`
  }

  const getEventStatus = (event: PlayerEvent): 'check-in-open' | 'ongoing' | null => {
    const now = new Date()
    const start = new Date(event.startTime)
    const end = event.endTime ? new Date(event.endTime) : start
    
    // Check-in logic: 30 mins before start, 10 mins after start (default)
    const openMins = event.checkinOpenMinsBefore ?? 30
    const closeMins = event.checkinCloseMinsAfter ?? 10
    const checkInStart = new Date(start.getTime() - openMins * 60000)
    const checkInEnd = new Date(start.getTime() + closeMins * 60000)
    
    if (now >= checkInStart && now <= checkInEnd) {
      return 'check-in-open'
    }
    
    if (now >= start && now <= end) {
      return 'ongoing'
    }
    
    return null
  }

  return (
    <div className="space-y-8">
      {groups.map(([dateLabel, groupedEvents]) => (
        <div key={dateLabel}>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-500 pl-1">
            {dateLabel}
          </h3>
          <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-2">
            {groupedEvents.map((event) => {
              const status = getEventStatus(event)
              const active = status !== null
              return (
                <div key={event.id} className="relative pl-6">
                  <span
                    className={`absolute -left-[5px] top-8 h-2.5 w-2.5 rounded-full border-2 border-white ring-1 ${
                      status === 'check-in-open' ? 'bg-emerald-500 ring-emerald-300 scale-125' :
                      status === 'ongoing' ? 'bg-amber-500 ring-amber-300 scale-125' :
                      'bg-slate-200 ring-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => navigate(`/event/${event.id}`)}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md active:scale-[0.99]"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <h4 className="text-lg font-bold text-slate-900">{event.title}</h4>
                      {status === 'check-in-open' && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          開放報到
                        </span>
                      )}
                      {status === 'ongoing' && (
                        <span className="animate-pulse rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          進行中
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <CardInfoRow
                        icon={Calendar}
                        label={formatTimeRange(event.startTime, event.endTime)}
                      />
                      <CardInfoRow
                        icon={MapPin}
                        label={`${event.location.name} (${event.location.address || ''})`}
                      />
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-blue-600 mt-0.5">
                        <PersonStanding className="h-5 w-5" strokeWidth={2} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                          {event.attendeeCount}/{event.maxAttendees} 人
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          剩餘名額 {Math.max(0, event.maxAttendees - event.attendeeCount)} 人
                        </span>
                      </div>
                    </div>
                  </button>
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
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-center">
      <div className="text-4xl">{icon}</div>
      <h3 className="mt-3 text-lg font-bold text-blue-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  )
}

function CardInfoRow({ icon: Icon, label }: { icon: LucideIcon, label: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-blue-600 mt-0.5">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="text-sm font-medium text-slate-600 leading-tight">
        {label}
      </div>
    </div>
  )
}
