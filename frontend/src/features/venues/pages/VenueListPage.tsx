import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSports } from '@/features/dictionaries/hooks'
import { PageLoading } from '@/components/PageLoading'
import { venuesService, ApiVenue } from '@/features/venues/services/venuesService'
import { VenueListView } from '../views/VenueListView'

// Adapter to make ApiVenue compatible with EventMap logic
const mapVenueToEventStub = (venue: ApiVenue): any => ({
  id: `venue-${venue.id}`,
  venueId: venue.id,
  title: venue.name_display,
  sport: 'VENUE',
  startTime: new Date(),
  heroImageUrl: venue.logo_url,
  location: {
    name: venue.name_display,
    address: venue.address_display,
    lat: Number(venue.lat),
    lng: Number(venue.lng),
    status: venue.status,
    logo_url: venue.logo_url,
  },
  status: venue.status,
  activeSessionsCount: venue.active_sessions_count,
})

export function VenueListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [venues, setVenues] = useState<ApiVenue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null)
  const { items: sportsCatalog } = useSports('en')

  // Dynamic filtering based on search query
  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) return venues
    const q = searchQuery.toLowerCase()
    return venues.filter((v) => v.name_display.toLowerCase().includes(q) || v.address_display.toLowerCase().includes(q))
  }, [venues, searchQuery])

  // Adapting venues for the map
  const venueMarkers = useMemo(() => {
    return filteredVenues.map(mapVenueToEventStub)
  }, [filteredVenues])

  // Toggle handlers
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

  useEffect(() => {
    const fetchVenues = async () => {
      setIsLoading(true)
      const res = await venuesService.listVenues({ limit: 100 })
      if (res.success && res.data) {
        setVenues(res.data.data)
      }
      setIsLoading(false)
    }
    fetchVenues()
  }, [])

  if (isLoading && venues.length === 0) {
    return <PageLoading />
  }

  return (
    <VenueListView
      venues={filteredVenues}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearchClear={() => setSearchQuery('')}
      showMap={isMapView}
      onToggleView={handleToggleView}
      onVenueClick={(id) => navigate(`/venues/${id}`)}
      mapMarkers={venueMarkers}
      sportsCatalog={sportsCatalog}
      selectedVenueId={selectedVenueId}
      onSelectMarker={setSelectedVenueId}
    />
  )
}
