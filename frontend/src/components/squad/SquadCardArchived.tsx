import type { SquadArchivedSummary } from '@/interfaces/squad'

interface Props {
  squad: SquadArchivedSummary
}

export function SquadCardArchived({ squad }: Props) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#E6E6E6] bg-white px-4 py-3 shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
      <div>
        <div className="text-sm font-semibold text-[#051333]">{squad.name}</div>
        <div className="text-xs text-[#6E6E6E]">{squad.season}</div>
      </div>
      {squad.linkLabel && (
        <button
          type="button"
          onClick={() => console.log('viewRecap', squad.id)}
          className="text-sm font-semibold text-[#1B8FD2] transition hover:text-[#1679b3]"
        >
          {squad.linkLabel}
        </button>
      )}
    </div>
  )
}
