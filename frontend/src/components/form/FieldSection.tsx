import type { ReactNode } from 'react'

export function FieldSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1">
        <p className="text-md font-semibold uppercase tracking-wide text-slate-600">{title}</p>
        {description && <p className="text-xs text-slate-400">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
