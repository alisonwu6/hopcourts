import type { ReactNode } from 'react'

export function FieldSection({
  title,
  description,
  children,
  titleClassName = 'text-md font-semibold uppercase tracking-wide text-slate-600',
}: {
  title: string
  description?: string
  children: ReactNode
  titleClassName?: string
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1">
        <p className={titleClassName}>{title}</p>
        {description && <p className="text-xs text-slate-400">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
