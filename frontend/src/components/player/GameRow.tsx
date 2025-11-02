type StoryLine = 'player' | 'venue' | 'host'

interface GameRowProps {
  title: string
  sport: string
  startTime: Date
  attendeeCount: number
  locationName: string
  hostName: string
  onClick: () => void
  storyLine?: StoryLine
}

const sportIcons: Record<string, string> = {
  running: '🏃',
  basketball: '🏀',
  climbing: '🧗',
  tennis: '🎾',
  hiking: '🥾',
}

function resolveSportIcon(sport: string) {
  const key = sport.toLowerCase()
  return sportIcons[key] ?? '⚽'
}

const palette: Record<
  StoryLine,
  { border: string; bg: string; accent: string; chip: string; chipText: string }
> = {
  player: {
    border: 'border-slate-200',
    bg: 'bg-white',
    accent: 'bg-blue-600',
    chip: 'bg-blue-50',
    chipText: 'text-slate-900',
  },
  venue: {
    border: 'border-slate-200',
    bg: 'bg-white',
    accent: 'bg-blue-600',
    chip: 'bg-blue-50',
    chipText: 'text-slate-900',
  },
  host: {
    border: 'border-slate-200',
    bg: 'bg-white',
    accent: 'bg-blue-600',
    chip: 'bg-blue-50',
    chipText: 'text-slate-900',
  },
}

export function GameRow({
  title,
  sport,
  startTime,
  attendeeCount,
  locationName,
  hostName,
  onClick,
  storyLine = 'player',
}: GameRowProps) {
  const tone = palette[storyLine]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border ${tone.border} ${tone.bg} p-3 text-left shadow-sm transition hover:shadow-md`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${tone.accent} text-sm font-bold text-white`}>
          {resolveSportIcon(sport)}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate font-semibold ${tone.chipText}`}>{title}</p>
          <p className="mt-1 text-xs text-gray-600">
            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {attendeeCount} players joined
          </p>
          <p className="mt-1 text-xs text-gray-600">📍 {locationName}</p>
        </div>
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${tone.chip} text-xs font-bold ${tone.chipText}`}>
          {hostName.charAt(0)}
        </div>
      </div>
    </button>
  )
}
