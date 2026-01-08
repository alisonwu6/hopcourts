import clsx from 'clsx'
import type { ReactNode } from 'react'

type OverlayFadeProps = {
  show: boolean
  children?: ReactNode
  className?: string
}

/**
 * OverlayFade
 * Used to cover a list area during filter/pagination changes without hiding prior content.
 */
export function OverlayFade({ show, children, className }: OverlayFadeProps) {
  if (!show) return null
  return (
    <div
      className={clsx(
        'absolute inset-0 z-10 flex items-start justify-center bg-white/60 backdrop-blur-[1px]',
        className
      )}
    >
      {children}
    </div>
  )
}
