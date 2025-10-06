import type { SquadCoreSummary } from '@/interfaces/squad'
import fallbackHero from '@/assets/placeholders/session-fallback.svg'
import { SquadEnergyBar } from './SquadEnergyBar'

interface Props {
  squad: SquadCoreSummary
}

export function SquadHeader({ squad }: Props) {
  const previewMembers = squad.members.slice(0, 5)
  const remaining = squad.members.length - previewMembers.length

  return (
    <section className="bg-[#F8FAFC]">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium uppercase tracking-wide text-[#6E6E6E]">Living squad</div>
              <div className="text-2xl font-semibold text-[#051333]">{squad.name}</div>
              <div className="text-sm text-[#6E6E6E]">
                {squad.city} · {squad.memberCount} Members · {squad.sessionCount} Sessions
              </div>
              <p className="text-sm text-[#1B8FD2]">“{squad.toneLine}”</p>
            </div>
            <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-[#E6E6E6] sm:w-60">
              <img
                src={squad.heroImageUrl ?? fallbackHero}
                onError={(event) => {
                  const target = event.currentTarget
                  if (target.src !== fallbackHero) {
                    target.src = fallbackHero
                  }
                }}
                alt={`${squad.name} hero`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-4">
            <SquadEnergyBar energy={squad.energy} />

            <div className="flex flex-wrap items-center gap-2 text-sm text-[#6E6E6E]">
              <span className="font-semibold text-[#051333]">Core squad</span>
              <div className="flex items-center gap-2">
                {previewMembers.map((member) => (
                  <img
                    key={member.id}
                    src={member.avatarUrl}
                    alt={member.name}
                    className="h-8 w-8 rounded-full border border-white shadow-sm"
                    onError={(event) => {
                      const target = event.currentTarget as HTMLImageElement
                      target.style.visibility = 'hidden'
                    }}
                  />
                ))}
                {remaining > 0 && (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-[#1B8FD2] text-xs font-semibold text-[#1B8FD2]">
                    +{remaining}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
