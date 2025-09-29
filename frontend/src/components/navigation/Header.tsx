import { Link } from 'react-router-dom'
import { Bell, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import logoUrl from '@/assets/sportsmatch.png'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/home"
          className="flex items-center gap-2"
        >
          <img
            className="h-10 w-auto"
            src={logoUrl}
            alt="SportsMatch logo"
            onError={(event) => {
              const target = event.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
          <div className="hidden sm:block">
            <div className="text-sm font-semibold uppercase tracking-tight text-slate-900">
              SportsMatch
            </div>
            <div className="text-xs text-slate-500">
              Brisbane · Find your next run
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/map">
            <Button
              variant="ghost"
              size="sm"
              className="hidden gap-1 sm:inline-flex"
            >
              <MapPin className="h-4 w-4" /> Map view
            </Button>
          </Link>
          <Link to="/create">
            <Button
              size="sm"
              className="gap-1"
            >
              <Plus className="h-4 w-4" /> New session
            </Button>
          </Link>
          <Link to="/notifications"
            className="relative"
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </Link>
          <Link to="/me">
            <Avatar className="h-9 w-9">
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  )
}
