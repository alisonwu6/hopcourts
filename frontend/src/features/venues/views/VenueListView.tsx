import { useState, useMemo } from 'react'
import { Search, X, ChevronRight, Trees, Filter, List as ListIcon, Map as MapIcon } from 'lucide-react'
import { PageLoading } from '@/components/PageLoading'
import { VenueMap } from '../components/VenueMap'
import { VenueMapFilters, VenueMapFilterType } from '../components/VenueMapFilters'
import { ApiVenue } from '../services/venuesService'
import { VenueCard } from '../components/VenueCard'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { MapPickerSheet } from '@/components/MapPickerSheet'

interface VenueListViewProps {
  venues: ApiVenue[]
  isLoading?: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  onSearchClear: () => void
  showMap: boolean
  onToggleView: () => void
  onVenueClick: (id: string) => void
  onSubmitVenueClick: () => void
  selectedVenueId: string | null
  onSelectVenue: (id: string | null) => void
  activeFilter: VenueMapFilterType
  onFilterChange: (filter: VenueMapFilterType) => void
  selectedSportCount: number
  onOpenSportSheet: () => void
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}

export function VenueListView({
  venues,
  isLoading = false,
  searchQuery,
  onSearchChange,
  onSearchClear,
  showMap,
  onToggleView,
  onVenueClick,
  onSubmitVenueClick,
  selectedVenueId,
  onSelectVenue,
  activeFilter,
  onFilterChange,
  selectedSportCount,
  onOpenSportSheet,
  hasMore,
  loadingMore,
  onLoadMore,
}: VenueListViewProps) {
  const sentinelRef = useInfiniteScroll(onLoadMore, hasMore && !loadingMore)
  const [showMapPicker, setShowMapPicker] = useState(false)

  const selectedVenue = useMemo(
    () => (selectedVenueId ? (venues.find((v) => v.id === selectedVenueId) ?? null) : null),
    [venues, selectedVenueId]
  )

  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-40 mx-auto w-full max-w-md px-4 pb-0 pt-4">
        {!showMap && <div className="absolute inset-0 z-0 bg-white/95 backdrop-blur" />}

        <div className="relative z-10 flex w-full items-center gap-2">
          <div className="pointer-events-auto relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search
                className={`h-4 w-4 transition-colors ${searchQuery ? 'text-indigo-600' : 'text-slate-400'}`}
                strokeWidth={2.5}
              />
            </div>
            <input
              type="text"
              placeholder="Search by name or address"
              className="h-[58px] w-full rounded-full border border-slate-200 bg-white pl-9 pr-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-slate-300 focus:bg-slate-50"
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

          <button
            onClick={onOpenSportSheet}
            className={`pointer-events-auto relative flex h-[58px] w-[58px] flex-none items-center justify-center rounded-full border shadow-sm transitio active:scale-95 ${
              selectedSportCount > 0 ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-white'
            }`}
          >
            <Filter className={`h-6 w-6 ${selectedSportCount > 0 ? 'text-white' : 'text-slate-700'}`} />
            {selectedSportCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-blue-600 ring-2 ring-blue-600">
                {selectedSportCount}
              </span>
            )}
          </button>

          <button
            onClick={onToggleView}
            className="pointer-events-auto flex h-[58px] w-[58px] flex-none items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            {showMap ? <ListIcon className="h-6 w-6 text-slate-700" /> : <MapIcon className="h-6 w-6 text-slate-700" />}
          </button>
        </div>

        <div className="pointer-events-auto relative z-10 mt-2">
          <VenueMapFilters
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
          />
        </div>
      </div>

      {showMap ? (
        <div className="h-[100dvh] w-full">
          <VenueMap
            venues={venues}
            selectedVenueId={selectedVenueId}
            onSelectVenue={onSelectVenue}
            onNavigate={() => setShowMapPicker(true)}
          />
          {!selectedVenueId && (
            <div
              className="pointer-events-auto fixed left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4"
              style={{ bottom: 'calc(68px + env(safe-area-inset-bottom, 0px) + 16px)' }}
            >
              <SubmitVenueCTA onClick={onSubmitVenueClick} />
            </div>
          )}
        </div>
      ) : (
        <div className="pt-33 mx-auto max-w-md px-4 pb-[100px]">
          {activeFilter === 'official' ? (
            <div className="space-y-4">
              <SubmitVenueCTA onClick={onSubmitVenueClick} />
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
                <p className="text-lg font-bold text-slate-900">Coming Soon.</p>
                <p className="mt-1 px-10 text-sm text-slate-500">Official venues are on the way. Stay tuned.</p>
              </div>
            </div>
          ) : isLoading ? (
            <PageLoading fullScreen={false} />
          ) : venues.length === 0 ? (
            <div className="space-y-4">
              <SubmitVenueCTA onClick={onSubmitVenueClick} />
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
                <p className="text-lg font-bold text-slate-900">{searchQuery ? 'No venues found' : 'No venues yet'}</p>
                <p className="mt-1 px-10 text-sm text-slate-500">
                  {searchQuery ? 'Try a different name or address.' : 'Venues in your area will appear here.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <SubmitVenueCTA onClick={onSubmitVenueClick} />
              {venues.map((v) => (
                <VenueCard
                  key={v.id}
                  venue={v}
                  onClick={onVenueClick}
                />
              ))}
              <div
                ref={sentinelRef}
                className="h-4"
              />
              {loadingMore && (
                <div className="flex justify-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <MapPickerSheet
        open={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        location={{
          lat: selectedVenue?.lat != null ? Number(selectedVenue.lat) : null,
          lng: selectedVenue?.lng != null ? Number(selectedVenue.lng) : null,
          address: selectedVenue?.address_display,
          name: selectedVenue?.name_display,
        }}
      />
    </div>
  )
}

function SubmitVenueCTA({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-courts flex w-full items-center gap-2 rounded-3xl p-2 text-left shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl">
        <Trees
          size={48}
          className="text-[#cce15f]"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black leading-tight text-white">Know a court? Put it on the map.</p>
        <p className="mt-1 text-xs font-medium leading-snug text-[#cce15f]/80">
          Every great game starts with a place.
        </p>
      </div>
      <ChevronRight
        size={30}
        className="flex-none text-white/70"
      />
    </button>
  )
}
