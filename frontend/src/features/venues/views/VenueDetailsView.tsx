import { useEffect, useRef, useState } from 'react'
import { CheckCircle, Clock, List, CalendarDays, Zap, Plus } from 'lucide-react'
import { VenueCard } from '../components/VenueCard'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { EmptyStateCard } from '@/components'
import { EventCard } from '@/features/events/components/EventCard'
import { CalendarView } from '@/features/profile/components/ProfileEventsPanel'
import { VenueButton } from '@/features/venue-portal/components/ui/VenueButton'
import { ApiVenue, computeVenueCounts } from '../services/venuesService'
import { getSportColor, getSportLabel } from '@/constants/sportTokens'
import { useSports } from '@/features/dictionaries/hooks'
import { MapPickerSheet } from '@/components/MapPickerSheet'
import type { PlayerEvent } from '@/types'

const TODAY_KEY = 'TODAY'

function getDayBoundaries() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)
  return { todayStart, tomorrowStart }
}

function groupEventsByDate(events: PlayerEvent[]): [string, PlayerEvent[]][] {
  const formatter = new Intl.DateTimeFormat('en-AU', { weekday: 'short', month: 'short', day: 'numeric' })
  const { todayStart, tomorrowStart } = getDayBoundaries()
  const map = new Map<string, PlayerEvent[]>()

  events.forEach((event) => {
    const date = new Date(event.startTime)
    const isToday = date >= todayStart && date < tomorrowStart
    const label = isToday ? TODAY_KEY : formatter.format(date)
    map.set(label, [...(map.get(label) ?? []), event])
  })

  const result: [string, PlayerEvent[]][] = []
  if (map.has(TODAY_KEY)) {
    result.push([TODAY_KEY, map.get(TODAY_KEY)!])
    map.delete(TODAY_KEY)
  }
  result.push(...map.entries())
  return result
}

function getEventDotStyle(event: PlayerEvent) {
  const now = new Date()
  const start = new Date(event.startTime)
  const end = new Date(event.endTime)
  const openMins = event.checkinOpenMinsBefore ?? 15
  const checkInStart = new Date(start.getTime() - openMins * 60000)
  if (now >= start && now <= end) return 'scale-125 bg-amber-500 ring-amber-300'
  if (now >= checkInStart && now < start) return 'scale-125 bg-emerald-500 ring-emerald-300'
  return 'bg-slate-200 ring-slate-200'
}

