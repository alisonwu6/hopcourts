import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { PlayerEvent } from '@/types'
import { useAuthStore } from '@/hooks'
import { useSports } from '@/features/dictionaries/hooks'
import { eventsService } from '@/features/events/services/eventsService'
import {
  Calendar,
  MapPin,
  PersonStanding,
  CircleDollarSign,
  ChartColumnIncreasing,
  Smile,
  type LucideIcon,
} from 'lucide-react'

type TabKey = 'upcoming' | 'history'
type PanelMode = 'all' | 'hosted' | 'joined'
type SportsItem = { key: string; label: string; icon?: string | null }
type EventStatus = 'check-in-open' | 'ongoing' | null

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

function formatTimeRange(start: Date | string, end: Date | string) {
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

function getEventStatus(event: PlayerEvent): EventStatus {
  const now = new Date()
  const start = new Date(event.startTime)
  const end = event.endTime ? new Date(event.endTime) : start

  if (event.status === 'draft') return null

  const openMins = event.checkinOpenMinsBefore ?? 30
  const checkInStart = new Date(start.getTime() - openMins * 60000)
  if (now >= start && now <= end) return 'ongoing'
  if (now >= checkInStart && now < start) return 'check-in-open'
  return null
}

function getSkillLabel(skillLevel: PlayerEvent['skillLevel']) {
  if (skillLevel === 'beginner') return '初階'
  if (skillLevel === 'intermediate') return '中階步調'
  if (skillLevel === 'advanced') return '進階'
  return '不限程度'
}

function getGenderLabel(gender: PlayerEvent['gender']) {
  if (gender === 'female') return '女性專屬'
  if (gender === 'male') return '男性專屬'
  return '性別混合'
}

function formatTwdNoDecimal(value: unknown) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  return Math.round(n).toLocaleString('zh-TW')
}

function getPriceLabel(event: PlayerEvent) {
  return event.isFree
    ? '免費體驗'
    : event.priceRange || `$${formatTwdNoDecimal(event.pricePerPerson)} /人`
}

