interface SportCardProps {
  icon: string
  name: string
  selected: boolean
  onSelect: () => void
}

export function SportCard({ icon, name, selected, onSelect }: SportCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-lg border-2 p-4 text-center transition ${
        selected ? 'border-player-600 bg-player-50' : 'border-player-200 bg-white hover:border-player-300'
      }`}
    >
      <div className="mb-2 text-3xl">{icon}</div>
      <div className="text-sm font-semibold text-player-900">{name}</div>
    </button>
  )
}
