import { Link, useLocation } from 'react-router-dom'
import { Bell, MapPin, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const logoUrl = '/vite.svg'

type Props = {
  sticky?: boolean
  showBorder?: boolean
  className?: string
  showActions?: boolean
}

export default function Header({ sticky = true, showBorder = true, className, showActions = true }: Props) {
  const location = useLocation()
  const [messagesActive, setMessagesActive] = useState(false)
  const notificationsActive = location.pathname.startsWith('/notifications')

  const headerClass = clsx(
    sticky && 'sticky top-0',
    showBorder ? 'border-b border-slate-200' : '',
    'z-50 bg-white/90 backdrop-blur',
    className
  )

  return (
    <header className={headerClass}>
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <img
              className="h-10 w-auto flex-shrink-0"
              src={logoUrl}
              alt="HopCourts"
              onError={(event) => {
                const target = event.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </Link>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-sm font-medium text-[#051333]">
              <MapPin
                className="h-4 w-4 text-blue-600"
                aria-hidden="true"
              />
              Brisbane
            </div>
            <div
              className="text-xs text-slate-500"
              style={{ whiteSpace: 'pre-line' }}
            >
              {'Play together.\nFind your mates.'}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMessagesActive((prev) => !prev)}
              className={clsx(
                'inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white text-[#6E6E6E] shadow-sm transition hover:border-[#1B8FD2]/30 hover:text-[#1B8FD2]',
                messagesActive && 'border-[#1B8FD2] text-[#1B8FD2]'
              )}
              aria-label="Open messages"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
            <Link
              to="/notifications"
              className="relative"
            >
              <span className="sr-only">Notifications</span>
              <div
                className={clsx(
                  'inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white text-[#6E6E6E] shadow-sm transition hover:border-[#1B8FD2]/30 hover:text-[#1B8FD2]',
                  notificationsActive && 'border-[#1B8FD2] text-[#1B8FD2]'
                )}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
