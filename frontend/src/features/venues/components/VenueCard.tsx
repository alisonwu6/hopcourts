import { Building2, CheckCircle, ChevronRight } from 'lucide-react';
import { ApiVenue } from '../services/venuesService';

interface VenueCardProps {
  venue: ApiVenue;
  onClick: (id: string) => void;
}

export function VenueCard({ venue, onClick }: VenueCardProps) {
  return (
    <div
      onClick={() => onClick(venue.id)}
      className="group cursor-pointer rounded-[2rem] bg-white p-5 shadow-sm border border-slate-100 hover:border-slate-200 transition-all active:scale-[0.98] flex items-center gap-4"
    >
      {/* Venue Logo Thumbnail */}
      <div className="h-16 w-16 flex-none rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-2xl shadow-inner">
        {venue.logo_url ? (
          <img src={venue.logo_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <Building2 className="h-8 w-8 text-slate-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-black text-slate-900 tracking-tight leading-tight truncate">
          {venue.name_display}
        </h3>
        <p className="text-xs font-semibold text-slate-400 mt-1 truncate">
          {venue.address_display}
        </p>
        <div className="mt-3 flex items-center gap-2">
          {venue.status === 'claimed' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-600 border border-slate-200/50">
              <CheckCircle size={10} />
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
        <ChevronRight size={20} strokeWidth={3} />
      </div>
    </div>
  );
}
