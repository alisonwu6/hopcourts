interface Props {
  energy: number
  label?: string
}

const gradientStyle = {
  background: 'linear-gradient(90deg, #1B8FD2 0%, #FF8A4C 100%)',
}

export function SquadEnergyBar({ energy, label = 'Squad energy' }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(energy)))

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold text-[#051333]">
        <span>{label}</span>
        <span>{clamped}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[#E6E6E6]">
        <div
          className="h-full rounded-full"
          style={{ ...gradientStyle, width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
