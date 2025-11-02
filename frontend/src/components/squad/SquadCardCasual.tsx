import type { SquadCasualSummary } from '@/interfaces/squad'
import fallbackHero from '@/assets/placeholders/game-fallback.svg'

interface Props {
  squad: SquadCasualSummary
}

export function SquadCardCasual({ squad }: Props) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#E6E6E6] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
      <div className="relative h-28 w-full overflow-hidden">
        <img
          src={squad.heroImageUrl ?? fallbackHero}
          alt={`${squad.name} background`}
          className="h-full w-full object-cover"
          onError={(event) => {
            const target = event.currentTarget
            if (target.src !== fallbackHero) {
              target.src = fallbackHero
            }
          }}
        />
      </div>
      <div className="space-y-1 px-4 py-3">
        <div className="text-sm font-semibold text-[#051333]">{squad.name}</div>
        <div className="text-xs text-[#6E6E6E]">{squad.statusLabel}</div>
      </div>
    </article>
  )
}
