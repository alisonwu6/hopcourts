import { ComponentType } from 'react'
import { Compass, Users, User, Search } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

const NAV_ITEMS = [
  {
    label: 'Explore',
    icon: Compass,
    path: '/',
    matchPaths: ['/', '/explore', '/games', '/map'],
  },
  {
    label: 'Search athletes',
    icon: Search,
    path: '/athletes',
  },
  {
    label: 'Squad',
    icon: Users,
    path: '/squad',
  },
  {
    label: 'Me',
    icon: User,
    path: '/me',
  },
] satisfies NavItem[]

type NavItem = {
  label: string
  icon: ComponentType<{ className?: string }>
  path: string
  matchPaths?: string[]
}

export function BottomNavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const matchesPath = (segment: string) => {
    if (segment === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(segment)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.25rem)' }}
    >
      <div className="mx-auto flex max-w-xl items-center justify-between px-6 py-2">
        {NAV_ITEMS.map(({ label, icon: Icon, path, matchPaths }) => {
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
              <Icon className={clsx('h-6 w-6', isActive ? 'text-blue-600' : 'text-slate-400')} />
              <span className="sr-only sm:not-sr-only sm:text-xs">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
