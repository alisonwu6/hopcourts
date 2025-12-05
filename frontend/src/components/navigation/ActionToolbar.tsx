import clsx from 'clsx'
import { type ReactNode } from 'react'
import { ArrowLeft, Heart, Share2 } from 'lucide-react'

type ActionToolbarProps = {
  onBack?: () => void
  onShare?: () => void
  onToggleFavorite?: () => void
  isFavorite?: boolean
  showShare?: boolean
  showFavorite?: boolean
  title?: ReactNode
  className?: string
  contentClassName?: string
  showBack?: boolean
  leftContent?: ReactNode
  rightContent?: ReactNode
  borderBottom?: boolean
}

export function ActionToolbar({
  onBack,
  onShare,
  onToggleFavorite,
  isFavorite = false,
  showShare = false,
  showFavorite = false,
  title,
  className,
  contentClassName,
  showBack = true,
  leftContent,
  rightContent,
  borderBottom = false,
}: ActionToolbarProps) {
  return (
    <div
      className={clsx(
        'sticky top-0 z-30 bg-white/95 backdrop-blur',
        borderBottom && 'border-b border-slate-200/80',
        className
      )}
    >
      <div
        className={clsx(
          'mx-auto flex h-14 w-full items-center justify-between px-3',
          contentClassName
        )}
      >
        {leftContent ? (
          <div className="flex min-w-0 items-center gap-2">{leftContent}</div>
        ) : showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center text-slate-600 transition hover:text-slate-900"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </button>
        ) : (
          <span className="h-10 w-10" aria-hidden="true" />
        )}

        <div className="flex min-w-0 flex-1 items-center justify-center px-2">
          {title && <div className="truncate text-sm font-semibold text-slate-800">{title}</div>}
        </div>

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
          {rightContent ? (
            rightContent
          ) : (
            <span className="h-10 w-10" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  )
}
