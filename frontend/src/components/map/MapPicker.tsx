import { useEffect, useRef } from 'react'
import Map, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

export type LatLng = { lat: number; lng: number }

type Props = {
  value?: LatLng
  onChange: (value: LatLng) => void
  variant?: 'streets' | 'satellite'
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export function MapPicker({ value, onChange, variant = 'streets' }: Props) {
  const mapRef = useRef<MapRef>(null)

  // Fly to the selected value when it changes externally
  useEffect(() => {
    if (!value) return
    mapRef.current?.flyTo({
      center: [value.lng, value.lat],
      zoom: 16, // Zoom in a bit when a pin is selected
      duration: 1200
    })
  }, [value])

  const mapStyle =
    variant === 'satellite'
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : 'mapbox://styles/mapbox/streets-v12'

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
      onClick={(evt) => {
        const { lat, lng } = evt.lngLat
        onChange({ lat, lng })
      }}
    >
      <GeolocateControl position="top-right" />
      <NavigationControl position="top-right" showCompass={false} />
      {value && (
        <Marker latitude={value.lat} longitude={value.lng} anchor="bottom">
          <div className="h-5 w-5 -translate-y-1 rounded-full bg-blue-600 shadow-lg ring-2 ring-white" />
        </Marker>
      )}
    </Map>
  )
}