function TimelineGroups({ groups, onViewDetails }: { groups: [string, PlayerEvent[]][]; onViewDetails: (id: string) => void }) {
  return (
    <div className="space-y-8">
      {groups.map(([dateLabel, events]) => (
        <div key={dateLabel}>
          {dateLabel === TODAY_KEY ? (
            <div className="mb-4 flex items-center gap-2 pl-1">
              <span className="rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                Today
              </span>
            </div>
          ) : (
            <h3 className="mb-4 pl-1 text-xs font-bold uppercase tracking-wide text-gray-500">{dateLabel}</h3>
          )}
          <div className="relative ml-3 space-y-6 border-l border-slate-200 pb-2">
            {events.map((event) => (
              <div key={event.id} className="relative pl-6">
                <span className={`absolute -left-[5px] top-8 h-2.5 w-2.5 rounded-full border-2 border-white ring-1 ${getEventDotStyle(event)}`} />
                <EventCard
                  event={event}
                  sportLabel={getSportLabel(event.sport)}
                  onViewDetails={onViewDetails}
                  disableVenueHostNavigation
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface VenueDetailsViewProps {
  venue: ApiVenue
  upcomingEvents: PlayerEvent[]
  todayEvents: PlayerEvent[]
  onBack: () => void
  onShare: () => void
  onClaim: () => void
  isClaiming: boolean
  onViewSessionDetails: (sessionId: string) => void
  onCreateEvent?: () => void
}

export function VenueDetailsView({
  venue,
  upcomingEvents,
  todayEvents,
  onBack,
  onShare,
  onClaim,
  isClaiming,
  onViewSessionDetails,
  onCreateEvent,
}: VenueDetailsViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [activeFilter, setActiveFilter] = useState<'today' | 'upcoming'>('today')
  const [mapSheetOpen, setMapSheetOpen] = useState(false)
  const hasInitialized = useRef(false)
  const { items: sportsCatalog } = useSports('en')
  const { past: pastCount } = computeVenueCounts(venue)

  const { tomorrowStart } = getDayBoundaries()
  const futureEvents = upcomingEvents.filter((e) => {
    const d = new Date(e.startTime)
    return d >= tomorrowStart
  })

  const todayCount = todayEvents.length
  const futureCount = futureEvents.length

  useEffect(() => {
    if (!hasInitialized.current && (todayEvents.length > 0 || upcomingEvents.length > 0)) {
      hasInitialized.current = true
      if (todayCount === 0) setActiveFilter('upcoming')
    }
  }, [todayEvents.length, upcomingEvents.length, todayCount])

  const filteredEvents = activeFilter === 'today' ? todayEvents : futureEvents
  const listTitle = activeFilter === 'today' ? 'Games Today' : 'Upcoming'

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-20 text-slate-900">
      <ActionToolbar
        title=""
        onBack={onBack}
        showShare
        onShare={onShare}
        borderBottom
        rightContent={
          onCreateEvent ? (
            <button
              type="button"
              onClick={onCreateEvent}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50/50 text-blue-600 transition hover:bg-blue-100/80 active:scale-90"
              aria-label="Create event here"
            >
              <Plus
                size={18}
                strokeWidth={3}
              />
            </button>
          ) : null
        }
      />

      {/* Hero */}
      <div className="border-b border-slate-100 bg-white p-5 shadow-sm">
        <VenueCard
          venue={venue}
          variant="detail"
          onAddressClick={() => setMapSheetOpen(true)}
        />

        {/* Row 2: Today + Upcoming + Past stats */}
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveFilter('today')
              setViewMode('list')
            }}
            className={`flex flex-col rounded-2xl px-4 py-2.5 transition ${activeFilter === 'today' ? 'bg-orange-50 ring-1 ring-orange-300' : 'bg-slate-50'}`}
          >
            <span className="text-lg font-black leading-none text-orange-500">{todayCount}</span>
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Today</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('upcoming')}
            className={`flex flex-col rounded-2xl px-4 py-2.5 transition ${activeFilter === 'upcoming' ? 'bg-emerald-50 ring-1 ring-emerald-300' : 'bg-slate-50'}`}
          >
            <span className="text-lg font-black leading-none text-emerald-600">{futureCount}</span>
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Upcoming</span>
          </button>
          <div className="flex flex-col rounded-2xl bg-slate-50 px-4 py-2.5">
            <span className="text-center text-lg font-black leading-none text-slate-400">{pastCount}</span>
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Past</span>
          </div>
        </div>

        {/* Description */}
        {venue.description && (
          <div className="mt-5">
            <p className="text-sm font-medium leading-relaxed text-slate-600">{venue.description}</p>
          </div>
        )}

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Amenities</h2>
            <div className="grid grid-cols-2 gap-2">
              {venue.amenities.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <CheckCircle
                    size={12}
                    className="shrink-0 text-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Operating Hours */}
        {venue.operating_hours && venue.operating_hours.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hours</h2>
              <Clock
                size={11}
                className="text-slate-300"
              />
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              {venue.operating_hours.map((hour) => (
                <div
                  key={hour.day}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="w-20 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    {hour.day}
                  </span>
                  <div className="mx-3 h-px flex-1 bg-slate-200/50" />
                  {hour.is_closed ? (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-red-400">Closed</span>
                  ) : (
                    <span className="font-black tabular-nums text-blue-600">
                      {hour.open_time} — {hour.close_time}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Claim CTA */}
      {/* {venue.status !== 'claimed' && !venue.has_pending_claim && (
        <div className="mx-4 mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e8f0c2] text-[#1A3A0A]">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-black tracking-tight text-slate-900">Manage this venue?</h3>
              <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                Get an official badge, manage your schedule, and start a free 14-day trial — instantly.
              </p>
            </div>
          </div>
          <VenueButton
            variant="secondary"
            className="mt-4 h-11 w-full rounded-2xl bg-[#2d3818] px-5 text-sm font-bold text-white hover:bg-[#1A3A0A] disabled:bg-slate-200 disabled:text-slate-500"
            onClick={onClaim}
            isLoading={isClaiming}
          >
            Claim & start free trial
          </VenueButton>
        </div>
      )}
      {venue.has_pending_claim && venue.status !== 'claimed' && (
        <div className="mx-4 mt-6 rounded-3xl border border-slate-100 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-600">
            Your application is under review. We'll be in touch shortly.
          </p>
        </div>
      )} */}

      {/* Upcoming Events */}
      <div className="px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black tracking-tight text-slate-900">{listTitle}</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {filteredEvents.length} events
            </span>
            {activeFilter === 'upcoming' && (
              <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition ${viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  <CalendarDays className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {filteredEvents.length > 0 ? (
          viewMode === 'list' ? (
            <TimelineGroups
              groups={groupEventsByDate(filteredEvents)}
              onViewDetails={onViewSessionDetails}
            />
          ) : (
            <CalendarView
              events={filteredEvents}
              sportsCatalog={sportsCatalog}
              mode="hosted"
              onExplore={undefined}
              onViewDetails={(id) => onViewSessionDetails(id)}
            />
          )
        ) : (
          <EmptyStateCard
            icon={<Zap className="h-8 w-8 text-slate-400" />}
            title="No games on the radar yet"
            description="Host a game and invite your mates!"
          />
        )}
      </div>

      <MapPickerSheet
        open={mapSheetOpen}
        onClose={() => setMapSheetOpen(false)}
        location={{
          lat: Number(venue.lat),
          lng: Number(venue.lng),
          address: venue.address_display,
          name: venue.name_display,
        }}
      />
    </div>
  )
}
