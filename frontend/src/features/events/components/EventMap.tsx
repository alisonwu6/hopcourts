import { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import Map, { Marker, GeolocateControl, MapRef, Source, Layer } from 'react-map-gl/mapbox'
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

type EventGroup = {
  key: string
  lat: number
  lng: number
  events: PlayerEvent[]
}

function getSpiderPositions(
  lat: number,
  lng: number,
  count: number,
  zoom: number
): Array<{ lat: number; lng: number }> {
  // Fixed small radius — we always fly to zoom 17 so legs stay compact
  const R = 0.0003
  return Array.from({ length: count }, (_, i) => {
    const angle = (i * 2 * Math.PI) / count - Math.PI / 2
    return {
      lat: lat + R * Math.cos(angle),
      lng: lng + R * Math.sin(angle),
    }
  })
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

  const initialViewState = { longitude: 153.0251, latitude: -27.4698, zoom: 11 }
  const [mapZoom, setMapZoom] = useState(initialViewState.zoom)
  const [spiderfiedKey, setSpiderfiedKey] = useState<string | null>(null)
  const programmaticZoom = useRef(false)
  const savedView = useRef<{ lng: number; lat: number; zoom: number } | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
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
    }
  }, [])

  const validEvents = useMemo(
    () => events.filter((e) => e.location.lat && e.location.lng),
    [events]
  )

  // Group events by exact lat/lng
  const eventGroups = useMemo<EventGroup[]>(() => {
    const map: Record<string, EventGroup> = {}
    validEvents.forEach((e) => {
      const key = `${e.location.lat},${e.location.lng}`
      if (!map[key]) map[key] = { key, lat: e.location.lat!, lng: e.location.lng!, events: [] }
      map[key].events.push(e)
    })
    return Object.values(map)
  }, [validEvents])

  const spiderfiedGroup = useMemo(
    () => eventGroups.find((g) => g.key === spiderfiedKey) ?? null,
    [eventGroups, spiderfiedKey]
  )

  const spiderPositions = useMemo(() => {
    if (!spiderfiedGroup) return []
    return getSpiderPositions(
      spiderfiedGroup.lat,
      spiderfiedGroup.lng,
      spiderfiedGroup.events.length,
      mapZoom
    )
  }, [spiderfiedGroup, mapZoom])

  // GeoJSON lines from hub to each child
  const spiderLinesGeoJSON = useMemo(() => {
    if (!spiderfiedGroup || spiderPositions.length === 0) return null
    return {
      type: 'FeatureCollection' as const,
      features: spiderPositions.map((pos) => ({
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: [
            [spiderfiedGroup.lng, spiderfiedGroup.lat],
            [pos.lng, pos.lat],
          ],
        },
      })),
    }
  }, [spiderfiedGroup, spiderPositions])

  const collapse = useCallback(() => {
    setSpiderfiedKey(null)
    onSelectEvent(null)
    if (savedView.current) {
      programmaticZoom.current = true
      mapRef.current?.flyTo({
        center: [savedView.current.lng, savedView.current.lat],
        zoom: savedView.current.zoom,
        duration: 500,
      })
      savedView.current = null
    }
  }, [onSelectEvent])

  const handleMapClick = useCallback(() => {
    collapse()
  }, [collapse])

  const handleMove = useCallback((evt: { viewState: { zoom: number } }) => {
    const newZoom = evt.viewState.zoom
    setMapZoom((prev) => {
      if (!programmaticZoom.current && Math.abs(newZoom - prev) > 0.5) setSpiderfiedKey(null)
      return newZoom
    })
  }, [])

  const handleMoveEnd = useCallback(() => {
    programmaticZoom.current = false
  }, [])

  const selectedSportLabel = useMemo(() => {
    if (!selectedEvent) return ''
    return (
      sports.find((s) => s.key.toUpperCase() === selectedEvent.sport.toUpperCase())?.label ||
      selectedEvent.sport
    )
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
        onMove={handleMove}
        onMoveEnd={handleMoveEnd}
        onClick={handleMapClick}
      >
        <GeolocateControl
          position="bottom-right"
          trackUserLocation
          showUserHeading
          style={{ marginBottom: 30 }}
        />

        {/* Spider leg lines */}
        {spiderLinesGeoJSON && (
          <Source id="spider-lines" type="geojson" data={spiderLinesGeoJSON}>
            <Layer
              id="spider-lines-layer"
              type="line"
              paint={{
                'line-color': '#94A3B8',
                'line-width': 1.5,
                'line-dasharray': [3, 3],
                'line-opacity': 0.7,
              }}
            />
          </Source>
        )}

        {eventGroups.map((group) => {
          const isSpiderfied = spiderfiedKey === group.key
          const isSingle = group.events.length === 1

          if (isSingle) {
            const event = group.events[0]
            return (
              <SingleMarker
                key={group.key}
                event={event}
                sports={sports}
                mapZoom={mapZoom}
                isSelected={selectedEvent?.id === event.id}
                mode={mode}
                onClick={(e) => {
                  e.originalEvent.stopPropagation()
                  onSelectEvent(event)
                }}
              />
            )
          }

          // Multi-event hub marker
          const hubSport = sports.find(
            (s) => s.key.toUpperCase() === group.events[0].sport.toUpperCase()
          )?.icon || '🎯'

          return (
            <Marker
              key={group.key}
              longitude={group.lng}
              latitude={group.lat}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                if (isSpiderfied) {
                  collapse()
                } else {
                  const map = mapRef.current?.getMap()
                  savedView.current = {
                    lng: map?.getCenter().lng ?? group.lng,
                    lat: map?.getCenter().lat ?? group.lat,
                    zoom: mapZoom,
                  }
                  programmaticZoom.current = true
                  setSpiderfiedKey(group.key)
                  onSelectEvent(null)
                  mapRef.current?.flyTo({
                    center: [group.lng, group.lat],
                    zoom: 17,
                    duration: 500,
                  })
                }
              }}
            >
              <div
                className={clsx(
                  'relative flex cursor-pointer items-center justify-center rounded-full border-2 shadow-md transition-all active:scale-95',
                  isSpiderfied
                    ? 'border-indigo-400 bg-indigo-50 shadow-indigo-200'
                    : 'border-white bg-white shadow-slate-200'
                )}
                style={{ width: 44, height: 44 }}
              >
                <span className="text-xl leading-none">{hubSport}</span>
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white ring-2 ring-white">
                  {group.events.length}
                </span>
              </div>
            </Marker>
          )
        })}

        {/* Spider child markers */}
        {spiderfiedGroup &&
          spiderfiedGroup.events.map((event, i) => {
            const pos = spiderPositions[i]
            if (!pos) return null
            const sportIcon =
              sports.find((s) => s.key.toUpperCase() === event.sport.toUpperCase())?.icon || '🎯'
            const spotsLeft =
              event.maxAttendees > 0 ? event.maxAttendees - event.attendeeCount : null
            const isFull = spotsLeft !== null && spotsLeft <= 0

            return (
              <Marker
                key={`spider-${event.id}`}
                longitude={pos.lng}
                latitude={pos.lat}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation()
                  onSelectEvent(event)
                }}
              >
                <div className="flex flex-col items-center gap-1 animate-in zoom-in-75 duration-200">
                  <div
                    className={clsx(
                      'flex cursor-pointer items-center justify-center rounded-full border-2 shadow-md transition-all active:scale-95',
                      selectedEvent?.id === event.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-indigo-200'
                        : 'border-white bg-white shadow-slate-200'
                    )}
                    style={{ width: 36, height: 36 }}
                  >
                    <span className="text-lg leading-none">{sportIcon}</span>
                  </div>
                  {mode === 'events' && spotsLeft !== null && (
                    <span
                      className={clsx(
                        'whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm',
                        isFull ? 'bg-orange-500 text-white' : 'bg-[#aaee44] text-slate-900'
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
              <button onClick={() => onClickDetail(selectedEvent)} className="block w-full text-left">
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
            <Link to={`/venues/${selectedEvent.venueId}`} className="block">
              <div className="flex items-center gap-5 rounded-[36px] bg-white p-6 shadow-[0_24px_60px_rgba(15,41,77,0.18)] ring-1 ring-black/5 transition-transform active:scale-95">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-slate-50 shadow-sm ring-1 ring-slate-100">
                  {selectedEvent.heroImageUrl ? (
                    <img src={selectedEvent.heroImageUrl} alt="" className="h-full w-full object-cover" />
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

// ─── Single event marker ────────────────────────────────────────────────────

function SingleMarker({
  event,
  sports,
  mapZoom,
  isSelected,
  mode,
  onClick,
}: {
  event: PlayerEvent
  sports: Array<{ key: string; label: string; icon?: string | null }>
  mapZoom: number
  isSelected: boolean
  mode: string
  onClick: (e: { originalEvent: MouseEvent }) => void
}) {
  const sportIcon = sports.find((s) => s.key.toUpperCase() === event.sport.toUpperCase())?.icon || '🎯'
  const baseSize = Math.max(30, Math.min(46, Math.round(30 + (mapZoom - 10) * 3)))
  const size = isSelected ? baseSize + 4 : baseSize
  const iconSize = Math.max(18, Math.round(size * 0.52))
  const spotsLeft = event.maxAttendees > 0 ? event.maxAttendees - event.attendeeCount : null
  const isFull = spotsLeft !== null && spotsLeft <= 0

  const content =
    mode === 'venues' ? (
      event.location.logo_url ? (
        <img src={event.location.logo_url} className="h-full w-full object-cover" />
      ) : (
        <Building2 className="h-6 w-6 text-slate-300" />
      )
    ) : (
      sportIcon
    )

  return (
    <Marker
      longitude={event.location.lng!}
      latitude={event.location.lat!}
      anchor="bottom"
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-1">
        <div
          className={clsx(
            'flex cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 shadow-sm backdrop-blur-sm transition-all',
            isSelected
              ? 'z-10 scale-110 border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 outline outline-indigo-200/50'
              : 'border-white bg-white/90 shadow-slate-200'
          )}
          style={{ width: size, height: size }}
        >
          <span
            className="flex h-full w-full items-center justify-center leading-none"
            style={{ fontSize: iconSize }}
          >
            {content}
          </span>
        </div>
        {mode === 'events' && spotsLeft !== null && (
          <span
            className={clsx(
              'whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold shadow-sm',
              isFull ? 'bg-orange-500 text-white' : 'bg-[#aaee44] text-slate-900'
            )}
          >
            {isFull ? 'Full' : spotsLeft === 1 ? '1 spot' : `${spotsLeft} spots`}
          </span>
        )}
      </div>
    </Marker>
  )
}
