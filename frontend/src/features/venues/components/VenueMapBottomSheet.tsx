import { Building2, MapPin, Navigation, Share2, ShieldCheck, Trees } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ApiVenue } from '../services/venuesService'
import { getSportColor, getSportLabel } from '@/constants/sportTokens'

interface VenueMapBottomSheetProps {
  venue: ApiVenue
  onNavigate: () => void
  onShare: () => void
}

const VENUE_TYPE_BADGE = {
  official: { label: 'Official', icon: <ShieldCheck size={10} />, className: 'border-blue-200 bg-blue-50 text-blue-600' },
  public:   { label: 'Public',   icon: <Trees size={10} />,       className: 'border-green-200 bg-green-50 text-green-700' },
  private:  { label: 'Private',  icon: null,                       className: 'border-slate-200 bg-slate-50 text-slate-600' },
} as const

export function VenueMapBottomSheet({ venue, onNavigate, onShare }: VenueMapBottomSheetProps) {
  const navigate = useNavigate()
  const venueType = venue.venue_type ?? 'public'
  const badge = VENUE_TYPE_BADGE[venueType] ?? VENUE_TYPE_BADGE.public
  const today = venue.today_sessions_count ?? 0
  const upcoming = venue.active_sessions_count ?? 0
  const sports = (venue.sport_keys ?? []).slice(0, 2)
  const eventCount = today > 0 ? today : upcoming
  const btnLabel = eventCount > 0 ? `See ${eventCount} events →` : 'View venue →'

  return (
    <div className="rounded-[28px] bg-white p-5 shadow-[0_24px_60px_rgba(15,41,77,0.18)] ring-1 ring-black/5">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[20px] bg-slate-50 ring-1 ring-slate-100">
            {venue.logo_url ? (
              <img
                src={venue.logo_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-8 w-8 text-slate-300" />
            )}
          </div>
          {venueType === 'official' && (
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 ring-2 ring-white">
              <ShieldCheck size={10} className="text-white" />
            </div>
          )}
          {venueType === 'public' && (
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 ring-2 ring-white">
              <Trees size={10} className="text-white" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-black tracking-tight text-slate-900">{venue.name_display}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-400">
            <MapPin
              size={10}
              className="shrink-0"
            />
            {venue.address_display}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {sports.map((key) => (
          <span
            key={key}
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${getSportColor(key)}`}
          >
            {getSportLabel(key)}
          </span>
        ))}
        {today > 0 && (
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-600">
            {today} events today
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-3">
          <span className="text-xl font-black text-orange-500">{today}</span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">Events today</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-3">
          <span className="text-xl font-black text-emerald-500">{upcoming}</span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">Upcoming</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-3">
          <span className="text-xl font-black text-slate-800">—</span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">Away</span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => navigate(`/venues/${venue.id}`)}
          className="flex-1 rounded-2xl bg-slate-900 py-3.5 text-sm font-black tracking-tight text-white transition active:scale-95"
        >
          {btnLabel}
        </button>
        <button
          onClick={onNavigate}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition active:scale-95 hover:bg-slate-50"
        >
          <Navigation size={18} />
        </button>
        <button
          onClick={onShare}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition active:scale-95 hover:bg-slate-50"
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  )
}
