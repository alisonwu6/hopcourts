import clsx from 'clsx'

interface Props {
  filters: string[]
  selected?: string
  onSelect?: (value: string) => void
}

export function FilterChips({ filters, selected = 'All', onSelect }: Props) {
  return (
    <div className="overflow-x-auto scrollbar-hidden">
      <div className="flex min-w-max items-center gap-2 px-4 py-3 sm:px-6">
        {filters.map((filter) => {
          const isActive = filter === selected
          return (
            <button
              key={filter}
              type="button"
              onClick={() => onSelect?.(filter)}
              className={clsx(
                'whitespace-nowrap rounded-full px-4 py-2 text-sm transition',
                isActive ? 'bg-[#1B8FD2] text-white shadow-sm' : 'bg-white text-[#6E6E6E] hover:text-[#1B8FD2]'
              )}
            >
              {filter}
            </button>
          )
        })}
      </div>
    </div>
  )
}
