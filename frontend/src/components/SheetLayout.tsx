import { ReactNode } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

type HeightVariant = 'short' | 'medium' | 'tall'

const heightClass: Record<HeightVariant, string> = {
  short: 'max-h-[45vh]',
  medium: 'max-h-[70vh]',
  tall: 'max-h-[90vh]',
}

type ButtonConfig = {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'ghost' | 'dark'
}

type SheetLayoutProps = {
  onClose?: () => void
  title?: string
  subtitle?: string
  hint?: string
  children: ReactNode
  height?: HeightVariant
  primaryButton?: ButtonConfig
  secondaryButton?: ButtonConfig
  headerRight?: ReactNode
  showHandle?: boolean
  showCloseButton?: boolean
  className?: string
  contentClassName?: string
}

export function SheetLayout({
  onClose,
  title,
  subtitle,
  hint,
  children,
  height = 'medium',
  primaryButton,
  secondaryButton,
  headerRight,
  showHandle = false,
  showCloseButton = true,
  className,
  contentClassName,
}: SheetLayoutProps) {
  const renderButton = (btn: ButtonConfig, fullWidth?: boolean) => {
    const base =
      'h-12 rounded-2xl px-4 text-base font-semibold shadow-sm transition'
    const styles =
      btn.variant === 'ghost'
        ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
        : btn.variant === 'dark'
          ? 'bg-slate-900 text-white hover:bg-slate-800'
          : 'bg-blue-600 text-white hover:bg-blue-500'
    return (
      <button
        type="button"
        onClick={btn.onClick}
        disabled={btn.disabled}
        className={clsx(base, styles, { 'w-full': fullWidth })}
      >
        {btn.label}
      </button>
    )
  }

  return (
    <div
      className={clsx(
        'flex w-full max-w-xl flex-col overflow-hidden rounded-t-[32px] bg-white text-slate-900 shadow-xl',
        heightClass[height],
        className
      )}
    >
      <div className="relative flex items-center justify-between border-b border-slate-200 px-5 pb-4 pt-5">
        <div className="space-y-1">
          {title && <p className="text-xl font-bold text-slate-900">{title}</p>}
          {subtitle && (
            <p className="text-xs font-semibold text-slate-500">{subtitle}</p>
          )}
          {hint && <p className="text-xs font-medium text-slate-500">{hint}</p>}
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
          {showCloseButton && onClose && (
            <button
              type="button"
              aria-label="Close sheet"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {showHandle && (
          <div
            className="absolute left-1/2 top-1.5 h-1.5 w-12 -translate-x-1/2 rounded-full bg-slate-200"
            aria-hidden
          />
        )}
      </div>

      <div
        className={clsx('flex-1 overflow-y-auto px-5 py-4', contentClassName)}
      >
        {children}
      </div>

      {(primaryButton || secondaryButton) && (
        <div className="sticky bottom-0 left-0 right-0 z-10 border-t border-slate-200 bg-white px-5 pb-5 pt-3">
          {primaryButton && secondaryButton ? (
            <div className="grid grid-cols-2 gap-3">
              {renderButton(secondaryButton)}
              {renderButton(primaryButton)}
            </div>
          ) : (
            renderButton(primaryButton || secondaryButton!, true)
          )}
        </div>
      )}
    </div>
  )
}
