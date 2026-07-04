import { Building2, ExternalLink, MapPin, Navigation, Share2, ShieldCheck, Trees } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ApiVenue, computeVenueCounts } from '../services/venuesService'
import { getSportColor, getSportLabel } from '@/constants/sportTokens'
import { VenueStatGrid } from './VenueStatGrid'

interface VenueCardProps {
  venue: ApiVenue
  variant?: 'list' | 'map' | 'detail'
  // list
  onClick?: (id: string) => void
  // map
  onNavigate?: () => void
  onShare?: () => void
  // detail — address opens map picker
  onAddressClick?: () => void
}

export function VenueCard({
  venue,
  variant = 'list',
  onClick,
  onNavigate,
  onShare,
  onAddressClick,
}: VenueCardProps) {
  const navigate = useNavigate()
  const maxSports = variant === 'map' ? 2 : undefined
  const sports = (venue.sport_keys ?? []).slice(0, maxSports)
  const { today, upcoming, past } = computeVenueCounts(venue)
  const isOfficial = venue.venue_type === 'official'

  const eventCount = today > 0 ? today : upcoming
  const seeEventsLabel = eventCount > 0 ? `See ${eventCount} events →` : 'View venue →'


  const addressLine = onAddressClick ? (
    <button
      type="button"
      onClick={onAddressClick}
      className="mt-0.5 flex items-start gap-1 text-left text-xs font-medium text-slate-400"
    >
      <MapPin size={12} className="mt-[3px] shrink-0" />
      {venue.address_display}
      <ExternalLink size={12} className="mt-[3px] shrink-0" />
    </button>
  ) : (
    <p className="mt-0.5 flex items-start gap-1 text-xs font-medium text-slate-400">
      <MapPin size={12} className="mt-[3px] shrink-0" />
      {venue.address_display}
    </p>
  )

  const header = (
    <>
      {isOfficial ? (
        <>
          <div className="flex items-start justify-between">
            <div className="relative h-12 w-12 flex-none">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                {venue.logo_url ? (
                  <img
                    src={venue.logo_url}
                    alt=""
                    className="h-full w-full object-contain p-1.5"
                  />
                ) : (
                  <Building2 className="h-6 w-6 text-slate-300" />
                )}
              </div>
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 ring-2 ring-white">
                <ShieldCheck
                  size={14}
                  className="text-white"
                />
              </div>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
              <ShieldCheck
                size={11}
                strokeWidth={2.5}
              />
              Official
            </span>
          </div>

          <div className="mt-2">
            <h3 className='font-black leading-tight tracking-tight text-slate-900'>{venue.name_display}</h3>
            {addressLine}
          </div>
        </>
      ) : (
        <div>
          <h3 className='font-black leading-tight tracking-tight text-slate-900'>{venue.name_display}</h3>
          {addressLine}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {!isOfficial && (
          <span className="bg-courts-400 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white">
            <Trees
              size={11}
              strokeWidth={2.5}
            />
            Public
          </span>
        )}
        {sports.map((key: string) => (
          <span
            key={key}
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getSportColor(key)}`}
          >
            {getSportLabel(key)}
          </span>
        ))}
      </div>
    </>
  )

  if (variant === 'detail') {
    return <>{header}</>
  }

  if (variant === 'map') {
    return (
      <div className="rounded-[28px] bg-white p-5 shadow-[0_24px_60px_rgba(15,41,77,0.18)] ring-1 ring-black/5">
        {header}
        <VenueStatGrid
          today={today}
          upcoming={upcoming}
          past={past}
          footer={
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/venues/${venue.id}`)}
                className="flex-1 rounded-2xl bg-slate-900 py-3.5 text-sm font-black tracking-tight text-white transition active:scale-95"
              >
                {seeEventsLabel}
              </button>
              {onNavigate && (
                <button
                  onClick={onNavigate}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 active:scale-95"
                >
                  <Navigation size={18} />
                </button>
              )}
              {onShare && (
                <button
                  onClick={onShare}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 active:scale-95"
                >
                  <Share2 size={18} />
                </button>
              )}
            </div>
          }
        />
      </div>
    )
  }

  return (
    <div
      onClick={() => onClick?.(venue.id)}
      className="cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all active:scale-[0.98]"
    >
      <div className={`h-1.5 w-full ${isOfficial ? 'bg-blue-500' : 'bg-courts-400'}`} />
      <div className="p-4">
        {header}
        <VenueStatGrid today={today} upcoming={upcoming} past={past} />
      </div>
    </div>
  )
}
