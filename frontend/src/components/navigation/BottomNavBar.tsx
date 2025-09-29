import { ComponentType } from 'react'
import { Home, Users, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

type NavItem = {
  label: string
  icon: ComponentType<{ className?: string }>
  path: string
  matchPaths?: string[]
}

const navItems: NavItem[] = [
  { label: 'Explore', icon: Home, path: '/home', matchPaths: ['/home', '/sessions', '/map'] },
  { label: 'Squad', icon: Users, path: '/squad' },
  { label: 'Me', icon: User, path: '/me' },
]

export function BottomNavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/90 backdrop-blur shadow-sm"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.25rem)' }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-around px-6 py-2">
        {navItems.map(({ label, icon: Icon, path, matchPaths }) => {
          const isActive = matchPaths
            ? matchPaths.some((segment) => location.pathname.startsWith(segment))
            : location.pathname.startsWith(path)

          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={clsx(
                'flex flex-col items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors',
                isActive ? 'text-blue-600' : 'text-slate-500'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={clsx('h-5 w-5', isActive ? 'text-blue-600' : 'text-slate-400')} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
