import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { PlayerEvent } from '@/types'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { useAuthStore } from '@/hooks'
import { useSports } from '@/features/dictionaries/hooks'
import { BottomSheet } from '@/components/BottomSheet'
import { LoginPanel } from '@/components/LoginPanel'
import { Calendar, MapPin, PersonStanding, CircleDollarSign, ChartColumnIncreasing, type LucideIcon } from 'lucide-react'

type TabKey = 'upcoming' | 'history'

function groupByDate(events: PlayerEvent[]) {
  const formatter = new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'long',
  })
  const map = new Map<string, PlayerEvent[]>()
  events.forEach((event) => {
    const date = event.startTime
      ? new Date(event.startTime)
      : new Date(event.updatedAt || Date.now())
    const label = formatter.format(date)
    map.set(label, [...(map.get(label) ?? []), event])
  })
  return Array.from(map.entries())
}

function CardInfoRow({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-blue-600">
        <Icon className="h-4.5 w-4.5" strokeWidth={2.5} />
      </div>
      <div className="text-sm font-normal text-slate-700">{label}</div>
    </div>
  )
}

const formatTwdNoDecimal = (value: unknown): string => {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  return Math.round(n).toLocaleString('zh-TW')
}

export function MySessions() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as TabKey) || 'upcoming'

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
  const myEvents = useEventsStore((state) => state.myEvents)
  const myEventsLoaded = useEventsStore((state) => state.myEventsLoaded)
  const fetchMyEvents = useEventsStore((state) => state.fetchMyEvents)
  const isLoading = useEventsStore((state) => state.isLoading)
  const error = useEventsStore((state) => state.error)
  const { isAuthenticated, currentUserId } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    currentUserId: state.user?.id,
  }))
  const { items: sportsCatalog } = useSports('zh')
  const [showLoginSheet, setShowLoginSheet] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    void fetchMyEvents('all', { force: true })
  }, [isAuthenticated, fetchMyEvents])


  const upcomingEvents = useMemo(
    () =>
      myEvents.filter((event) => {
        return new Date(event.endTime) >= new Date()
      }),
    [myEvents]
  )

  const historyEvents = useMemo(
    () =>
      myEvents.filter((event) => {
        return new Date(event.endTime) < new Date()
      }),
    [myEvents]
  )

  if (!isAuthenticated) {
    return (
      <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-6 text-center">
        <h3 className="text-lg font-bold text-slate-900">我的場次</h3>
        <p className="mt-2 text-sm text-slate-600">登入後即可查看你已加入的活動與紀錄。</p>
        <button
          type="button"
          onClick={() => setShowLoginSheet(true)}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm "
        >
          登入
        </button>
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
    <div className="space-y-4">
      <div className="flex rounded-full bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab('upcoming')}
          className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
            tab === 'upcoming'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600'
          }`}
        >
          即將到來 ({upcomingEvents.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
            tab === 'history'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600'
          }`}
        >
          歷史紀錄 ({historyEvents.length})
        </button>
      </div>

      <div className="min-h-[200px]">
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
            currentUserId={currentUserId}
            sportsCatalog={sportsCatalog}
            emptyState={
              <EmptyState icon="📭" title="目前沒有場次" description="去看看其他活動並加入吧" />
            }
          />
        ) : (
          <EventGroupList
            groups={groupByDate(historyEvents)}
            currentUserId={currentUserId}
            sportsCatalog={sportsCatalog}
            emptyState={
              <EmptyState
                icon="📜"
                title="尚無歷史紀錄"
                description="完成的活動和草稿會顯示在這裡"
              />
            }
          />
        )}
      </div>
    </div>
  )
}

