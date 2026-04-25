import { Building2, MapPin, CheckCircle, AlertCircle, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import { ActionToolbar } from '@/components/navigation/ActionToolbar';
import { EventCard } from '@/features/events/components/EventCard';
import { VenueButton } from '@/features/venue-portal/components/ui/VenueButton';
import { ApiVenue } from '../services/venuesService';

interface VenueDetailsViewProps {
  venue: ApiVenue;
  upcomingEvents: any[];
  onBack: () => void;
  onShare: () => void;
  onClaim: () => void;
  isClaiming: boolean;
  onViewSessionDetails: (sessionId: string) => void;
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
  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      <ActionToolbar
        title={venue.name_display}
        onBack={onBack}
        showShare
        onShare={onShare}
      />

      {/* Hero / Basic Info */}
      <div className="bg-white px-6 py-8 shadow-sm border-b border-slate-100">
        <div className="flex flex-col items-start gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-[2.5rem] border-4 border-slate-50 shadow-xl shrink-0 bg-slate-50 flex items-center justify-center text-4xl">
            {venue.logo_url ? (
              <img src={venue.logo_url} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-10 w-10 text-slate-300" />
            )}
          </div>

          <div className="flex-1 min-w-0 mt-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {venue.name_display}
            </h1>
            <div className="mt-3 flex items-start gap-2 text-sm text-slate-500 font-medium">
              <MapPin className="h-4 w-4 text-slate-300 mt-0.5 shrink-0" />
              <span>{venue.address_display || 'No address information'}</span>
            </div>

            {/* Status Badge */}
            <div className="mt-4 flex gap-2">
              {venue.status === 'claimed' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 border border-emerald-200/70">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  OFFICIAL
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <AlertCircle className="h-3 w-3" />
                  Unclaimed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Public Bio */}
        {venue.description && (
          <div className="mt-8">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
              About
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-50 italic">
              "{venue.description}"
            </p>
          </div>
        )}

        {/* Amenities List */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="mt-8">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Amenities & Services
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {venue.amenities.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100/50"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Operating Hours */}
        {venue.operating_hours && venue.operating_hours.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Operating Hours
              </h2>
              <Clock className="h-3 w-3 text-slate-300" />
            </div>
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
              {venue.operating_hours.map((hour) => (
                <div key={hour.day} className="flex justify-between items-center text-xs">
                  <span className="font-black text-slate-500 uppercase tracking-widest text-[9px] w-20">
                    {hour.day}
                  </span>
                  <div className="h-px flex-1 bg-slate-200/50 mx-4" />
                  {hour.is_closed ? (
                    <span className="font-bold text-red-400 uppercase tracking-widest text-[9px]">
                      Closed
                    </span>
                  ) : (
                    <span className="font-black text-indigo-600 tabular-nums">
                      {hour.open_time} — {hour.close_time}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {venue.spaces && venue.spaces.length > 0 && (
          <div className="mt-8">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Courts & Supported Sports
            </h2>
            <div className="space-y-3">
              {venue.spaces.map((space, idx) => (
                <div key={`${space.name}-${idx}`} className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                  <div className="font-black text-slate-700 uppercase tracking-tight mb-2">
                    {space.name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {space.supported_sports.length > 0 ? (
                      space.supported_sports.map((sport) => (
                        <span
                          key={sport}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 shadow-sm"
                        >
                          {sport}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs italic">No sports configured</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Claim CTA (Only for unclaimed) */}
      {venue.status !== 'claimed' && (
        <div className="mx-6 mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black tracking-tight text-slate-900">Own this venue?</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Verified venues get official checkmarks and portal access.
              </p>
            </div>
          </div>
          <VenueButton
            variant="secondary"
            className="mt-5 h-11 w-full rounded-[18px] px-5 text-[11px] font-black uppercase tracking-[0.18em] hover:bg-slate-900"
            onClick={onClaim}
            isLoading={isClaiming}
          >
            Claim venue
          </VenueButton>
        </div>
      )}

      {/* Events Sections */}
      <div className="px-6 py-8">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Sessions</h2>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {upcomingEvents.length} Sessions
          </span>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={onViewSessionDetails}
                disableVenueHostNavigation
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 rounded-[2.5rem] bg-white border border-dashed border-slate-200">
            <div className="h-16 w-16 bg-slate-50 flex items-center justify-center rounded-3xl mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">
              No sessions found
            </p>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-2">
              Check back soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
