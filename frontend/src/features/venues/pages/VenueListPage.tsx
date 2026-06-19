import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageLoading } from '@/components/PageLoading'
import { venuesService, ApiVenue } from '@/features/venues/services/venuesService'
import { VenueListView } from '../views/VenueListView'
import { VenueMapFilterType } from '../components/VenueMapFilters'

const PAGE_SIZE = 50

export function VenueListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [venues, setVenues] = useState<ApiVenue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<VenueMapFilterType>('all')

  const isMapView = searchParams.get('view') === 'map'

  const handleToggleView = () => {
    setSearchParams(
      (prev) => {
        if (isMapView) prev.delete('view')
        else prev.set('view', 'map')
        return prev
      },
      { replace: true }
    )
  }

  const venueTypeFilter = (activeFilter === 'official' || activeFilter === 'public' || activeFilter === 'private')
    ? activeFilter
    : undefined

  useEffect(() => {
    const fetchVenues = async () => {
      setIsLoading(true)
      setVenues([])
      setOffset(0)
      const res = await venuesService.listVenues({ limit: PAGE_SIZE, offset: 0, type: venueTypeFilter })
      if (res.success && res.data) {
        setVenues(res.data.data)
        setHasMore(res.data.hasMore)
        setOffset(res.data.data.length)
      }
      setIsLoading(false)
    }
    void fetchVenues()
  }, [activeFilter])

  const loadMoreVenues = useCallback(async () => {
    if (loadingMore) return
    setLoadingMore(true)
    try {
      const res = await venuesService.listVenues({ limit: PAGE_SIZE, offset, type: venueTypeFilter })
      if (res.success && res.data) {
        setVenues((prev) => [...prev, ...res.data!.data])
        setHasMore(res.data.hasMore)
        setOffset((prev) => prev + res.data!.data.length)
      }
    } finally {
      setLoadingMore(false)
    }
  }, [offset, loadingMore, venueTypeFilter])

  const filteredVenues = useMemo(() => {
    let result = venues
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (v) => v.name_display.toLowerCase().includes(q) || v.address_display.toLowerCase().includes(q)
      )
    }
    if (activeFilter === 'has_events') return result.filter((v) => v.active_sessions_count > 0)
    return result
  }, [venues, searchQuery, activeFilter])

  return (
    <VenueListView
      venues={filteredVenues}
      isLoading={isLoading}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearchClear={() => setSearchQuery('')}
      showMap={isMapView}
      onToggleView={handleToggleView}
      onVenueClick={(id) => navigate(`/venues/${id}`)}
      mapVenues={filteredVenues}
      selectedVenueId={selectedVenueId}
      onSelectVenue={setSelectedVenueId}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      hasMore={hasMore && !searchQuery}
      loadingMore={loadingMore}
      onLoadMore={loadMoreVenues}
    />
  )
}
