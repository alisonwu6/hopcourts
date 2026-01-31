import { useMemo, useEffect, useRef } from 'react'
import Map, { Marker, NavigationControl, MapRef } from 'react-map-gl/mapbox'
import { ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import 'mapbox-gl/dist/mapbox-gl.css'
import { PlayerEvent } from '@/types'
import { Link } from 'react-router-dom'

interface EventMapProps {
  events: PlayerEvent[]
  sports: Array<{ key: string; label: string; icon?: string | null }>
  selectedEventId?: string | null
  onSelectEvent: (event: PlayerEvent | null) => void
  mode?: 'events' | 'venues'
}

export function EventMap({ events, sports, selectedEventId, onSelectEvent, mode = 'events' }: EventMapProps) {
  const token = import.meta.env.VITE_MAPBOX_TOKEN
  const mapRef = useRef<MapRef>(null)

  const selectedEvent = useMemo(
    () => (selectedEventId ? events.find((e) => e.id === selectedEventId) || null : null),
    [events, selectedEventId]
  )

  // Calculate generic center or use Taipei
  const initialViewState = {
    longitude: 121.5654,
    latitude: 25.033,
    zoom: 11,
  }

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
        onClick={() => onSelectEvent(null)} // Click map to close card
      >
        <NavigationControl position="bottom-right" style={{ marginBottom: 100 }} />
        {/* Move controls up to avoid overlap with card */}

        {validEvents.map((event) => {
          const isSelected = selectedEvent?.id === event.id
          const sportIcon = sports.find(s => s.key.toUpperCase() === event.sport.toUpperCase())?.icon || '🎯'

          // Marker content based on mode
          const markerContent = mode === 'venues' 
            ? (event.location.logo_url ? <img src={event.location.logo_url} className="h-full w-full object-cover" /> : '🏟️')
            : sportIcon

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
                    'flex h-11 w-11 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 shadow-sm transition-all backdrop-blur-sm',
                    isSelected 
                      ? 'z-10 scale-110 bg-indigo-50 border-indigo-500 shadow-indigo-200/50 shadow-md outline outline-2 outline-indigo-200/50' 
                      : 'bg-white/90 border-white shadow-slate-200'
                  )}
                >
                  <span className="text-2xl leading-none flex items-center justify-center h-full w-full">
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
          className="fixed left-4 right-4 z-50 duration-300 animate-in slide-in-from-bottom-4"
          style={{ bottom: 'calc(68px + env(safe-area-inset-bottom, 0px) + 10px)' }}
        >
          <Link 
            to={selectedEvent.venueId && selectedEvent.id.startsWith('venue-') 
              ? `/venues/${selectedEvent.venueId}` 
              : `/event/${selectedEvent.id}`
            } 
            className="block"
          >
            <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 transition-transform ">
              {/* Image / Icon Placeholder */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                {selectedEvent.heroImageUrl ? (
                  <img
                    src={selectedEvent.heroImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">
                    {sports.find((s) => s.key === selectedEvent.sport)?.icon || '🏟️'}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-bold text-slate-900">{selectedEvent.title}</h3>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                    {sports.find((s) => s.key === selectedEvent.sport)?.label ||
                      selectedEvent.sport}
                  </span>
                  <span className="max-w-[100px] truncate rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                    {selectedEvent.location.name}
                  </span>
                  {!selectedEvent.isFree && (
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600">
                      付費
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
