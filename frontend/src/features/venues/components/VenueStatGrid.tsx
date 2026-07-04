import type { ReactNode } from 'react'

interface VenueStatGridProps {
  today: number
  upcoming: number
  past: number
  footer?: ReactNode
}

export function VenueStatGrid({ today, upcoming, past, footer }: VenueStatGridProps) {
  return (
    <div className="mt-3">
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-3">
        <div className="flex flex-col items-center gap-0.5">
          <span className={`text-xl font-black ${today > 0 ? 'text-orange-500' : 'text-slate-200'}`}>
            {today > 0 ? today : '—'}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Today</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className={`text-xl font-black ${upcoming > 0 ? 'text-slate-800' : 'text-slate-200'}`}>
            {upcoming > 0 ? upcoming : '—'}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Upcoming</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xl font-black text-slate-300">{past > 0 ? past : '—'}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Past</span>
        </div>
      </div>

      {footer && <div className="mt-3">{footer}</div>}
    </div>
  )
}
