import { ReactNode } from 'react'
import Header from '@/components/navigation/Header'
import { BottomNavBar } from '@/components/navigation/BottomNavBar'
import clsx from 'clsx'

type ContentWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full'

type Props = {
  children: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
  showHeader?: boolean
  showBottomNav?: boolean
  contentWidth?: ContentWidth
}

const widthClass: Record<ContentWidth, string> = {
  sm: 'max-w-md',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  full: 'max-w-none',
}

export default function MainLayout({
  children,
  title,
  description,
  actions,
  showHeader = true,
  showBottomNav = true,
  contentWidth = 'lg',
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {showHeader && <Header />}
      <div className="flex min-h-screen flex-col">
        <div
          className={clsx(
            'flex-1 pb-24',
            showHeader ? 'pt-4' : 'pt-10'
          )}
        >
          <div
            className={clsx(
              'mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6',
              widthClass[contentWidth]
            )}
          >
            {(title || description || actions) && (
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  {title && (
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-sm text-slate-600">{description}</p>
                  )}
                </div>
                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
              </div>
            )}
            <div className="space-y-6">{children}</div>
          </div>
        </div>
        {showBottomNav && <BottomNavBar />}
      </div>
    </div>
  )
}
