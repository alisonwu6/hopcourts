import type { ReactNode } from 'react'

type Props = {
  icon: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyStateCard({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
      <div className="p-2">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {description && <p className="mt-1 px-10 text-sm text-slate-500">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
