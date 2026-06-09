import { useMemo, useEffect, useRef, useState } from 'react'
import Map, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl/mapbox'
import { Building2 } from 'lucide-react'
import clsx from 'clsx'
import 'mapbox-gl/dist/mapbox-gl.css'
import { PlayerEvent } from '@/types'
import { Link } from 'react-router-dom'
import { EventCard } from './EventCard'

interface EventMapProps {
  events: PlayerEvent[]
  sports: Array<{ key: string; label: string; icon?: string | null }>
  selectedEventId?: string | null
  onSelectEvent: (event: PlayerEvent | null) => void
  onClickDetail?: (event: PlayerEvent) => void
  mode?: 'events' | 'venues'
}

export function EventMap({
  events,
  sports,
  selectedEventId,
  onSelectEvent,
  onClickDetail,
  mode = 'events',
}: EventMapProps) {
  const token = import.meta.env.VITE_MAPBOX_TOKEN
  const mapRef = useRef<MapRef>(null)

  const selectedEvent = useMemo(
    () => (selectedEventId ? events.find((e) => e.id === selectedEventId) || null : null),
    [events, selectedEventId]
  )

  const initialViewState = {
    longitude: 153.0251,
    latitude: -27.4698,
    zoom: 11,
  }
  const [mapZoom, setMapZoom] = useState(initialViewState.zoom)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          mapRef.current?.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 13,
            duration: 2000,
          })
        },
        () => {}
      )
    }
  }, [])

  const validEvents = useMemo(() => events.filter((e) => e.location.lat && e.location.lng), [events])

  const selectedSportLabel = useMemo(() => {
    if (!selectedEvent) return ''
    return sports.find((s) => s.key.toUpperCase() === selectedEvent.sport.toUpperCase())?.label || selectedEvent.sport
  }, [selectedEvent, sports])

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
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onMove={(evt) => setMapZoom(evt.viewState.zoom)}
        onClick={() => onSelectEvent(null)}
      >
        <NavigationControl
          position="bottom-right"
          style={{ marginBottom: 100 }}
        />
        <GeolocateControl
          position="bottom-right"
          trackUserLocation
          showUserHeading
          style={{ marginBottom: 10 }}
        />

        {validEvents.map((event) => {
          const isSelected = selectedEvent?.id === event.id
          const sportIcon = sports.find((s) => s.key.toUpperCase() === event.sport.toUpperCase())?.icon || '🎯'
          const baseMarkerSize = Math.max(30, Math.min(46, Math.round(30 + (mapZoom - 10) * 3)))
          const markerSize = isSelected ? baseMarkerSize + 4 : baseMarkerSize
          const iconSize = Math.max(18, Math.round(markerSize * 0.52))

          const markerContent =
            mode === 'venues' ? (
              event.location.logo_url ? (
                <img
                  src={event.location.logo_url}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-6 w-6 text-slate-300" />
              )
            ) : (
              sportIcon
            )

          const spotsLeft = event.maxAttendees > 0 ? event.maxAttendees - event.attendeeCount : null
          const isFull = spotsLeft !== null && spotsLeft <= 0
          const showSpots = mode === 'events' && spotsLeft !== null

          return (
            <Marker
              key={event.id}
              longitude={event.location.lng!}
              latitude={event.location.lat!}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                onSelectEvent(event)
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className={clsx(
                    'flex cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 shadow-sm backdrop-blur-sm transition-all',
                    isSelected
                      ? 'z-10 scale-110 border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 outline outline-indigo-200/50'
                      : 'border-white bg-white/90 shadow-slate-200'
                  )}
                  style={{ width: markerSize, height: markerSize }}
                >
                  <span
                    className="flex h-full w-full items-center justify-center leading-none"
                    style={{ fontSize: iconSize }}
                  >
                    {markerContent}
                  </span>
                </div>
                {showSpots && (
                  <span
                    className={clsx(
                      'whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold shadow-sm',
                      isFull
                        ? 'bg-orange-500 text-white'
                        : 'bg-[#aaee44] text-slate-900'
                    )}
                  >
                    {isFull ? 'Full' : spotsLeft === 1 ? '1 spot' : `${spotsLeft} spots`}
                  </span>
                )}
              </div>
            </Marker>
          )
        })}
      </Map>

      {selectedEvent && (
        <div
          className="fixed left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8"
          style={{ bottom: 'calc(68px + env(safe-area-inset-bottom, 0px) + 20px)' }}
        >
          {mode === 'events' ? (
            onClickDetail ? (
              <button
                onClick={() => onClickDetail(selectedEvent)}
                className="block w-full text-left"
              >
                <EventCard
                  event={selectedEvent}
                  sportLabel={selectedSportLabel}
                  disableVenueHostNavigation
                  className="mb-0"
                />
              </button>
            ) : (
              <Link
                to={
                  selectedEvent.venueId && selectedEvent.id.toString().startsWith('venue-')
                    ? `/venues/${selectedEvent.venueId}`
                    : `/event/${selectedEvent.id}`
                }
                className="block"
              >
                <EventCard
                  event={selectedEvent}
                  sportLabel={selectedSportLabel}
                  disableVenueHostNavigation
                  className="mb-0"
                />
              </Link>
            )
          ) : (
            <Link
              to={`/venues/${selectedEvent.venueId}`}
              className="block"
            >
              <div className="flex items-center gap-5 rounded-[36px] bg-white p-6 shadow-[0_24px_60px_rgba(15,41,77,0.18)] ring-1 ring-black/5 transition-transform active:scale-95">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-slate-50 shadow-sm ring-1 ring-slate-100">
                  {selectedEvent.heroImageUrl ? (
                    <img
                      src={selectedEvent.heroImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-10 w-10 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="truncate text-[22px] font-extrabold tracking-tight text-slate-900">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-[14px] font-semibold text-slate-400">
                    {(selectedEvent as any).activeSessionsCount || 0} events live today
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
