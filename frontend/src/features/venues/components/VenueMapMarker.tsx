import { CalendarCheck, ShieldCheck } from 'lucide-react'
import clsx from 'clsx'
import { ApiVenue } from '../services/venuesService'

interface VenueMapMarkerProps {
  venue: ApiVenue
  isSelected: boolean
}

type MarkerVariant = 'hasEvents' | 'official'

function getVariant(venue: ApiVenue): MarkerVariant {
  if (venue.status === 'claimed') return 'official'
  return 'hasEvents'
}

const VARIANT_STYLES = {
  hasEvents: {
    pill: 'text-white',
    pillStyle: { background: '#df6c03' },
    tailColor: '#df6c03',
  },
  official: {
    pill: 'text-white',
    pillStyle: { background: '#0067b6' },
    tailColor: '#0067b6',
  },
} as const

export function VenueMapMarker({ venue, isSelected }: VenueMapMarkerProps) {
  const variant = getVariant(venue)
  const styles = VARIANT_STYLES[variant]

  const icon = variant === 'hasEvents' ? <CalendarCheck size={14} /> : <ShieldCheck size={14} />

  const eventCount = venue.active_sessions_count
  const label = eventCount > 0 ? (eventCount === 1 ? '1 event' : `${eventCount} events`) : null

  return (
    <div className="flex flex-col items-center" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
      <div
        className={clsx(
          'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-md transition-all',
          styles.pill,
          isSelected && 'scale-110 shadow-lg ring-2 ring-white ring-offset-1'
        )}
        style={styles.pillStyle}
      >
        {icon}
        {label && <span className="whitespace-nowrap">{label}</span>}
      </div>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `6px solid ${styles.tailColor}`,
        }}
      />
    </div>
  )
}
