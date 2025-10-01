import { Link } from 'react-router-dom'
import { Bell, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import logoUrl from '@/assets/sportsmatch.png'
import { useCopy } from '@/i18n/LanguageProvider'

export default function Header() {
  const copy = useCopy()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          to="/home"
          className="flex items-center gap-2"
        >
          <img
            className="h-10 w-auto flex-shrink-0"
            src={logoUrl}
            alt={copy.common.appName}
            onError={(event) => {
              const target = event.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
          <div className="hidden sm:block">
            <div className="text-sm font-semibold uppercase tracking-tight text-slate-900">
              {copy.common.appName}
            </div>
            <div className="text-xs text-slate-500">{copy.common.tagline}</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/map">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label={copy.header.mapView}
            >
              <MapPin className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/create">
            <Button
              size="icon"
              className="rounded-full"
              aria-label={copy.header.newSession}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
          <Link
            to="/notifications"
            className="relative"
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label={copy.header.notifications}
            >
              <Bell className="h-5 w-5" />
            </Button>
            <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </Link>
        </div>
      </div>
    </header>
  )
}
