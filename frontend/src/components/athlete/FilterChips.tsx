import clsx from 'clsx'

interface Props {
  filters: string[]
  selected?: string
  onSelect?: (value: string) => void
  className?: string
}

const baseButton =
  'whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-300'

export function FilterChips({ filters, selected = 'All', onSelect, className }: Props) {
  return (
    <div className={clsx('px-4', className)}>
      <div
        className="w-full overflow-x-auto overflow-y-hidden py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x overscroll-x-contain [-webkit-overflow-scrolling:touch]"
      >
        <div className="flex w-max items-center gap-2">
          {filters.map((filter) => {
            const isActive = filter === selected
            return (
              <button
                key={filter}
                type="button"
                onClick={() => onSelect?.(filter)}
                className={clsx(
                  baseButton,
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                )}
              >
                {filter}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
