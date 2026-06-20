import { useState } from 'react'
import { Building2, MapPin, CheckCircle, Clock, Sparkles, ShieldCheck, Trees, List, CalendarDays } from 'lucide-react'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { EventCard } from '@/features/events/components/EventCard'
import { CalendarView } from '@/features/profile/components/ProfileEventsPanel'
import { VenueButton } from '@/features/venue-portal/components/ui/VenueButton'
import { ApiVenue } from '../services/venuesService'
import { getSportColor, getSportLabel } from '@/constants/sportTokens'
import { useSports } from '@/features/dictionaries/hooks'
import type { PlayerEvent } from '@/types'

function groupEventsByDate(events: any[]) {
  const formatter = new Intl.DateTimeFormat('en-AU', { weekday: 'short', month: 'short', day: 'numeric' })
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  const map = new Map<string, any[]>()
  events.forEach((event) => {
    const date = new Date(event.startTime ?? event.starts_at)
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    const base = formatter.format(date)
    const label = dateKey === todayKey ? `Today · ${base}` : base
    map.set(label, [...(map.get(label) ?? []), event])
  })
  return Array.from(map.entries())
}

function getEventDotStyle(event: any) {
  const now = new Date()
  const start = new Date(event.startTime ?? event.starts_at)
  const end = new Date(event.endTime ?? event.ends_at ?? start)
  const openMins = event.checkinOpenMinsBefore ?? 15
  const checkInStart = new Date(start.getTime() - openMins * 60000)
  if (now >= start && now <= end) return 'scale-125 bg-amber-500 ring-amber-300'
  if (now >= checkInStart && now < start) return 'scale-125 bg-emerald-500 ring-emerald-300'
  return 'bg-slate-200 ring-slate-200'
}

function TimelineGroups({ groups, onViewDetails }: { groups: [string, any[]][]; onViewDetails: (id: string) => void }) {
  return (
    <div className="space-y-8">
      {groups.map(([dateLabel, events]) => (
        <div key={dateLabel}>
          <h3 className="mb-4 pl-1 text-xs font-bold uppercase tracking-wide text-gray-500">{dateLabel}</h3>
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
  upcomingEvents: any[]
  onBack: () => void
  onShare: () => void
  onClaim: () => void
  isClaiming: boolean
  onViewSessionDetails: (sessionId: string) => void
}

export function VenueDetailsView({
  venue,
  upcomingEvents,
  onBack,
  onShare,
  onClaim,
  isClaiming,
  onViewSessionDetails,
}: VenueDetailsViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const { items: sportsCatalog } = useSports('en')
  const sportKeys: string[] = Array.isArray((venue as any).sport_keys) ? (venue as any).sport_keys : []
  const todayCount = (venue as any).today_sessions_count ?? 0
  const upcomingCount = venue.active_sessions_count ?? 0
  const pastCount = (venue as any).past_sessions_count ?? 0
  const typedEvents = upcomingEvents as PlayerEvent[]

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-20 text-slate-900">
      <ActionToolbar
        title=""
        onBack={onBack}
        showShare
        onShare={onShare}
      />

      {/* Hero */}
      <div className="border-b border-slate-100 bg-white px-5 pb-6 pt-2 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="relative h-16 w-16 flex-none">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
              {venue.logo_url ? (
                <img src={venue.logo_url} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-8 w-8 text-slate-300" />
              )}
            </div>
            {venue.venue_type === 'official' && (
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 ring-2 ring-white">
                <ShieldCheck size={10} className="text-white" />
              </div>
            )}
            {venue.venue_type === 'public' && (
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 ring-2 ring-white">
                <Trees size={10} className="text-white" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-black leading-tight tracking-tight text-slate-900">
              {venue.name_display}
            </h1>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-400">
              <MapPin size={11} className="shrink-0" />
              {venue.address_display || 'Address not listed'}
            </p>
          </div>
        </div>

        {/* Row 1: Sport tags */}
        {sportKeys.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {sportKeys.map((key) => (
              <span
                key={key}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${getSportColor(key)}`}
              >
                {getSportLabel(key)}
              </span>
            ))}
          </div>
        )}

        {/* Row 2: Today + Upcoming + Past stats */}
        <div className="mt-3 flex gap-3">
          <div className="flex flex-col rounded-2xl bg-slate-50 px-4 py-2.5">
            <span className="text-lg font-black leading-none text-orange-500">{todayCount}</span>
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Today</span>
          </div>
          <div className="flex flex-col rounded-2xl bg-slate-50 px-4 py-2.5">
            <span className="text-lg font-black leading-none text-emerald-600">{upcomingCount}</span>
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Upcoming</span>
          </div>
          <div className="flex flex-col rounded-2xl bg-slate-50 px-4 py-2.5">
            <span className="text-lg font-black leading-none text-slate-400">{pastCount}</span>
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
                  <CheckCircle size={12} className="shrink-0 text-emerald-500" />
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
              <Clock size={11} className="text-slate-300" />
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              {venue.operating_hours.map((hour) => (
                <div key={hour.day} className="flex items-center justify-between text-xs">
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

        {/* Courts & Spaces */}
        {venue.spaces && venue.spaces.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Courts & spaces</h2>
            <div className="space-y-2">
              {venue.spaces.map((space, idx) => (
                <div
                  key={`${space.name}-${idx}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="mb-2 text-xs font-black uppercase tracking-tight text-slate-700">{space.name}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {space.supported_sports.length > 0 ? (
                      space.supported_sports.map((sport) => (
                        <span
                          key={sport}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getSportColor(sport.toUpperCase())}`}
                        >
                          {sport}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs italic text-slate-400">None listed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Claim CTA */}
      {venue.status !== 'claimed' && (
        <div className="mx-4 mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${venue.has_pending_claim ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <Sparkles size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-black tracking-tight text-slate-900">Own this venue?</h3>
              <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                {venue.has_pending_claim
                  ? 'Your application is under review. We\'ll get back to you shortly.'
                  : 'Claim it to get an official badge and manage your events.'}
              </p>
            </div>
          </div>
          <VenueButton
            variant="secondary"
            className="mt-4 h-11 w-full rounded-2xl px-5 text-[11px] font-black uppercase tracking-[0.18em]"
            onClick={venue.has_pending_claim ? undefined : onClaim}
            isLoading={isClaiming}
            disabled={venue.has_pending_claim}
          >
            {venue.has_pending_claim ? 'Claim Submitted' : 'Claim venue'}
          </VenueButton>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black tracking-tight text-slate-900">Upcoming events</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {upcomingEvents.length} events
            </span>
            <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition ${viewMode === 'calendar' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
              >
                <CalendarDays className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {typedEvents.length > 0 ? (
          viewMode === 'list' ? (
            <TimelineGroups
              groups={groupEventsByDate(upcomingEvents)}
              onViewDetails={onViewSessionDetails}
            />
          ) : (
            <CalendarView
              events={typedEvents}
              sportsCatalog={sportsCatalog}
              mode="hosted"
              onExplore={undefined}
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-12 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-slate-400">Nothing scheduled yet</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-300">Check back soon</p>
          </div>
        )}
      </div>
    </div>
  )
}
