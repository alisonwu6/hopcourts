import { CalendarCheck, ShieldCheck, Trees, Lock } from 'lucide-react'
import clsx from 'clsx'

export type VenueMapFilterType = 'all' | 'official' | 'public' | 'private' | 'has_events'

interface VenueMapFiltersProps {
  activeFilter: VenueMapFilterType
  onFilterChange: (filter: VenueMapFilterType) => void
}

export function VenueMapFilters({ activeFilter, onFilterChange }: VenueMapFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Chip
        label="All"
        isActive={activeFilter === 'all'}
        activeClassName="bg-slate-900 text-white"
        onClick={() => onFilterChange('all')}
      />
      <Chip
        label="Official"
        isActive={activeFilter === 'official'}
        activeClassName="text-white"
        activeStyle={{ background: '#0067b6' }}
        icon={<ShieldCheck size={14} />}
        onClick={() => onFilterChange('official')}
      />
      <Chip
        label="Public"
        isActive={activeFilter === 'public'}
        activeClassName="text-white"
        activeStyle={{ background: '#2d7a3a' }}
        icon={<Trees size={14} />}
        onClick={() => onFilterChange('public')}
      />
      {/* <Chip
        label="Private"
        isActive={activeFilter === 'private'}
        activeClassName="text-white"
        activeStyle={{ background: '#7c3aed' }}
        icon={<Lock size={14} />}
        onClick={() => onFilterChange('private')}
      /> */}
      <Chip
        label="Has events"
        isActive={activeFilter === 'has_events'}
        activeClassName="text-white"
        activeStyle={{ background: '#df6c03' }}
        icon={<CalendarCheck size={14} />}
        onClick={() => onFilterChange('has_events')}
      />
    </div>
  )
}

function Chip({
  label,
  isActive,
  activeClassName,
  activeStyle,
  icon,
  onClick,
}: {
  label: string
  isActive: boolean
  activeClassName: string
  activeStyle?: React.CSSProperties
  icon?: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-bold shadow-sm transition-all active:scale-95',
        isActive ? activeClassName : 'border border-slate-200 bg-white text-slate-700'
      )}
      style={isActive ? activeStyle : undefined}
    >
      {icon}
      {label}
    </button>
  )
}
