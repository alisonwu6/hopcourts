import { ShieldCheck, Trees, CalendarCheck } from 'lucide-react'
import clsx from 'clsx'
import { ApiVenue } from '../services/venuesService'

interface VenueMapMarkerProps {
  venue: ApiVenue
  isSelected: boolean
}

const TYPE_STYLES = {
  official: {
    pill: 'text-white',
    pillStyle: { background: '#0067b6' },
    tailColor: '#0067b6',
    icon: <ShieldCheck size={18} />,
  },
  public: {
    pill: 'text-white',
    pillStyle: { background: '#2d7a3a' },
    tailColor: '#2d7a3a',
    icon: <Trees size={18} />,
  },
  private: {
    pill: 'text-white',
    pillStyle: { background: '#7c3aed' },
    tailColor: '#7c3aed',
    icon: <CalendarCheck size={18} />,
  },
} as const

export function VenueMapMarker({ venue, isSelected }: VenueMapMarkerProps) {
  const type = venue.venue_type ?? 'public'
  const styles = TYPE_STYLES[type] ?? TYPE_STYLES.public

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
        {styles.icon}
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
