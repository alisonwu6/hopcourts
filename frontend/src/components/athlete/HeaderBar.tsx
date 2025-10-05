import { Search, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import logoUrl from '@/assets/sportsmatch.png'
import { useCopy } from '@/i18n/LanguageProvider'

type Props = {
  className?: string
}

export function HeaderBar({ className }: Props) {
  const copy = useCopy()

  return (
    <header
      className={clsx(
        'flex items-center justify-between border-b border-[#E6E6E6] bg-white/95 px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.04)] backdrop-blur sm:px-6',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <img
          src={logoUrl}
          alt={copy.common.appName}
          className="h-8 w-auto"
        />
        <div className="hidden flex-col sm:flex">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#051333]">
            {copy.common.appName}
          </span>
          <span className="text-[11px] text-[#6E6E6E]">{copy.common.tagline}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white text-[#6E6E6E] shadow-sm transition hover:border-[#1B8FD2]/30 hover:text-[#1B8FD2]"
          aria-label="Search athletes"
          onClick={() => console.log('searchAthletes')}
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white text-[#6E6E6E] shadow-sm transition hover:border-[#1B8FD2]/30 hover:text-[#1B8FD2]"
          aria-label="Refresh suggestions"
          onClick={() => console.log('refreshAthletes')}
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
