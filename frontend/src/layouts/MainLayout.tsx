import { ReactNode } from 'react'
import clsx from 'clsx'

type ContentWidth = 'sm' | 'md' | 'lg' | 'xl' | 'page' | 'full'

type Props = {
  children: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
  contentWidth?: ContentWidth
  backgroundClassName?: string
}

const widthClass: Record<ContentWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
  page: 'max-w-4xl',
  full: 'max-w-none',
}

export default function MainLayout({
  children,
  title,
  description,
  actions,
  contentWidth = 'page',
  backgroundClassName = 'bg-white',
}: Props) {
  return (
    <div className={clsx('flex min-h-screen flex-col text-slate-900', backgroundClassName)}>
      <div className="flex min-h-screen flex-col">
        <div
          className={clsx(
            'mx-auto flex w-full flex-col gap-6 px-4 sm:px-6',
            widthClass[contentWidth]
          )}
        >
          {(title || description || actions) && (
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                {title && (
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
                )}
                {description && <p className="text-sm text-slate-600">{description}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </header>
          )}
          <main className="space-y-6 pb-24">{children}</main>
        </div>
      </div>
    </div>
  )
}
