import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoginPromptSheet } from '@/components'
import { useAuthStore } from '@/hooks'
import { venuesService, ApiVenue } from '@/features/venues/services/venuesService'
import { useVenuesQuery } from '@/features/venues/hooks/useVenuesQuery'
import { VenueListView } from '../views/VenueListView'
import { VenueMapFilterType } from '../components/VenueMapFilters'
import { SportSelectionSheet } from '../components/SportSelectionSheet'
import { useSports } from '@/features/dictionaries/hooks'

const PAGE_SIZE = 50

export function VenueListPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAuthLoading = useAuthStore((state) => state.isLoading)
  const [searchParams, setSearchParams] = useSearchParams()
  const [extraVenues, setExtraVenues] = useState<ApiVenue[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<VenueMapFilterType>('all')
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [showSportSheet, setShowSportSheet] = useState(false)

  const { items: sportsCatalog } = useSports()

  const isMapView = searchParams.get('view') !== 'list'

  const handleToggleView = () => {
    setSearchParams(
      (prev) => {
        if (isMapView) prev.set('view', 'list')
        else prev.delete('view')
        return prev
      },
      { replace: true }
    )
  }

  const venueTypeFilter =
    activeFilter === 'official' || activeFilter === 'public' || activeFilter === 'private'
      ? activeFilter
      : undefined

  const venuesQuery = useVenuesQuery({ limit: PAGE_SIZE, offset: 0, type: venueTypeFilter })
  const baseVenues = venuesQuery.data?.data?.data ?? []
  const venues = [...baseVenues, ...extraVenues]
  const isLoading = venuesQuery.isLoading

  useEffect(() => {
    setExtraVenues([])
    setOffset(0)
    setHasMore(false)
  }, [activeFilter])

  useEffect(() => {
    if (venuesQuery.data?.data) {
      setOffset(venuesQuery.data.data.data.length)
      setHasMore(venuesQuery.data.data.hasMore)
    }
  }, [venuesQuery.data])

  const loadMoreVenues = useCallback(async () => {
    if (loadingMore) return
    setLoadingMore(true)
    try {
      const res = await venuesService.listVenues({ limit: PAGE_SIZE, offset, type: venueTypeFilter })
      if (res.success && res.data) {
        setExtraVenues((prev) => [...prev, ...res.data!.data])
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
    if (activeFilter === 'has_events') result = result.filter((v) => v.active_sessions_count > 0)
    if (selectedSports.length > 0) {
      result = result.filter((v) => v.sport_keys.some((k) => selectedSports.includes(k)))
    }
    return result
  }, [venues, searchQuery, activeFilter, selectedSports])

  const handleSubmitVenueClick = () => {
    if (isAuthLoading) return
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }
    navigate('/venues/submit')
  }

  return (
    <>
      <VenueListView
        venues={filteredVenues}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClear={() => setSearchQuery('')}
        showMap={isMapView}
        onToggleView={handleToggleView}
        onVenueClick={(id) => navigate(`/venues/${id}`)}
        onSubmitVenueClick={handleSubmitVenueClick}
        selectedVenueId={selectedVenueId}
        onSelectVenue={setSelectedVenueId}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        selectedSportCount={selectedSports.length}
        onOpenSportSheet={() => setShowSportSheet(true)}
        hasMore={hasMore && !searchQuery}
        loadingMore={loadingMore}
        onLoadMore={loadMoreVenues}
      />
      <SportSelectionSheet
        open={showSportSheet}
        sports={sportsCatalog}
        selectedKeys={selectedSports}
        onClose={() => setShowSportSheet(false)}
        onApply={(keys) => {
          setSelectedSports(keys)
          setShowSportSheet(false)
        }}
      />
      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        returnTo="/venues/submit"
      />
    </>
  )
}
