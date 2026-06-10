import { Search, Map as MapIcon, List as ListIcon, X, Building2 } from 'lucide-react'
import clsx from 'clsx'
import { EventMap } from '@/features/events/components/EventMap'
import { ApiVenue } from '../services/venuesService'
import { VenueCard } from '../components/VenueCard'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

interface VenueListViewProps {
  venues: ApiVenue[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onSearchClear: () => void
  showMap: boolean
  onToggleView: () => void
  onVenueClick: (id: string) => void
  // Map props
  mapMarkers: any[]
  sportsCatalog: any[]
  selectedVenueId: string | null
  onSelectMarker: (id: string | null) => void
  // Pagination
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}

export function VenueListView({
  venues,
  searchQuery,
  onSearchChange,
  onSearchClear,
  showMap,
  onToggleView,
  onVenueClick,
  mapMarkers,
  sportsCatalog,
  selectedVenueId,
  onSelectMarker,
  hasMore,
  loadingMore,
  onLoadMore,
}: VenueListViewProps) {
  const sentinelRef = useInfiniteScroll(onLoadMore, hasMore && !loadingMore)
  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Top Search Bar & Toggle (Floating) */}
      <div
        className={clsx(
          'fixed left-0 right-0 top-0 z-40 mx-auto w-full max-w-md p-4 transition-all duration-300',
          showMap ? 'pointer-events-none' : 'pointer-events-auto bg-white/95 backdrop-blur'
        )}
      >
        <div className="flex w-full items-center gap-3">
          {/* Real Input Search */}
          <div className="pointer-events-auto relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search
                className={clsx('h-5 w-5 transition-colors', searchQuery ? 'text-indigo-600' : 'text-slate-400')}
                strokeWidth={2.5}
              />
            </div>
            <input
              type="text"
              placeholder="Search by name or address"
              className="h-[58px] w-full rounded-full border border-slate-200 bg-white pl-12 pr-12 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-slate-300 focus:bg-slate-50/50"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={onSearchClear}
                className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 p-1 text-slate-500 transition-all hover:bg-slate-200"
              >
                <X
                  size={14}
                  strokeWidth={3}
                />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <button
            onClick={onToggleView}
            className="pointer-events-auto flex h-[58px] w-[58px] flex-none items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            {showMap ? <ListIcon className="h-6 w-6 text-slate-700" /> : <MapIcon className="h-6 w-6 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {showMap ? (
        <div className="h-screen w-full">
          <EventMap
            events={mapMarkers}
            sports={sportsCatalog}
            mode="venues"
            selectedEventId={selectedVenueId}
            onSelectEvent={(e) => onSelectMarker(e?.id || null)}
          />
        </div>
      ) : (
        <div className="mx-auto max-w-md px-4 pb-[100px] pt-24">
          {venues.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
              <div className="p-2">
                <Building2 className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {searchQuery ? 'No venues found' : 'No venues yet'}
              </h3>
              <p className="mt-1 px-10 text-sm text-slate-500">
                {searchQuery
                  ? 'Try a different name or address.'
                  : 'Venues in your area will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {venues.map((v) => (
                <VenueCard
                  key={v.id}
                  venue={v}
                  onClick={onVenueClick}
                />
              ))}
              <div ref={sentinelRef} className="h-4" />
              {loadingMore && (
                <div className="flex justify-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