function EventGroupList({
  groups,
  emptyState,
  currentUserId,
  sportsCatalog,
}: {
  groups: Array<[string, PlayerEvent[]]>
  emptyState: React.ReactNode
  currentUserId?: string
  sportsCatalog: Array<{ key: string; label: string; icon?: string | null }>
}) {
  const navigate = useNavigate()

  if (groups.length === 0) {
    return emptyState
  }

  const formatTimeRange = (start: Date | string, end: Date | string) => {
    const s = new Date(start)
    const e = new Date(end)
    const date = s.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const startStr = s.toLocaleTimeString('zh-TW', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    })
    const endStr = e.toLocaleTimeString('zh-TW', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    })
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

    // Drafts don't have active statuses like check-in or ongoing
    if (event.status === 'draft') return null

    if (now >= start && now <= end) {
      return 'ongoing'
    }

    if (now >= checkInStart && now < start) {
      return 'check-in-open'
    }

    return null
  }

  return (
    <div className="space-y-8">
      {groups.map(([dateLabel, groupedEvents]) => (
        <div key={dateLabel}>
          <h3 className="mb-4 pl-1 text-xs font-bold uppercase tracking-wide text-gray-500">
            {dateLabel}
          </h3>
          <div className="relative ml-3 space-y-6 border-l border-slate-200 pb-2">
            {groupedEvents.map((event) => {
              const status = getEventStatus(event)
              const active = status !== null
              const sportItem = sportsCatalog.find(
                (s) => s.key.toUpperCase() === event.sport.toUpperCase()
              )
              const sportLabel = sportItem?.label || event.sport
              const sportIcon = sportItem?.icon || '🎯'
              const skillLabel =
                event.skillLevel === 'beginner'
                  ? '初階'
                  : event.skillLevel === 'intermediate'
                    ? '中階步調'
                    : event.skillLevel === 'advanced'
                      ? '進階'
                      : '不限程度'
              const genderLabel =
                event.gender === 'female' ? '女性專屬' : event.gender === 'male' ? '男性專屬' : '性別混合'
              const locationLine1 =
                event.location.name && event.location.name !== event.location.address
                  ? event.location.name
                  : event.location.name || event.location.address || '地點待確認'
              const locationLine2 =
                event.location.name &&
                event.location.address &&
                event.location.name !== event.location.address
                  ? event.location.address
                  : ''
              const priceLabel = event.isFree
                ? '免費體驗'
                : event.priceRange || `$${formatTwdNoDecimal(event.pricePerPerson)} /人`
              return (
                <div key={event.id} className="relative pl-6">
                  <span
                    className={`absolute -left-[5px] top-8 h-2.5 w-2.5 rounded-full border-2 border-white ring-1 ${
                      status === 'check-in-open'
                        ? 'scale-125 bg-emerald-500 ring-emerald-300'
                        : status === 'ongoing'
                          ? 'scale-125 bg-amber-500 ring-amber-300'
                          : 'bg-slate-200 ring-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (event.status === 'draft') {
                        navigate(`/create-event?id=${event.id}`)
                      } else {
                        navigate(`/event/${event.id}`)
                      }
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition  "
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-bold text-slate-900">{event.title}</h4>
                      </div>
                      {event.status === 'draft' && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          草稿
                        </span>
                      )}
                      {status === 'check-in-open' && (
                        <span className="flex-shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          開放報到中
                        </span>
                      )}
                      {status === 'ongoing' && (
                        <span className="flex-shrink-0 animate-pulse rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          進行中
                        </span>
                      )}
                    </div>

                    <div className="mb-3 flex items-center gap-1.5 overflow-hidden">
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        <span>{sportIcon}</span>
                        {sportLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                        <ChartColumnIncreasing className="h-3 w-3" strokeWidth={2.5} />
                        {skillLabel}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-pink-100 bg-pink-50 px-2 py-0.5 text-[11px] font-medium text-pink-700">
                        {genderLabel}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <CardInfoRow
                        icon={Calendar}
                        label={formatTimeRange(event.startTime, event.endTime)}
                      />
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-blue-600">
                          <MapPin className="h-4.5 w-4.5" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0 text-sm font-normal leading-snug text-slate-700">
                          <p className="break-words">{locationLine1}</p>
                          {locationLine2 ? <p className="break-words">{locationLine2}</p> : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-blue-600">
                          <PersonStanding className="h-5 w-5" strokeWidth={2.5} />
                        </div>
                        <div className="text-sm font-normal text-slate-700">
                          {event.attendeeCount}/{event.maxAttendees} 人已加入
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-blue-600">
                          <CircleDollarSign className="h-4.5 w-4.5" strokeWidth={2.5} />
                        </div>
                        <div className="text-sm font-normal text-slate-700">
                          {priceLabel}
                        </div>
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
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
      <div className="rounded-full bg-white p-2 text-4xl shadow-sm">{icon}</div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  )
}
