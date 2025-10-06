import { Search } from 'lucide-react'
import clsx from 'clsx'

interface SearchFieldProps {
  placeholder?: string
  className?: string
  value?: string
  onChange?: (value: string) => void
  inputClassName?: string
}

export function SearchField({
  placeholder = 'Search',
  className,
  value,
  onChange,
  inputClassName,
}: SearchFieldProps) {
  return (
    <div className={clsx('px-4 pb-4 sm:px-6', className)}>
      <label className="relative block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E6E6E]"
          aria-hidden="true"
        />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          className={clsx(
            'h-11 w-full rounded-full border border-[#E6E6E6] bg-white pl-10 pr-4 text-sm text-[#051333] placeholder:text-[#6E6E6E] focus:outline-none focus:ring-2 focus:ring-[#CDE8FF] focus:ring-offset-0',
            inputClassName
          )}
        />
      </label>
    </div>
  )
}
