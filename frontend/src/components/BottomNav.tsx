import { ComponentType } from 'react'
import { Building2, Compass, User, Users } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

type NavItem = {
  label: string
  path: string
  icon?: ComponentType<{ className?: string }>
  matchPaths?: string[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    icon: Compass,
    path: '/home',
    matchPaths: ['/home', '/session', '/my-sessions'],
  },
  {
    label: 'Venues',
    icon: Building2,
    path: '/venues',
    matchPaths: ['/venues', '/venue'],
  },
  {
    label: 'Hosts',
    icon: Users,
    path: '/hosts',
  },
  {
    label: 'Me',
    icon: User,
    path: '/profile',
  },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.25rem)' }}
    >
      <div className="mx-auto flex max-w-xl items-center justify-between px-6 py-2">
        {NAV_ITEMS.map(({ label, icon: Icon, path, matchPaths }) => {
          const isActive = matchPaths
            ? matchPaths.some((segment) => location.pathname.startsWith(segment))
            : location.pathname.startsWith(path)

          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={clsx(
                'flex flex-col items-center gap-1 rounded-md px-2 text-[10px] font-medium transition-colors',
                isActive ? 'text-blue-600' : 'text-slate-500'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {Icon && (
                <Icon className={clsx('h-6 w-6', isActive ? 'text-blue-600' : 'text-slate-400')} />
              )}
              <span className="text-[11px] sm:text-xs">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
