import clsx from 'clsx'
import { MapPin } from 'lucide-react'
import { vibeTokens, vibeList, type Vibe } from '@/constants/vibeTokens'

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
  username?: string
  flag: string
  countryKey?: string
  vibe: Vibe | null
  vibeKey?: string | null
  vibeLabel?: string
  sports: string[]
  trying: string[]
  location: string
  cityKey?: string
  blurb: string
  avatar: string
  accentClassName?: string
  gender?: string | null
  ageRangeKey?: string | null
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
  gender,
  ageRangeKey,
}: MateCardProps) {
  const vibeColors = (vibe ? vibeTokens[vibe] : undefined) ?? {
    bg: 'linear-gradient(135deg, #EEF2F6 0%, #E2E8F0 100%)',
    text: '#1E293B',
    ring: '#CBD5E1',
    card: 'linear-gradient(145deg, rgba(226,232,240,0.18) 0%, rgba(226,232,240,0.08) 100%)',
  }

  return (
    <article
      className={clsx(
        'flex w-full min-w-[calc(100vw-4.25rem)] max-w-[520px] snap-start flex-col gap-3 rounded-[24px] bg-slate-200 px-4 py-4 transition sm:min-w-[420px]',
        accentClassName
      )}
    >
      <div className="flex items-start gap-3">
        <div className="h-26 w-26 mb-2 flex-shrink-0 overflow-hidden rounded-full bg-white">
          <img
            src={avatar}
            alt={`${name} avatar`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex flex-1 items-start justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {name && <span className="text-sm font-semibold text-slate-900">{name}</span>}
              <span className="text-sm" aria-hidden="true">
                {flag}
              </span>
            </div>
            {location && (
              <div className="flex items-center gap-1 text-[12px] font-medium text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} aria-hidden="true" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>
          {vibe && (
            <span
              className="inline-flex items-center rounded-full px-3.5 py-1 text-xs font-semibold"
              style={{
                background: vibeColors.bg,
                color: vibeColors.text,
              }}
            >
              {vibeList.find((item) => item.id === vibe)?.title ?? vibe}
            </span>
          )}
        </div>
      </div>

      <div className="-mt-2 flex flex-col gap-2 text-[12px] font-medium text-slate-700">
        <div>
          <span className="uppercase tracking-wide text-slate-500">我的最愛：</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {sports.length > 0 ? (
              sports.map((sport) => (
                <span
                  key={sport}
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: withAlpha(vibeColors.ring, 0.7),
                    color: vibeColors.text,
                  }}
                >
                  {sport}
                </span>
              ))
            ) : (
              <>
                <div className="h-[22px] w-16 animate-pulse rounded-full bg-slate-100/50" />
                <div className="h-[22px] w-20 animate-pulse rounded-full bg-slate-100/50" />
                <div className="h-[22px] w-14 animate-pulse rounded-full bg-slate-100/50" />
              </>
            )}
          </div>
        </div>
        <div>
          <span className="uppercase tracking-wide text-slate-500">想嘗試：</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {trying.length > 0 ? (
              trying.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: withAlpha(vibeColors.ring, 0.7),
                    color: vibeColors.text,
                  }}
                >
                  {item}
                </span>
              ))
            ) : (
              <>
                <div className="h-[22px] w-16 animate-pulse rounded-full bg-slate-100/50" />
                <div className="h-[22px] w-14 animate-pulse rounded-full bg-slate-100/50" />
              </>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 pt-1 text-[12px] text-slate-600">
          <span
            className="flex w-[3px] shrink-0 self-stretch rounded"
            style={{ background: vibeColors.ring }}
            aria-hidden="true"
          />
          {blurb?.trim() ? (
            <span className="whitespace-pre-wrap">{blurb}</span>
          ) : (
            <span className="not-italic text-slate-400">這位夥伴還沒寫一句話。</span>
          )}
        </div>
      </div>
    </article>
  )
}
