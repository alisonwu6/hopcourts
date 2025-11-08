interface SportCardProps {
  icon: string
  name: string
  selected: boolean
  onToggle: () => void
}

export function SportCard({ icon, name, selected, onToggle }: SportCardProps) {
  return (
    <label
      className={`relative flex cursor-pointer flex-col rounded-2xl border bg-white p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-player-300 ${
        selected
          ? 'border-player-200 bg-player-50 shadow-[0_8px_24px_rgba(16,32,96,0.12)]'
          : 'border-player-200 hover:border-player-300'
      }`}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={selected}
        onChange={onToggle}
      />
      <div className="mb-3 text-3xl">{icon}</div>
      <div className="text-base font-semibold text-player-900">{name}</div>
      <span
        aria-hidden="true"
        className={`absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-semibold transition ${
          selected
            ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.45)]'
            : 'border-emerald-400 bg-white text-transparent'
        }`}
      >
        ✓
      </span>
    </label>
  )
}
