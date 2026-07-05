import { ComponentType, useState } from 'react'
import { Compass, PersonStanding, House, Building2, Plus } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuthStore } from '@/hooks'
import { LoginPromptSheet } from './LoginPromptSheet'
import { ProfileRequiredSheet } from '@/features/profile/components/ProfileRequiredSheet'

type NavItem = {
  label: string
  path: string
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>
  matchPaths?: string[]
  requiresAuth?: boolean
}

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const isRealUser = !!user && !(user as any).is_anonymous
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showProfileRequired, setShowProfileRequired] = useState(false)
  const matchesPath = (segment: string) => {
    if (segment === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(segment)
  }

  const leftItems: NavItem[] = [
    {
      label: 'Home',
      icon: House,
      path: '/',
      matchPaths: ['/'],
    },
    {
      label: 'Events',
      icon: Compass,
      path: '/events',
      matchPaths: ['/events', '/event'],
    },
  ]

  const rightItems: NavItem[] = [
    {
      label: 'Venues',
      icon: Building2,
      path: '/venues',
      matchPaths: ['/venues', '/venue'],
    },
    {
      label: 'Profile',
      icon: PersonStanding,
      path: '/profile',
      matchPaths: ['/profile', '/settings'],
    },
  ]

  const renderNavItem = ({ label, icon: Icon, path, matchPaths }: NavItem) => {
    const isActive = matchPaths ? matchPaths.some(matchesPath) : matchesPath(path)
    return (
      <button
        key={label}
        onClick={() => navigate(path)}
        className={clsx(
          'flex flex-col items-center gap-1 rounded-md px-2 text-[10px] font-bold transition-colors',
          isActive ? 'text-ocean' : 'text-slate-300'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        {Icon && <Icon className={clsx('h-6 w-6', isActive ? 'text-ocean' : 'text-slate-300')} strokeWidth={2} />}
        <span className="text-[11px] sm:text-xs">{label}</span>
      </button>
    )
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 mx-auto w-full max-w-md border-t border-slate-200 bg-white backdrop-blur will-change-transform"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex items-center justify-center gap-6 px-4 py-2">
        {leftItems.map(renderNavItem)}

        <button
          onClick={() => {
            if (!isRealUser) {
              try {
                sessionStorage.setItem('create_event_back_to', location.pathname)
              } catch {}
              setShowLoginPrompt(true)
            } else if (!user?.onboarding_completed_at) {
              setShowProfileRequired(true)
            } else {
              navigate('/create-event', { state: { backTo: location.pathname } })
            }
          }}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-ocean animate-dribble active:scale-95"
          aria-label="Create event"
        >
          <Plus className="h-6 w-6 text-white" strokeWidth={2} />
        </button>

        {rightItems.map(renderNavItem)}
      </div>
      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        returnTo="/create-event"
      />
      <ProfileRequiredSheet
        open={showProfileRequired}
        onClose={() => setShowProfileRequired(false)}
        dismissible
      />
    </nav>
  )
}
