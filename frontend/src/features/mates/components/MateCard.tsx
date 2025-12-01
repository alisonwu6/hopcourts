import clsx from 'clsx'
import { MapPin } from 'lucide-react'
import { vibeTokens, type Vibe } from '@/constants/vibeTokens'

const withAlpha = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
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
        'flex w-full min-w-[calc(100vw-4.25rem)] max-w-[520px] snap-start flex-col gap-3 rounded-[24px] px-4 py-4 transition sm:min-w-[420px]',
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
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: withAlpha(vibeColors.ring, 0.7),
                  color: vibeColors.text,
                  boxShadow: `0 0 0 1px ${withAlpha(vibeColors.ring, 0.25)}`,
                }}
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
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: withAlpha(vibeColors.ring, 0.5),
                  color: vibeColors.text,
                  boxShadow: `0 0 0 1px ${withAlpha(vibeColors.ring, 0.2)}`,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-2 pt-1 text-[12px] text-slate-600">
          <span
            className="block w-1 rounded self-stretch min-h-[32px]"
            style={{ background: vibeColors.ring }}
            aria-hidden="true"
          />
          {blurb?.trim() ? (
            <span className="italic">“{blurb}”</span>
          ) : (
            <span className="text-slate-400 not-italic">This mover hasn&apos;t added a line yet.</span>
          )}
        </div>
      </div>
    </article>
  )
}
