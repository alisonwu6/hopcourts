import clsx from 'clsx'

type Props = {
  message?: string
  className?: string
  fullScreen?: boolean
  overlay?: boolean
}

export function PageLoading({ message = 'Loading...', className, fullScreen = true, overlay = false }: Props) {
  return (
    <div
      className={clsx(
        'flex items-center justify-center',
        fullScreen && 'fixed inset-0 z-50 bg-white/80 backdrop-blur-sm',
        overlay && 'absolute inset-0 z-10 rounded-lg bg-white/60',
        !fullScreen && !overlay && 'h-full w-full py-12',
        className
      )}
    >
      <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-[0_10px_40px_rgba(15,41,77,0.12)] ring-1 ring-slate-100">
        <span className="relative inline-block h-4 w-4">
          <span className="absolute inset-0 animate-ping rounded-full bg-ocean-400 opacity-70" />
          <span className="relative inline-block h-4 w-4 rounded-full bg-ocean" />
        </span>
        <span className="text-sm font-semibold text-slate-700">🏃🏻‍➡️ {message}</span>
      </div>
    </div>
  )
}
