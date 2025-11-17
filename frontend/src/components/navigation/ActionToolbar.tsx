import clsx from 'clsx'
import { ArrowLeft, Heart, Share2 } from 'lucide-react'

type ActionToolbarProps = {
  onBack: () => void
  onShare?: () => void
  onToggleFavorite?: () => void
  isFavorite?: boolean
  showShare?: boolean
  showFavorite?: boolean
  backLabel?: string
  className?: string
  contentClassName?: string
}

export function ActionToolbar({
  onBack,
  onShare,
  onToggleFavorite,
  isFavorite = false,
  showShare = false,
  showFavorite = false,
  backLabel,
  className,
  contentClassName,
}: ActionToolbarProps) {
  return (
    <div className={clsx('sticky top-0 z-30 bg-white/95 backdrop-blur', className)}>
      <div className={clsx('mx-auto flex w-full items-center justify-between py-4', contentClassName)}>
        <button
          type="button"
          onClick={onBack}
          className={clsx(
            'text-sm font-semibold text-slate-600 transition hover:text-slate-900',
            backLabel ? 'px-2 py-1' : 'p-2'
          )}
          aria-label={backLabel ?? 'Go back'}
        >
          {backLabel ? backLabel : <ArrowLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />}
        </button>
        <div className="flex items-center gap-3">
          {showShare && onShare && (
            <button
              type="button"
              onClick={onShare}
              className="p-2 text-blue-600 transition hover:text-blue-700"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </button>
          )}
          {showFavorite && onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              className="p-2 text-[#1E6DEB] transition hover:text-blue-700"
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Saved' : 'Save for later'}
            >
              <Heart className={clsx('h-5 w-5', isFavorite && 'fill-current')} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
