import clsx from 'clsx'
import { getSportTheme } from '@/lib/sportColors'

interface Props {
  filters: string[]
  selected?: string
  onSelect?: (value: string) => void
  className?: string
}

const baseButton =
  'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-300'

export function FilterChips({ filters, selected = 'All', onSelect, className }: Props) {
  return (
    <div className={clsx('', className)}>
      <div
        className="w-full overflow-x-auto overflow-y-hidden py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x overscroll-x-contain [-webkit-overflow-scrolling:touch]"
      >
        <div className="flex w-max items-center gap-2">
          {filters.map((filter) => {
            const isActive = filter === selected
            const theme = getSportTheme(filter)
            const isSportChip = !theme.isDefault
            const style =
              isActive && isSportChip
                ? { backgroundColor: theme.surface, color: theme.dark, borderColor: theme.primary }
                : undefined

            return (
              <button
                key={filter}
                type="button"
                onClick={() => onSelect?.(filter)}
                className={clsx(
                  baseButton,
                  isActive
                    ? isSportChip
                      ? 'shadow-sm'
                      : 'border-transparent bg-blue-600 text-white shadow-sm'
                    : 'border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200'
                )}
                style={style}
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
