import { useMemo, useEffect, useRef } from 'react'
import Map, { Marker, GeolocateControl, MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin } from 'lucide-react'
import { ApiVenue } from '../services/venuesService'
import { VenueMapMarker } from './VenueMapMarker'
import { VenueMapBottomSheet } from './VenueMapBottomSheet'
import { QUEENSLAND_BOUNDS } from '@/components/map/MapPicker'

interface VenueMapProps {
  venues: ApiVenue[]
  selectedVenueId: string | null
  onSelectVenue: (id: string | null) => void
  onNavigate: () => void
}

export function VenueMap({ venues, selectedVenueId, onSelectVenue, onNavigate }: VenueMapProps) {
  const token = import.meta.env.VITE_MAPBOX_TOKEN
  const mapRef = useRef<MapRef>(null)

  const selectedVenue = useMemo(
    () => (selectedVenueId ? (venues.find((v) => v.id === selectedVenueId) ?? null) : null),
    [venues, selectedVenueId]
  )

  const validVenues = useMemo(
    () => venues.filter((v) => v.lat && v.lng),
    [venues]
  )

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 13,
          duration: 2000,
        })
      },
      () => {}
    )
  }, [])

  const handleShare = (venue: ApiVenue) => {
    const url = `${window.location.origin}/venues/${venue.id}`
    if (navigator.share) {
      void navigator.share({ title: venue.name_display, url })
    } else {
      void navigator.clipboard.writeText(url)
    }
  }

  if (!token) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-500">
        Map configuration missing (VITE_MAPBOX_TOKEN)
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-0 h-full w-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={{ longitude: 153.0251, latitude: -27.4698, zoom: 11 }}
        maxBounds={QUEENSLAND_BOUNDS}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onClick={() => onSelectVenue(null)}
      >
        <GeolocateControl
          position="bottom-right"
          trackUserLocation
          showUserHeading
          style={{ marginBottom: 30 }}
        />

        {validVenues.map((venue) => (
          <Marker
            key={venue.id}
            longitude={Number(venue.lng)}
            latitude={Number(venue.lat)}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              onSelectVenue(venue.id)
            }}
          >
            <VenueMapMarker
              venue={venue}
              isSelected={selectedVenueId === venue.id}
            />
          </Marker>
        ))}
      </Map>

      <div className="pointer-events-none absolute bottom-20 left-3 z-10">
        <div className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
          <MapPin className="h-3 w-3 text-white/80" />
          <span className="text-xs font-semibold text-white">Brisbane, QLD only</span>
        </div>
      </div>

      {selectedVenue && (
        <div
          className="fixed left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8"
          style={{ bottom: 'calc(68px + env(safe-area-inset-bottom, 0px) + 16px)' }}
        >
          <VenueMapBottomSheet
            venue={selectedVenue}
            onNavigate={onNavigate}
            onShare={() => handleShare(selectedVenue)}
          />
        </div>
      )}
    </div>
  )
}
