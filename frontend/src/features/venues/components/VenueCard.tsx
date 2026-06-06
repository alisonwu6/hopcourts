import { Building2, ShieldCheck, ChevronRight } from 'lucide-react'
import { ApiVenue } from '../services/venuesService'

interface VenueCardProps {
  venue: ApiVenue
  onClick: (id: string) => void
}

export function VenueCard({ venue, onClick }: VenueCardProps) {
  return (
    <div
      onClick={() => onClick(venue.id)}
      className="group flex cursor-pointer items-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-slate-200 active:scale-[0.98]"
    >
      {/* Venue Logo Thumbnail */}
      <div className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 text-2xl shadow-inner">
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

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-black leading-tight tracking-tight text-slate-900">{venue.name_display}</h3>
        <p className="mt-1 truncate text-xs font-semibold text-slate-400">{venue.address_display}</p>
        <div className="mt-3 flex items-center gap-2">
          {venue.status === 'claimed' ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-700">
              <ShieldCheck
                size={10}
                className="text-emerald-600"
              />
              OFFICIAL
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
              Unclaimed
            </span>
          )}
        </div>
      </div>

      {/* Trailing Arrow */}
      <div className="text-slate-200">
        <ChevronRight
          size={20}
          strokeWidth={3}
        />
      </div>
    </div>
  )
}
