import { AlertCircle, Check, Info, AlertTriangle } from 'lucide-react'
import { Button } from './Button'
import clsx from 'clsx'

export interface AlertDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: React.ReactNode
  type?: 'success' | 'error' | 'info' | 'warning'
  actionLabel?: string
  onAction?: () => void
}

export function AlertDialog({
  open,
  onClose,
  title,
  description,
  type = 'info',
  actionLabel = '確定',
  onAction,
}: AlertDialogProps) {
  if (!open) return null

  const handleAction = () => {
    onAction?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Dialog Content */}
      <div className="relative w-full max-w-xs scale-100 transform overflow-hidden rounded-[28px] bg-white p-6 text-center shadow-2xl transition-all animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center">
          {/* Icon */}
          <div className={clsx(
            "mb-4 flex h-14 w-14 items-center justify-center rounded-full",
            type === 'error' && "bg-red-50 text-red-500",
            type === 'success' && "bg-emerald-50 text-emerald-500",
            type === 'info' && "bg-blue-50 text-blue-500",
            type === 'warning' && "bg-amber-50 text-amber-500"
          )}>
            {type === 'error' && <AlertCircle size={32} strokeWidth={2.5} />}
            {type === 'success' && <Check size={32} strokeWidth={2.5} />}
            {type === 'info' && <Info size={32} strokeWidth={2.5} />}
            {type === 'warning' && <AlertTriangle size={32} strokeWidth={2.5} />}
          </div>

          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          
          {description && (
            <div className="mt-2 text-sm leading-relaxed text-slate-500">
              {description}
            </div>
          )}

          <div className="mt-6 w-full space-y-3">
            <Button
              onClick={handleAction}
              className={clsx(
                "w-full rounded-2xl py-3 text-base font-bold shadow-sm transition-transform active:scale-[0.98]",
                type === 'error' ? "bg-red-500 hover:bg-red-600 text-white" :
                type === 'success' ? "bg-emerald-500 hover:bg-emerald-600 text-white" :
                type === 'warning' ? "bg-amber-500 hover:bg-amber-600 text-white" :
                "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              {actionLabel}
            </Button>
            
            {/* Optional Cancel for non-critical confirmations? For now, just OK */}
          </div>
        </div>
      </div>
    </div>
  )
}
