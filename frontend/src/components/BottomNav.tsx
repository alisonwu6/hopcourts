import { ComponentType } from 'react'
import { Compass, DoorClosed, PersonStanding, Users } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuthStore } from '@/hooks'

type NavItem = {
  label: string
  path: string
  icon?: ComponentType<{ className?: string }>
  matchPaths?: string[]
}

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const matchesPath = (segment: string) => {
    if (segment === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(segment)
  }

  const navItems: NavItem[] = [
    {
      label: 'Mates',
      icon: Users,
      path: '/mates',
      matchPaths: ['/', '/mates'],
    },
    {
      label: 'Events',
      icon: Compass,
      path: '/events',
      matchPaths: ['/events', '/event', '/my-events', '/create-event'],
    },
    isAuthenticated
      ? {
          label: 'Me',
          icon: PersonStanding,
          path: '/profile',
          matchPaths: ['/profile', '/settings'],
        }
      : {
          label: 'Log in',
          icon: DoorClosed,
          path: '/login',
          matchPaths: ['/login', '/signup'],
        },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex items-center justify-center gap-10 px-4 py-2">
        {navItems.map(({ label, icon: Icon, path, matchPaths }) => {
          const isActive = matchPaths
            ? matchPaths.some(matchesPath)
            : matchesPath(path)

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
