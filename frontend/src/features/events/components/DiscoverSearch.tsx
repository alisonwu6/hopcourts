import clsx from 'clsx'
import { Search, X, Map as MapIcon, List as ListIcon } from 'lucide-react'

type DiscoverEventsHeaderProps = {
  showMap: boolean
  hasFilter: boolean
  dateLabel: string
  sportLabel: string
  filteredCount: number
  onOpenSearch: () => void
  onToggleMap: () => void
  onClearFilters: () => void
}

export function DiscoverEventsHeader({
  showMap,
  hasFilter,
  dateLabel,
  sportLabel,
  filteredCount,
  onOpenSearch,
  onToggleMap,
  onClearFilters,
}: DiscoverEventsHeaderProps) {
  return (
    <div
      className={clsx(
        'fixed left-0 right-0 z-40 mx-auto w-full max-w-md p-4 transition-all duration-300',
        showMap ? 'pointer-events-none bg-transparent' : 'bg-white/95 backdrop-blur'
      )}
      style={{ top: '0px' }}
    >
      <div className="flex w-full items-center gap-3">
        <button
          onClick={onOpenSearch}
          className="pointer-events-auto flex flex-1 items-center gap-1 rounded-full border border-slate-200 bg-white p-3 shadow-sm transition"
        >
          <Search className="ml-2 h-5 w-5 text-slate-800" strokeWidth={2.5} />
          <div className="flex flex-col items-start px-1">
            {!hasFilter ? (
              <>
                <span className="text-sm font-bold text-slate-900">Start searching</span>
                <span className="text-xs font-medium text-slate-500">
                  {dateLabel} • {sportLabel}
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-bold leading-tight text-slate-900">{dateLabel}</span>
                <span className="text-sm font-bold leading-tight text-slate-900">{sportLabel}</span>
              </>
            )}
          </div>
          {hasFilter && (
            <>
              <div className="ml-auto mr-2 flex h-6 min-w-[24px] items-center justify-center rounded-full border border-slate-200 bg-transparent px-1.5 text-xs font-bold text-slate-600">
                {filteredCount}
              </div>
              <div
                role="button"
                tabIndex={0}
                className="mr-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition"
                onClick={(event) => {
                  event.stopPropagation()
                  onClearFilters()
                }}
              >
                <X className="h-4 w-4 text-slate-500" />
              </div>
            </>
          )}
        </button>

        <button
          onClick={onToggleMap}
          className="pointer-events-auto flex h-[58px] w-[58px] flex-none items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition"
        >
          {showMap ? (
            <ListIcon className="h-6 w-6 text-slate-700" />
          ) : (
            <MapIcon className="h-6 w-6 text-slate-700" />
          )}
        </button>
      </div>
    </div>
  )
}
