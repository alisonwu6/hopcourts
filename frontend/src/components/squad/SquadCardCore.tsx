import type { SquadCoreSummary } from '@/interfaces/squad'
import fallbackHero from '@/assets/placeholders/session-fallback.svg'

interface Props {
  squad: SquadCoreSummary
}

export function SquadCardCore({ squad }: Props) {
  const previewMembers = squad.members.slice(0, 4)
  const remaining = squad.members.length - previewMembers.length

  return (
    <article className="overflow-hidden rounded-3xl border border-[#E6E6E6] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <div className="relative h-40 w-full overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        <div className="absolute left-5 top-5 flex flex-col gap-1 text-white">
          <span className="text-xs uppercase tracking-wide text-white/70">Core squad</span>
          <h3 className="text-xl font-semibold leading-tight">{squad.name}</h3>
          <span className="text-sm text-white/80">{squad.city} · {squad.memberCount} members</span>
        </div>
        <div className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-[#1B8FD2] shadow">
          ⚡ {squad.energy} Energy
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        <p className="text-sm text-[#6E6E6E]">{squad.toneLine}</p>
        <div className="flex items-center gap-2">
          {previewMembers.map((member) => (
            <img
              key={member.id}
              src={member.avatarUrl}
              alt={member.name}
              className="h-9 w-9 rounded-full border border-white shadow-sm"
              onError={(event) => {
                (event.currentTarget as HTMLImageElement).style.visibility = 'hidden'
              }}
            />
          ))}
          {remaining > 0 && (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-[#1B8FD2] text-xs font-semibold text-[#1B8FD2]">+{remaining}</span>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            className="w-full rounded-full bg-[#1B8FD2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1679b3]"
            onClick={() => console.log('invite', squad.id)}
          >
            Invite
          </button>
          <button
            type="button"
            className="w-full rounded-full border border-[#1B8FD2] px-4 py-2 text-sm font-semibold text-[#1B8FD2] transition hover:bg-[#E8F2FF]"
            onClick={() => console.log('chat', squad.id)}
          >
            Chat
          </button>
        </div>
      </div>
    </article>
  )
}
