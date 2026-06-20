import { useMemo, useEffect, useRef } from 'react'
import Map, { Marker, GeolocateControl, MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { ApiVenue } from '../services/venuesService'
import { VenueMapMarker } from './VenueMapMarker'
import { VenueMapBottomSheet } from './VenueMapBottomSheet'

interface VenueMapProps {
  venues: ApiVenue[]
  selectedVenueId: string | null
  onSelectVenue: (id: string | null) => void
}

export function VenueMap({ venues, selectedVenueId, onSelectVenue }: VenueMapProps) {
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

  const handleNavigate = (venue: ApiVenue) => {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const url = isIos
      ? `maps://maps.apple.com/?daddr=${venue.lat},${venue.lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`
    window.open(url, '_blank')
  }

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

      {selectedVenue && (
        <div
          className="fixed left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8"
          style={{ bottom: 'calc(68px + env(safe-area-inset-bottom, 0px) + 16px)' }}
        >
          <VenueMapBottomSheet
            venue={selectedVenue}
            onNavigate={() => handleNavigate(selectedVenue)}
            onShare={() => handleShare(selectedVenue)}
          />
        </div>
      )}
    </div>
  )
}
