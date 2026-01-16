import clsx from 'clsx'
import type { ReactNode } from 'react'

type BottomSheetProps = {
  /**
   * Whether the sheet is visible.
   */
  open: boolean
  /**
   * Invoked when the user closes the sheet (overlay tap or close control).
   */
  onClose: () => void
  /**
   * Main sheet content.
   */
  children: ReactNode
  title?: string
  description?: string
  icon?: ReactNode
  footer?: ReactNode
  sheetClassName?: string
  contentClassName?: string
  backdropClassName?: string
  /**
   * Show the drag-handle on top of the sheet.
   */
  showHandle?: boolean
  maxWidthClassName?: string
  /**
   * If true, skips the default inner container (px/max-w wrapper).
   * Useful when a child layout wants full control of padding/width.
   */
  disableContainer?: boolean
}

export function BottomSheet({
  open,
  onClose,
  children,
  title,
  description,
  icon,
  footer,
  sheetClassName,
  contentClassName,
  backdropClassName,
  showHandle = true,
  maxWidthClassName = 'max-w-md',
  disableContainer = false,
}: BottomSheetProps) {
  if (!open) return null

  const labelledBy = title ? 'bottom-sheet-title' : undefined

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[200] flex flex-col justify-end bg-slate-950/40 backdrop-blur-sm',
        backdropClassName
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <button type="button" className="flex-1" onClick={onClose} aria-label="Close sheet overlay" />
      <div
        className={clsx(
          'relative w-full rounded-t-[32px] bg-white shadow-[0_-20px_45px_rgba(15,41,77,0.2)] animate-[sheetIn_0.25s_ease-out]',
          sheetClassName
        )}
      >
        {showHandle && (
          <div className="flex items-center justify-center pt-3">
            <span className="h-1.5 w-12 rounded-full bg-slate-200" />
          </div>
        )}
        {disableContainer ? (
          <div className={clsx('relative w-full', contentClassName)}>
            {children}
          </div>
        ) : (
          <div className={clsx('relative mx-auto w-full px-5 pb-6 pt-4', maxWidthClassName, contentClassName)}>
            {(icon || title || description) && (
              <div className="mb-4 text-center">
                {icon && <div className="mb-4 flex justify-center">{icon}</div>}
                {title && (
                  <h2 id={labelledBy} className="text-xl font-semibold text-slate-900">
                    {title}
                  </h2>
                )}
                {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
              </div>
            )}
            <div>{children}</div>
            {footer && <div className="mt-6">{footer}</div>}
          </div>
        )}
      </div>
      <style>
        {`@keyframes sheetIn { from { transform: translateY(100%); } to { transform: translateY(0); } }`}
      </style>
    </div>
  )
}
