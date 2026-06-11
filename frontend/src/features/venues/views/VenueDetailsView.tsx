import { Building2, MapPin, CheckCircle, Clock, Sparkles, ShieldCheck } from 'lucide-react'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { EventCard } from '@/features/events/components/EventCard'
import { VenueButton } from '@/features/venue-portal/components/ui/VenueButton'
import { ApiVenue } from '../services/venuesService'
import { getSportColor, getSportLabel } from '@/constants/sportTokens'

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
  const sportKeys: string[] = Array.isArray((venue as any).sport_keys) ? (venue as any).sport_keys : []
  const todayCount = (venue as any).today_sessions_count ?? 0
  const upcomingCount = venue.active_sessions_count ?? 0

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
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
          <div className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
            {venue.logo_url ? (
              <img src={venue.logo_url} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-8 w-8 text-slate-300" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-black leading-tight tracking-tight text-slate-900">
                {venue.name_display}
              </h1>
              {venue.status === 'claimed' && (
                <ShieldCheck size={16} className="shrink-0 text-emerald-500" />
              )}
            </div>
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

        {/* Row 2: Today + Upcoming stats */}
        <div className="mt-3 flex gap-3">
          <div className="flex flex-col rounded-2xl bg-slate-50 px-4 py-2.5">
            <span className="text-lg font-black leading-none text-slate-900">{todayCount}</span>
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Today</span>
          </div>
          <div className="flex flex-col rounded-2xl bg-slate-50 px-4 py-2.5">
            <span className="text-lg font-black leading-none text-blue-600">{upcomingCount}</span>
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">Upcoming</span>
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
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {upcomingEvents.length} events
          </span>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                sportLabel={getSportLabel(event.sport)}
                onViewDetails={onViewSessionDetails}
                disableVenueHostNavigation
              />
            ))}
          </div>
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