function getLocationLines(event: PlayerEvent) {
  const line1 =
    event.location.name && event.location.name !== event.location.address
      ? event.location.name
      : event.location.name || event.location.address || '地點待確認'
  const line2 =
    event.location.name && event.location.address && event.location.name !== event.location.address
      ? event.location.address
      : ''
  return { line1, line2 }
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

function EventTags({ event, sportsCatalog }: { event: PlayerEvent; sportsCatalog: SportsItem[] }) {
  const sportItem = sportsCatalog.find((s) => s.key.toUpperCase() === event.sport.toUpperCase())
  const sportLabel = sportItem?.label || event.sport
  const sportIcon = sportItem?.icon || '🎯'

  return (
    <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
        <span>{sportIcon}</span>
        {sportLabel}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
        <ChartColumnIncreasing className="h-3 w-3" strokeWidth={2.5} />
        {getSkillLabel(event.skillLevel)}
      </span>
      <span className="inline-flex items-center rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-pink-700">
        {getGenderLabel(event.gender)}
      </span>
    </div>
  )
}

function StatusBadge({ status }: { status: EventStatus }) {
  if (status === 'check-in-open') {
    return (
      <span className="flex-shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
        開放報到中
      </span>
    )
  }
  if (status === 'ongoing') {
    return (
      <span className="flex-shrink-0 animate-pulse rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
        進行中
      </span>
    )
  }
  return null
}

function HostedEventCard({
  event,
  sportsCatalog,
}: {
  event: PlayerEvent
  sportsCatalog: SportsItem[]
}) {
  const navigate = useNavigate()
  const status = getEventStatus(event)
  const { line1, line2 } = getLocationLines(event)
  const attendeeCount = Number(event.attendeeCount ?? 0)
  const maxAttendees = Number(event.maxAttendees ?? 0)
  const minPeople = Number(event.minPeople ?? 3)
  const remaining = Math.max(maxAttendees - attendeeCount, 0)

  return (
    <button
      type="button"
      onClick={() => {
        if (event.status === 'draft') {
          navigate(`/create-event?id=${event.id}`)
        } else {
          navigate(`/event/${event.id}`)
        }
      }}
      className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-lg font-bold text-slate-900">{event.title}</h4>
        </div>
        <div className="flex items-center gap-2">
          {event.status === 'draft' && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              草稿
            </span>
          )}
          <StatusBadge status={status} />
        </div>
      </div>
      <EventTags event={event} sportsCatalog={sportsCatalog} />
      <div className="space-y-2.5 pt-3">
        <CardInfoRow icon={Calendar} label={formatTimeRange(event.startTime, event.endTime)} />
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-blue-600">
            <MapPin className="h-4.5 w-4.5" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 text-sm font-normal leading-snug text-slate-700">
            <p className="break-words">{line1}</p>
            {line2 ? <p className="break-words">{line2}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-blue-600">
            <PersonStanding className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="text-sm font-normal text-slate-700">
            {attendeeCount}人已加入 | 剩 {remaining} 位名額（{minPeople}人成團）
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-blue-600">
            <CircleDollarSign className="h-4.5 w-4.5" strokeWidth={2.5} />
          </div>
          <div className="text-sm font-normal text-slate-700">{getPriceLabel(event)}</div>
        </div>
      </div>
    </button>
  )
}

function JoinedEventCard({
  event,
  sportsCatalog,
}: {
  event: PlayerEvent
  sportsCatalog: SportsItem[]
}) {
  const navigate = useNavigate()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/event/${event.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/event/${event.id}`)
        }
      }}
      className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition"
    >
      <div>
        <button
          type="button"
          disabled={!event.host?.username}
          onClick={(e) => {
            e.stopPropagation()
            if (!event.host?.username) return
            navigate(`/mate/${event.host.username}`)
          }}
          className="flex cursor-pointer items-center gap-3 transition disabled:cursor-default"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100">
              {event.host?.avatarUrl ? (
                <img
                  src={event.host.avatarUrl}
                  alt={event.host.name || 'host'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <Smile className="h-6 w-6" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {event.host?.name || '活動發起人'}
              </p>
              <p className="text-left text-xs text-slate-500">活動發起人</p>
            </div>
          </div>
        </button>

        <hr className="my-3 border-slate-200" />

        <div className="space-y-3">
          <h4 className="text-[18px] font-semibold leading-tight text-slate-900">{event.title}</h4>
          <EventTags event={event} sportsCatalog={sportsCatalog} />
        </div>
      </div>
    </div>
  )
}

function EventGroupList({
  groups,
  mode,
  sportsCatalog,
  emptyState,
}: {
  groups: Array<[string, PlayerEvent[]]>
  mode: PanelMode
  sportsCatalog: SportsItem[]
  emptyState: React.ReactNode
}) {
  if (groups.length === 0) return emptyState

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
                  {mode === 'hosted' ? (
                    <HostedEventCard event={event} sportsCatalog={sportsCatalog} />
                  ) : (
                    <JoinedEventCard event={event} sportsCatalog={sportsCatalog} />
                  )}
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

export function ProfileEventsPanel({
  mode,
  showTimeTabs = true,
}: {
  mode: PanelMode
  showTimeTabs?: boolean
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as TabKey) || 'upcoming'
  const [events, setEvents] = useState<PlayerEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { items: sportsCatalog } = useSports('zh')

  useEffect(() => {
    if (!isAuthenticated) {
      setEvents([])
      setIsLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const role = mode === 'all' ? 'all' : mode
        const time: 'upcoming' | 'history' = showTimeTabs ? tab : 'upcoming'
        const res = await eventsService.getMyEventsScoped({ role, time }, { force: true })
        if (cancelled) return
        if (res.success && res.data) {
          setEvents(res.data.data ?? [])
        } else {
          setEvents([])
          setError(res.error?.message ?? 'Failed to load events')
        }
      } catch {
        if (!cancelled) {
          setEvents([])
          setError('An error occurred')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, mode, showTimeTabs, tab])

  const upcomingEvents = useMemo(
    () => events.filter((event) => new Date(event.endTime) >= new Date()),
    [events]
  )
  const historyEvents = useMemo(
    () => events.filter((event) => new Date(event.endTime) < new Date()),
    [events]
  )

  const activeTab: TabKey = showTimeTabs ? tab : 'upcoming'
  const activeEvents = activeTab === 'upcoming' ? upcomingEvents : historyEvents
  const empty =
    activeTab === 'upcoming'
      ? {
          icon: '📭',
          title:
            mode === 'hosted'
              ? '目前沒有主辦活動'
              : mode === 'joined'
                ? '目前沒有參與活動'
                : '目前沒有場次',
          description: mode === 'hosted' ? '建立一個活動來邀請夥伴吧！' : '去看看其他活動並加入吧',
        }
      : {
          icon: '📜',
          title:
            mode === 'hosted'
              ? '尚無主辦歷史紀錄'
              : mode === 'joined'
                ? '尚無參與歷史紀錄'
                : '尚無歷史紀錄',
          description: '完成的活動會顯示在這裡',
        }

  return (
    <div className="space-y-4">
      {showTimeTabs && (
        <div className="flex rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab('upcoming')}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
              tab === 'upcoming' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            即將到來 ({upcomingEvents.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
              tab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            歷史紀錄 ({historyEvents.length})
          </button>
        </div>
      )}

      <div className="min-h-[200px]">
        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="py-10 text-center text-slate-500">載入你的場次中…</div>
        ) : (
          <EventGroupList
            groups={groupByDate(activeEvents)}
            mode={mode === 'all' ? 'hosted' : mode}
            sportsCatalog={sportsCatalog}
            emptyState={
              <EmptyState icon={empty.icon} title={empty.title} description={empty.description} />
            }
          />
        )}
      </div>
    </div>
  )
}
