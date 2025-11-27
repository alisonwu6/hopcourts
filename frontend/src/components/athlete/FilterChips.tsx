import clsx from 'clsx'

type FilterChipsProps = {
  filters: string[]
  selected: string
  onSelect: (value: string) => void
}

export function FilterChips({ filters, selected, onSelect }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto py-3">
      {filters.map((filter) => {
        const isActive = filter === selected
        return (
          <button
            key={filter}
            type="button"
            onClick={() => onSelect(filter)}
            className={clsx(
              'whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors',
              isActive
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200'
            )}
          >
            {filter}
          </button>
        )
      })}
    </div>
  )
}
