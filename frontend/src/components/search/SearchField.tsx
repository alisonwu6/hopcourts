import { Search } from 'lucide-react'
import clsx from 'clsx'

interface SearchFieldProps {
  placeholder?: string
  className?: string
  value?: string
  onChange?: (value: string) => void
  inputClassName?: string
  storyLine?: 'player' | 'venue' | 'host'
}

export function SearchField({
  placeholder = 'Search',
  className,
  value,
  onChange,
  inputClassName,
  storyLine = 'player',
}: SearchFieldProps) {
  const tone = {
    border: 'border-slate-200',
    text: 'text-slate-900',
    focus: 'focus:ring-blue-300',
    icon: 'text-blue-600/70',
  }

  return (
    <div className={clsx('px-4 pb-4 sm:px-6', className)}>
      <label className="relative block">
        <Search
          className={clsx('pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2', tone.icon)}
          aria-hidden="true"
        />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          className={clsx(
            'h-11 w-full rounded-full border bg-white pl-10 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0',
            tone.border,
            tone.text,
            tone.focus,
            inputClassName
          )}
        />
      </label>
    </div>
  )
}
