interface SportCardProps {
  icon: string
  name: string
  selected: boolean
  onToggle: () => void
}

export function SportCard({ icon, name, selected, onToggle }: SportCardProps) {
  return (
    <label
      className={`relative flex cursor-pointer flex-col rounded-2xl border-2 p-6 text-left transition focus:outline-none focus:ring-2 focus:ring-player-300 ${
        selected
          ? 'border-player-600 bg-player-50 shadow-sm'
          : 'border-player-200 bg-white hover:border-player-300'
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
      {selected && (
        <span className="absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-player-600 text-xs font-semibold text-white">
          ✓
        </span>
      )}
    </label>
  )
}
