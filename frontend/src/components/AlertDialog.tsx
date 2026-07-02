import { AlertCircle, Check, Info, AlertTriangle, Rocket } from 'lucide-react'
import clsx from 'clsx'

export interface AlertDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: React.ReactNode
  type?: 'success' | 'error' | 'info' | 'warning' | 'feature'
  actionLabel?: string
  onAction?: () => void
  cancelLabel?: string
  onCancel?: () => void
  actionLeft?: boolean
}

export function AlertDialog({
  open,
  onClose,
  title,
  description,
  type = 'info',
  actionLabel = 'OK',
  onAction,
  cancelLabel,
  onCancel,
  actionLeft = false,
}: AlertDialogProps) {
  if (!open) return null

  const hasCancel = Boolean(cancelLabel)

  const handleAction = () => {
    onAction?.()
    onClose()
  }

  const handleCancel = () => {
    onCancel?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 duration-200 animate-in fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog Content */}
      <div className="relative w-full max-w-xs scale-100 transform overflow-hidden rounded-[28px] bg-white p-6 text-center shadow-2xl transition-all duration-200 animate-in zoom-in-95">
        <div className="flex flex-col items-center">
          {/* Icon */}
          <div
            className={clsx(
              'mb-4 flex h-14 w-14 items-center justify-center rounded-full',
              type === 'error' && 'bg-red-100 text-red-500',
              type === 'success' && 'bg-emerald-100 text-emerald-500',
              type === 'info' && 'bg-blue-100 text-blue-500',
              type === 'warning' && 'bg-amber-100 text-amber-500',
              type === 'feature' && 'bg-hop-100 text-hop'
            )}
          >
            {type === 'error' && (
              <AlertCircle
                size={32}
                strokeWidth={2.5}
              />
            )}
            {type === 'success' && (
              <Check
                size={32}
                strokeWidth={2.5}
              />
            )}
            {type === 'info' && (
              <Info
                size={32}
                strokeWidth={2.5}
              />
            )}
            {type === 'warning' && (
              <AlertTriangle
                size={32}
                strokeWidth={2.5}
              />
            )}
            {type === 'feature' && (
              <Rocket
                size={32}
                strokeWidth={2.5}
              />
            )}
          </div>

          <h3 className="text-xl font-bold text-slate-900">{title}</h3>

          {description && <div className="mt-2 text-sm leading-relaxed text-slate-500">{description}</div>}

          <div className={clsx('mt-6 w-full', hasCancel ? 'grid grid-cols-2 gap-3' : 'space-y-3')}>
            {hasCancel && actionLeft && (
              <button
                type="button"
                onClick={handleAction}
                className={clsx(
                  'w-full rounded-[20px] border border-transparent py-3 text-base font-bold shadow-sm transition-transform active:scale-[0.98]',
                  type === 'error'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : type === 'success'
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : type === 'warning'
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : type === 'feature'
                          ? 'bg-hop-600 text-white hover:bg-hop-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                {actionLabel}
              </button>
            )}

            {hasCancel && (
              <button
                type="button"
                onClick={handleCancel}
                className="w-full rounded-[20px] border border-slate-200 bg-white py-3 text-base font-bold text-slate-700 shadow-sm transition-transform hover:bg-slate-50 active:scale-[0.98]"
              >
                {cancelLabel}
              </button>
            )}

            {(!hasCancel || !actionLeft) && (
              <button
                type="button"
                onClick={handleAction}
                className={clsx(
                  'w-full rounded-[20px] border border-transparent py-3 text-base font-bold shadow-sm transition-transform active:scale-[0.98]',
                  type === 'error'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : type === 'success'
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : type === 'warning'
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : type === 'feature'
                          ? 'bg-hop-600 text-white hover:bg-hop-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                {actionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
