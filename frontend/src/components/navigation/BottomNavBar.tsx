// src/components/navigation/BottomNavBar.tsx
import { Home, Users, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

const navItems = [
  { label: 'Explore', icon: Home, path: '/home' },
  { label: 'Squad', icon: Users, path: '/squad' },
  { label: 'Me', icon: User, path: '/me' },
]

export function BottomNavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm flex justify-around py-2 z-50">
      {navItems.map(({ label, icon: Icon, path }) => (
        <button
          key={label}
          onClick={() => navigate(path)}
          className="flex flex-col items-center text-xs"
        >
          <Icon
            className={clsx(
              'w-5 h-5 mb-1',
              location.pathname === path ? 'text-blue-600' : 'text-gray-500'
            )}
          />
          <span
            className={clsx(
              location.pathname === path ? 'text-blue-600' : 'text-gray-500'
            )}
          >
            {label}
          </span>
        </button>
      ))}
    </nav>
  )
}
