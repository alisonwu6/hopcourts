import { Search } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  placeholder?: string
  className?: string
}

export function SearchBar({ placeholder = 'Search players, sports, or vibes', className }: Props) {
  return (
    <div className={clsx('px-4 pb-3 sm:px-6', className)}>
      <label className="relative block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E6E6E]" />
        <input
          type="search"
          placeholder={placeholder}
          className="h-11 w-full rounded-full border border-[#E6E6E6] bg-white pl-10 pr-4 text-sm text-[#051333] focus:outline-none focus:ring-2 focus:ring-[#CDE8FF]"
          onChange={() => {
            /* reserved for future debounce handler */
          }}
        />
      </label>
    </div>
  )
}
