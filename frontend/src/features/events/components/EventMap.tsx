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
          className="fixed left-6 right-6 z-50 transition-all duration-500 animate-in slide-in-from-bottom-8 fade-in"
          style={{ bottom: 'calc(68px + env(safe-area-inset-bottom, 0px) + 20px)' }}
        >
          <Link 
            to={selectedEvent.venueId && selectedEvent.id.toString().startsWith('venue-') 
              ? `/venues/${selectedEvent.venueId}` 
              : `/event/${selectedEvent.id}`
            } 
            className="block"
          >
            <div className="flex items-center gap-5 rounded-[36px] bg-white p-6 shadow-[0_24px_60px_rgba(15,41,77,0.18)] ring-1 ring-black/5 transition-transform active:scale-95">
              {/* Image / Icon */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-slate-50 shadow-sm ring-1 ring-slate-100">
                {selectedEvent.heroImageUrl ? (
                  <img
                    src={selectedEvent.heroImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-slate-300">🏟️</span>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-[22px] font-extrabold text-slate-900 tracking-tight">
                    {selectedEvent.title}
                  </h3>
                  {(selectedEvent as any).status === 'claimed' && (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current text-white">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    </div>
                  )}
                </div>

                <p className="text-[14px] font-semibold text-slate-400">
                  今天有 {(selectedEvent as any).activeSessionsCount || 0} 個活動正在進行中
                </p>
                
                {(selectedEvent as any).status === 'claimed' && (
                  <span className="inline-block rounded-lg bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600">
                    官方認證場館
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center p-1">
                <ChevronRight className="h-7 w-7 text-slate-200" />
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
