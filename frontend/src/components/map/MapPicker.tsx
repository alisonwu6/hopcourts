import { useEffect, useState } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

export type LatLng = { lat: number; lng: number }

type Props = {
  value?: LatLng
  onChange: (value: LatLng) => void
  variant?: 'streets' | 'satellite'
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export function MapPicker({ value, onChange, variant = 'streets' }: Props) {
  const [viewport, setViewport] = useState({
    latitude: value?.lat ?? 25.033964,
    longitude: value?.lng ?? 121.564468,
    zoom: 14,
    bearing: 0,
    pitch: 0,
  })

  useEffect(() => {
    if (!value) return
    setViewport((prev) => {
      if (prev.latitude === value.lat && prev.longitude === value.lng) return prev
      return { ...prev, latitude: value.lat, longitude: value.lng }
    })
  }, [value])

  const mapStyle =
    variant === 'satellite'
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : 'mapbox://styles/mapbox/streets-v12'

  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      viewState={viewport}
      onMoveEnd={(evt) =>
        setViewport((prev) => {
          const next = evt.viewState
          if (
            prev.latitude === next.latitude &&
            prev.longitude === next.longitude &&
            prev.zoom === next.zoom &&
            prev.bearing === next.bearing &&
            prev.pitch === next.pitch
          ) {
            return prev
          }
          return {
            ...prev,
            latitude: next.latitude,
            longitude: next.longitude,
            zoom: next.zoom,
            bearing: next.bearing,
            pitch: next.pitch,
          }
        })
      }
      style={{ width: '100%', height: '100%' }}
      mapStyle={mapStyle}
      onClick={(evt) => {
        const { lat, lng } = evt.lngLat
        onChange({ lat, lng })
      }}
    >
      <NavigationControl position="top-right" showCompass={false} />
      {value && (
        <Marker latitude={value.lat} longitude={value.lng} anchor="bottom">
          <div className="h-5 w-5 -translate-y-1 rounded-full bg-blue-600 shadow-lg ring-2 ring-white" />
        </Marker>
      )}
    </Map>
  )
}
