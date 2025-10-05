import { Link } from 'react-router-dom'
import { Bell, MapPin, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import logoUrl from '@/assets/sportsmatch.png'
import { useCopy } from '@/i18n/LanguageProvider'

type Props = {
  sticky?: boolean
  showBorder?: boolean
  className?: string
}

export default function Header({ sticky = true, showBorder = true, className }: Props) {
  const copy = useCopy()
  const [messagesActive, setMessagesActive] = useState(false)
  const [notificationsActive, setNotificationsActive] = useState(false)

  const headerClass = clsx(
    sticky && 'sticky top-0',
    showBorder ? 'border-b border-slate-200' : '',
    'z-50 bg-white/90 backdrop-blur',
    className
  )

  return (
    <header className={headerClass}>
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
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
          <div className="inline-flex items-center gap-1 rounded-full border border-transparent bg-white px-3 py-1.5 text-sm font-medium text-[#051333] shadow-sm">
            <MapPin className="h-4 w-4" />
            Brisbane
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMessagesActive((prev) => !prev)}
            className={clsx(
              'inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white text-[#6E6E6E] shadow-sm transition hover:border-[#1B8FD2]/30 hover:text-[#1B8FD2] said-no-explore',
              messagesActive && 'border-[#1B8FD2] text-[#1B8FD2]'
            )}
            aria-label="Open messages"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setNotificationsActive((prev) => !prev)}
            className={clsx(
              'relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white text-[#6E6E6E] shadow-sm transition hover:border-[#1B8FD2]/30 hover:text-[#1B8FD2]'
              , notificationsActive && 'border-[#1B8FD2] text-[#1B8FD2]'
            )}
            aria-label={copy.header.notifications}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </button>
        </div>
      </div>
    </header>
  )
}
