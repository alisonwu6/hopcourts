import { useEffect, useRef } from 'react'
import Map, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl/mapbox'
import { Trees } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'

export type LatLng = { lat: number; lng: number }
export type VenuePin = { id: string; name_display: string; address_display: string; lat: number; lng: number }

type Props = {
  value?: LatLng
  onChange: (value: LatLng) => void
  variant?: 'streets' | 'satellite'
  maxBounds?: [[number, number], [number, number]]
  venues?: VenuePin[]
  selectedVenueId?: string | null
  onVenueSelect?: (venue: VenuePin) => void
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// First-market rollout only.
export const QUEENSLAND_BOUNDS: [[number, number], [number, number]] = [
  [138.0, -29.18],
  [153.55, -10.68],
]

export function MapPicker({ value, onChange, variant = 'streets', maxBounds, venues, selectedVenueId, onVenueSelect }: Props) {
  const mapRef = useRef<MapRef>(null)

  // Fly to the selected value when it changes externally
  useEffect(() => {
    if (!value) return
    mapRef.current?.flyTo({
      center: [value.lng, value.lat],
      zoom: 16, // Zoom in a bit when a pin is selected
      duration: 1200,
    })
  }, [value])

  const mapStyle =
    variant === 'satellite' ? 'mapbox://styles/mapbox/satellite-streets-v12' : 'mapbox://styles/mapbox/streets-v12'

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        latitude: value?.lat ?? -27.4698,
        longitude: value?.lng ?? 153.0251,
        zoom: 14,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={mapStyle}
      maxBounds={maxBounds}
      onClick={(evt) => {
        const { lat, lng } = evt.lngLat
        onChange({ lat, lng })
      }}
    >
      <GeolocateControl position="top-right" />
      <NavigationControl
        position="top-right"
        showCompass={false}
      />
      {value && (
        <Marker
          latitude={value.lat}
          longitude={value.lng}
          anchor="bottom"
        >
          <div className="h-5 w-5 -translate-y-1 rounded-full bg-blue-600 shadow-lg ring-2 ring-white" />
        </Marker>
      )}
      {venues?.map((venue) => (
        <Marker
          key={venue.id}
          latitude={venue.lat}
          longitude={venue.lng}
          anchor="bottom"
        >
          <div
            onClick={(e) => { e.stopPropagation(); onVenueSelect?.(venue) }}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-lg ring-2 ring-white transition-transform active:scale-90 ${selectedVenueId === venue.id ? 'scale-110 bg-emerald-700' : 'bg-emerald-600'}`}
          >
            <Trees size={15} className="text-white" />
          </div>
        </Marker>
      ))}
    </Map>
  )
}
