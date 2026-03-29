import { useMemo, useEffect, useRef, useState } from 'react'
import Map, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl/mapbox'
import {
  Building2,
  Calendar,
  MapPin,
  PersonStanding,
  CircleDollarSign,
  ChartColumnIncreasing,
} from 'lucide-react'
import clsx from 'clsx'
import 'mapbox-gl/dist/mapbox-gl.css'
import { PlayerEvent } from '@/types'
import { Link } from 'react-router-dom'

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

  // Default center before geolocation (Brisbane)
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
        () => {
          // console.log('Location access denied or error')
        }
      )
    }
  }, [])

  // Filter events with valid coordinates
  const validEvents = useMemo(
    () => events.filter((e) => e.location.lat && e.location.lng),
    [events]
  )
  const selectedSportIcon = useMemo(() => {
    if (!selectedEvent) return '🎯'
    return (
      sports.find((s) => s.key.toUpperCase() === selectedEvent.sport.toUpperCase())?.icon || '🎯'
    )
  }, [selectedEvent, sports])
  const selectedSportLabel = useMemo(() => {
    if (!selectedEvent) return ''
    return (
      sports.find((s) => s.key.toUpperCase() === selectedEvent.sport.toUpperCase())?.label ||
      selectedEvent.sport
    )
  }, [selectedEvent, sports])
  const selectedSkillLabel = useMemo(() => {
    if (!selectedEvent) return ''
    switch (selectedEvent.skillLevel) {
      case 'beginner':
        return 'Beginner'
      case 'intermediate':
        return 'Intermediate'
      case 'advanced':
        return 'Advanced'
      default:
        return 'All levels'
    }
  }, [selectedEvent])
  const selectedGenderLabel = useMemo(() => {
    if (!selectedEvent) return ''
    if (selectedEvent.gender === 'female') return 'Women only'
    if (selectedEvent.gender === 'male') return 'Men only'
    return 'Mixed gender'
  }, [selectedEvent])
  const selectedLocation = useMemo(() => {
    if (!selectedEvent) return { line1: '', line2: '' }
    const name = selectedEvent.location.name || ''
    const address = selectedEvent.location.address || ''
    if (name && address && name !== address) {
      return { line1: name, line2: address }
    }
    const fallback = name || address || 'Location TBD'
    return { line1: fallback, line2: '' }
  }, [selectedEvent])
  const selectedPriceLabel = useMemo(() => {
    if (!selectedEvent) return ''
    if (selectedEvent.isFree) return 'Free'
    return `${selectedEvent.priceRange || `$${selectedEvent.pricePerPerson}`} /person`
  }, [selectedEvent])

  const selectedTimeLabel = useMemo(() => {
    if (!selectedEvent) return ''
    const start = new Date(selectedEvent.startTime)
    const end = new Date(selectedEvent.endTime)
    const dateLabel = start.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    const startWithSuffix = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    const endWithSuffix = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    const startSuffix = startWithSuffix.match(/\s(AM|PM)$/)?.[1] ?? ''
    const endSuffix = endWithSuffix.match(/\s(AM|PM)$/)?.[1] ?? ''
    const startCore = startWithSuffix.replace(/\s(AM|PM)$/, '')
    const endCore = endWithSuffix.replace(/\s(AM|PM)$/, '')
    const timeLabel =
      startSuffix && startSuffix === endSuffix
        ? `${startCore}–${endCore} ${endSuffix}`
        : `${startWithSuffix}–${endWithSuffix}`
    return `${dateLabel} · ${timeLabel}`
  }, [selectedEvent])
  const selectedAttendanceLabel = useMemo(() => {
    if (!selectedEvent) return ''
    const attendeeCount = selectedEvent.attendeeCount ?? 0
    const max = selectedEvent.maxAttendees ?? attendeeCount
    const remaining = Math.max(max - attendeeCount, 0)
    const minPeople = Math.max(1, selectedEvent.minPeople ?? 1)
    return `${attendeeCount} joined · ${remaining} spots left · Starts with ${minPeople} players`
  }, [selectedEvent])

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
        onClick={() => onSelectEvent(null)} // Click map to close card
      >
        <NavigationControl position="bottom-right" style={{ marginBottom: 100 }} />
        <GeolocateControl
          position="bottom-right"
          trackUserLocation
          showUserHeading
          style={{ marginBottom: 10 }}
        />
        {/* Move controls up to avoid overlap with card */}

        {validEvents.map((event) => {
          const isSelected = selectedEvent?.id === event.id
          const sportIcon =
            sports.find((s) => s.key.toUpperCase() === event.sport.toUpperCase())?.icon || '🎯'
          const baseMarkerSize = Math.max(30, Math.min(46, Math.round(30 + (mapZoom - 10) * 3)))
          const markerSize = isSelected ? baseMarkerSize + 4 : baseMarkerSize
          const iconSize = Math.max(18, Math.round(markerSize * 0.52))

          // Marker content based on mode
          const markerContent =
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
              key={event.id}
              longitude={event.location.lng!}
              latitude={event.location.lat!}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                onSelectEvent(event)
              }}
            >
              <div className="flex flex-col items-center">
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
              </div>
            </Marker>
          )
        })}
      </Map>

      {/* Bottom Floating Card */}
      {selectedEvent && (
        <div
          className="fixed left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8"
          style={{ bottom: 'calc(68px + env(safe-area-inset-bottom, 0px) + 20px)' }}
        >
          {onClickDetail ? (
            <button onClick={() => onClickDetail(selectedEvent)} className="block w-full text-left">
              <div className="flex items-center gap-5 rounded-[20px] bg-white p-6 shadow-[0_24px_60px_rgba(15,41,77,0.18)] ring-1 ring-black/5 transition-transform active:scale-95">
                {mode === 'events' ? (
                  <>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          <span>{selectedSportIcon}</span>
                          {selectedSportLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                          <ChartColumnIncreasing className="h-3 w-3" strokeWidth={2.5} />
                          {selectedSkillLabel}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-pink-100 bg-pink-50 px-2 py-0.5 text-[11px] font-medium text-pink-700">
                          {selectedGenderLabel}
                        </span>
                      </div>
                      <h3 className="truncate text-[22px] font-extrabold tracking-tight text-slate-900">
                        {selectedEvent.title}
                      </h3>
                      <div className="space-y-1">
                        <p className="flex items-center gap-3 text-sm font-normal text-slate-700">
                          <span className="flex h-5 w-5 items-center justify-center text-blue-600">
                            <Calendar className="h-4.5 w-4.5" strokeWidth={2.5} />
                          </span>
                          {selectedTimeLabel}
                        </p>
                        <div className="flex items-start gap-3 text-sm font-normal text-slate-700">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-blue-600">
                            <MapPin className="h-4.5 w-4.5" strokeWidth={2.5} />
                          </span>
                          <div className="min-w-0 leading-snug text-slate-700">
                            <p className="break-words">{selectedLocation.line1}</p>
                            {selectedLocation.line2 ? (
                              <p className="break-words">{selectedLocation.line2}</p>
                            ) : null}
                          </div>
                        </div>
                        <p className="flex items-center gap-3 text-sm font-normal text-slate-700">
                          <span className="flex h-5 w-5 items-center justify-center text-blue-600">
                            <PersonStanding className="h-5 w-5" strokeWidth={2.5} />
                          </span>
                          {selectedAttendanceLabel}
                        </p>
                        <p className="flex items-center gap-3 text-sm font-normal text-slate-700">
                          <span className="flex h-5 w-5 items-center justify-center text-blue-600">
                            <CircleDollarSign className="h-4.5 w-4.5" strokeWidth={2.5} />
                          </span>
                          {selectedPriceLabel}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-[22px] font-extrabold tracking-tight text-slate-900">
                          {selectedEvent.title}
                        </h3>
                      </div>
                      <p className="text-[14px] font-semibold text-slate-400">
                        {(selectedEvent as any).activeSessionsCount || 0} events live today
                      </p>
                    </div>
                  </>
                )}
              </div>
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
              <div className="flex items-center gap-5 rounded-[36px] bg-white p-6 shadow-[0_24px_60px_rgba(15,41,77,0.18)] ring-1 ring-black/5 transition-transform active:scale-95">
                {mode === 'events' ? (
                  <>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          <span>{selectedSportIcon}</span>
                          {selectedSportLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                          <ChartColumnIncreasing className="h-3 w-3" strokeWidth={2.5} />
                          {selectedSkillLabel}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-pink-100 bg-pink-50 px-2 py-0.5 text-[11px] font-medium text-pink-700">
                          {selectedGenderLabel}
                        </span>
                      </div>
                      <h3 className="truncate text-[22px] font-extrabold tracking-tight text-slate-900">
                        {selectedEvent.title}
                      </h3>
                      <div className="space-y-1">
                        <p className="flex items-center gap-3 text-sm font-normal text-slate-700">
                          <span className="flex h-5 w-5 items-center justify-center text-blue-600">
                            <Calendar className="h-4.5 w-4.5" strokeWidth={2.5} />
                          </span>
                          {selectedTimeLabel}
                        </p>
                        <div className="flex items-start gap-3 text-sm font-normal text-slate-700">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-blue-600">
                            <MapPin className="h-4.5 w-4.5" strokeWidth={2.5} />
                          </span>
                          <div className="min-w-0 leading-snug text-slate-700">
                            <p className="break-words">{selectedLocation.line1}</p>
                            {selectedLocation.line2 ? (
                              <p className="break-words">{selectedLocation.line2}</p>
                            ) : null}
                          </div>
                        </div>
                        <p className="flex items-center gap-3 text-sm font-normal text-slate-700">
                          <span className="flex h-5 w-5 items-center justify-center text-blue-600">
                            <PersonStanding className="h-5 w-5" strokeWidth={2.5} />
                          </span>
                          {selectedAttendanceLabel}
                        </p>
                        <p className="flex items-center gap-3 text-sm font-normal text-slate-700">
                          <span className="flex h-5 w-5 items-center justify-center text-blue-600">
                            <CircleDollarSign className="h-4.5 w-4.5" strokeWidth={2.5} />
                          </span>
                          {selectedPriceLabel}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-[22px] font-extrabold tracking-tight text-slate-900">
                          {selectedEvent.title}
                        </h3>
                      </div>
                      <p className="text-[14px] font-semibold text-slate-400">
                        {(selectedEvent as any).activeSessionsCount || 0} events live today
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
