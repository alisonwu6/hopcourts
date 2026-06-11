import { Building2, MapPin, ShieldCheck } from 'lucide-react'
import { ApiVenue } from '../services/venuesService'
import { getSportColor, getSportLabel } from '@/constants/sportTokens'

interface VenueCardProps {
  venue: ApiVenue
  onClick: (id: string) => void
}

export function VenueCard({ venue, onClick }: VenueCardProps) {
  const sports = (venue.sport_keys ?? []).slice(0, 4)
  const upcoming = venue.active_sessions_count ?? 0
  const today = (venue as any).today_sessions_count ?? 0

  return (
    <div
      onClick={() => onClick(venue.id)}
      className="cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-all active:scale-[0.98]"
    >
      {/* Top row: logo + name + address */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          {venue.logo_url ? (
            <img src={venue.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-6 w-6 text-slate-300" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-black leading-tight tracking-tight text-slate-900">
              {venue.name_display}
            </h3>
            {venue.status === 'claimed' && (
              <ShieldCheck size={12} className="shrink-0 text-emerald-500" />
            )}
          </div>
          <p className="flex items-center gap-1 truncate text-xs font-medium text-slate-400">
            <MapPin size={10} className="shrink-0" />
            {venue.address_display}
          </p>
        </div>
      </div>

      {/* Row 2: sport tags */}
      {sports.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {sports.map((key: string) => (
            <span
              key={key}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getSportColor(key)}`}
            >
              {getSportLabel(key)}
            </span>
          ))}
        </div>
      )}

      {/* Row 3: today + upcoming */}
      <div className="mt-3 flex gap-2">
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5">
          <span className="text-sm font-black text-slate-800">{today}</span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Today</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5">
          <span className="text-sm font-black text-blue-600">{upcoming}</span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Upcoming</span>
        </div>
      </div>
    </div>
  )
}
