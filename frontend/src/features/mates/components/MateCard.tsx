import clsx from 'clsx'
import { MapPin } from 'lucide-react'

type Vibe = 'Chill' | 'Social' | 'Competitive' | 'Flow'

const vibeTokens: Record<Vibe, { bg: string; text: string; ring: string; card: string }> = {
  Chill: {
    bg: 'linear-gradient(135deg, #6FAED9 0%, #9dd9ff 100%)',
    text: '#ffffff',
    ring: '#6FAED9',
    card: 'linear-gradient(145deg, rgba(111,174,217,0.16) 0%, rgba(111,174,217,0.06) 100%)',
  },
  Social: {
    bg: 'linear-gradient(135deg, #ffe14c 0%,  #f2e7b5 100%)',
    text: '#ffffff',
    ring: '#ffe14c',
    card: 'linear-gradient(145deg, rgba(255,225,76,0.16) 0%, rgba(255,225,76,0.06) 100%)',
  },
  Competitive: {
    bg: 'linear-gradient(135deg, #D64545 0%,#ffb7b7 100%)',
    text: '#ffffff',
    ring: '#D64545',
    card: 'linear-gradient(145deg, rgba(214,69,69,0.16) 0%, rgba(214,69,69,0.06) 100%)',
  },
  Flow: {
    bg: 'linear-gradient(135deg, #8A7DFF 0%, #5FD6C9 100%)',
    text: '#ffffff',
    ring: '#8A7DFF',
    card: 'linear-gradient(145deg, rgba(138,125,255,0.16) 0%, rgba(95,214,201,0.08) 100%)',
  },
}

export type MateCardProps = {
  name: string
  flag: string
  vibe: Vibe
  sports: string[]
  trying: string[]
  location: string
  blurb: string
  avatar: string
  accentClassName?: string
}

export function MateCard({
  name,
  flag,
  vibe,
  sports,
  trying,
  location,
  blurb,
  avatar,
  accentClassName,
}: MateCardProps) {
  const vibeColors =
    vibeTokens[vibe] ??
    {
      bg: 'linear-gradient(135deg, #EEF2F6 0%, #E2E8F0 100%)',
      text: '#1E293B',
      ring: '#CBD5E1',
      card: 'linear-gradient(145deg, rgba(226,232,240,0.18) 0%, rgba(226,232,240,0.08) 100%)',
    }

  return (
    <article
      className={clsx(
        'flex w-full min-w-[calc(100vw-4.25rem)] max-w-[520px] snap-start flex-col gap-3 rounded-[24px] px-4 py-4 shadow-sm border border-amber-50 transition sm:min-w-[420px]',
        accentClassName
      )}
      style={{ background: vibeColors.card }}
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-white shadow-inner ring-2 ring-amber-100">
          <img
            src={avatar}
            alt={`${name} avatar`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex flex-1 items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{name}</span>
              <span className="text-sm" aria-hidden="true">
                {flag}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[12px] font-medium text-slate-600">
              <MapPin className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} aria-hidden="true" />
              <span className="truncate">{location || 'Brisbane'}</span>
            </div>
          </div>
          <span
            className="inline-flex items-center rounded-full px-3.5 py-1 text-xs font-semibold"
            style={{
              background: vibeColors.bg,
              color: vibeColors.text,
              boxShadow: `0 6px 14px ${vibeColors.ring}33, inset 0 1px 0 rgba(255,255,255,0.8)`,
            }}
          >
            {vibe}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-[12px] font-medium text-slate-700">
        <div>
          <span className="text-slate-500 tracking-wide uppercase">Sports I Play:</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {sports.map((sport) => (
              <span
                key={sport}
                className="inline-flex items-center rounded-full bg-[#dce9ff] px-3 py-1 text-xs font-medium text-[#2c5fd3]"
              >
                {sport}
              </span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-slate-500 tracking-wide uppercase">Trying Out:</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {trying.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full bg-[#ffefc7] px-3 py-1 text-xs font-medium text-[#b5681e]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="pt-1 text-[12px] italic text-slate-600 flex gap-2 items-start">
          <span
            className="h-full w-1 rounded"
            style={{ background: vibeColors.ring }}
            aria-hidden="true"
          />
          <span>“{blurb}”</span>
        </div>
      </div>
    </article>
  )
}
