type StoryLine = 'player' | 'venue' | 'host'

interface InfoRowProps {
  icon: string
  label: string
  value: string
  subValue?: string
  storyLine?: StoryLine
}

const palette: Record<StoryLine, { border: string; bg: string; text: string }> = {
  player: { border: 'border-slate-200', bg: 'bg-white', text: 'text-slate-900' },
  venue: { border: 'border-slate-200', bg: 'bg-white', text: 'text-slate-900' },
  host: { border: 'border-slate-200', bg: 'bg-white', text: 'text-slate-900' },
}

export function InfoRow({ icon, label, value, subValue, storyLine = 'player' }: InfoRowProps) {
  const tone = palette[storyLine]

  return (
    <div className={`flex items-start gap-4 rounded-lg border ${tone.border} ${tone.bg} p-4 shadow-sm`}>
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
        <p className={`font-semibold ${tone.text}`}>{value}</p>
        {subValue && <p className="mt-1 text-xs text-gray-600">{subValue}</p>}
      </div>
    </div>
  )
}
