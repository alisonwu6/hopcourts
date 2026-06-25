import { RefreshCw } from 'lucide-react'

interface Props {
  onUpdate: () => void
}

export function AppUpdateBanner({ onUpdate }: Props) {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between gap-3 bg-slate-900 px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2 text-white">
        <RefreshCw className="h-4 w-4 shrink-0" />
        <p className="text-sm font-medium">New version available</p>
      </div>
      <button
        onClick={onUpdate}
        className="shrink-0 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-900 transition active:bg-slate-100"
      >
        Update now
      </button>
    </div>
  )
}
