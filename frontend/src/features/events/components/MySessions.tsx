import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PlayerEvent } from '@/types'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { useAuthStore } from '@/hooks'
import { BottomSheet } from '@/components/BottomSheet'
import { LoginPanel } from '@/components/LoginPanel'

type TabKey = 'upcoming' | 'history'

function groupByDate(events: PlayerEvent[]) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
  const map = new Map<string, PlayerEvent[]>()
  events.forEach((event) => {
    const date = event.startTime ? new Date(event.startTime) : new Date(event.updatedAt || Date.now())
    const label = formatter.format(date)
    map.set(label, [...(map.get(label) ?? []), event])
  })
  return Array.from(map.entries())
}

function resolveSportIcon(sport: string) {
  const sportIcons: Record<string, string> = {
    running: '🏃',
    basketball: '🏀',
    climbing: '🧗',
    tennis: '🎾',
    bouldering: '🧗',
  }
  return sportIcons[sport.toLowerCase()] ?? '⚽'
}

export function MySessions() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('upcoming')
  const events = useEventsStore((state) => state.events)
  const fetchMyEvents = useEventsStore((state) => state.fetchMyEvents)
  const isLoading = useEventsStore((state) => state.isLoading)
  const error = useEventsStore((state) => state.error)
  const { isAuthenticated, currentUserId } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    currentUserId: state.user?.id,
  }))
  const [showLoginSheet, setShowLoginSheet] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      void fetchMyEvents()
    }
  }, [fetchMyEvents, isAuthenticated])

  const upcomingEvents = useMemo(() => events.filter((event) => {
    return new Date(event.endTime) >= new Date()
  }), [events])

  const historyEvents = useMemo(() => events.filter((event) => {
    return new Date(event.endTime) < new Date()
  }), [events])

  if (!isAuthenticated) {
    return (
      <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-6 text-center">
        <h3 className="text-lg font-bold text-slate-900">我的場次</h3>
        <p className="mt-2 text-sm text-slate-600">
          登入後即可查看你已加入的活動與紀錄。
        </p>
        <button
          type="button"
          onClick={() => setShowLoginSheet(true)}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
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
      <div className="rounded-full bg-slate-100 p-1 flex">
        <button
          type="button"
          onClick={() => setTab('upcoming')}
          className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
            tab === 'upcoming'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
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
              : 'text-slate-600 hover:text-slate-800'
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
            emptyState={
               <EmptyState icon="📭" title="目前沒有場次" description="去看看其他活動並加入吧" />
            }
          />
        ) : (
          <EventGroupList
            groups={groupByDate(historyEvents)}
            currentUserId={currentUserId}
            emptyState={
              <EmptyState icon="📜" title="尚無歷史紀錄" description="完成的活動和草稿會顯示在這裡" />
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
}: {
  groups: Array<[string, PlayerEvent[]]>
  emptyState: React.ReactNode
  currentUserId?: string
}) {
  const navigate = useNavigate()

  if (groups.length === 0) {
    return emptyState
  }

  return (
    <div className="space-y-6">
      {groups.map(([dateLabel, groupedEvents]) => (
        <div key={dateLabel}>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500 pl-1">
            {dateLabel}
          </h3>
          <div className="space-y-3">
            {groupedEvents.map((event) => (
              <div
                key={event.id}
                className="group relative flex items-stretch"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (event.status === 'draft') {
                      navigate(`/create-event?id=${event.id}`)
                    } else {
                      navigate(`/event/${event.id}`)
                    }
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md hover:border-blue-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">
                        {event.status === 'draft' && (
                          <span className="mr-2 inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                            草稿
                          </span>
                        )}
                        {event.title}
                      </h4>
                      <div className="mt-1 flex flex-col gap-1 text-xs text-slate-500">
                        <span>
                          {new Date(event.startTime).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })} {' '}
                          {new Date(event.startTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}-
                          {new Date(event.endTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                        <span className="truncate">
                          📍 {event.location.name && event.location.name !== event.location.address 
                              ? `${event.location.name} (${event.location.address})` 
                              : (event.location.name || event.location.address)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {event.attendeeCount}/{event.maxAttendees} 人
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          剩餘名額 {Math.max(0, event.maxAttendees - event.attendeeCount)} 人
                        </span>
                      </div>
                    </div>
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl shadow-inner">
                      {resolveSportIcon(event.sport)}
                    </div>
                  </div>
                </button>
              </div>
            ))}
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
      <div className="text-4xl shadow-sm rounded-full bg-white p-2">{icon}</div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  )
}
