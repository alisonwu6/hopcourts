import { useMemo, useEffect, useRef } from 'react'
import Map, { Marker, NavigationControl, Popup, MapRef } from 'react-map-gl/mapbox'
import { Calendar, ChevronRight, MapPin, X } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'
import { PlayerEvent } from '@/types'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

interface EventMapProps {
  events: PlayerEvent[]
  sports: Array<{ key: string; label: string; icon?: string | null }>
  selectedEventId?: string | null
  onSelectEvent: (event: PlayerEvent | null) => void
}

export function EventMap({ events, sports, selectedEventId, onSelectEvent }: EventMapProps) {
  const token = import.meta.env.VITE_MAPBOX_TOKEN
  const mapRef = useRef<MapRef>(null)
  
  const selectedEvent = useMemo(() => 
    selectedEventId ? events.find(e => e.id === selectedEventId) || null : null,
  [events, selectedEventId])

  // Calculate generic center or use Taipei
  const initialViewState = {
     longitude: 121.5654,
     latitude: 25.0330,
     zoom: 11
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          mapRef.current?.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 13,
            duration: 2000
          })
        },
        () => {
          // console.log('Location access denied or error')
        }
      )
    }
  }, [])

  // Filter events with valid coordinates
  const validEvents = useMemo(() => 
    events.filter(e => e.location.lat && e.location.lng),
  [events])

  if (!token) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-500">
        Map configuration missing (VITE_MAPBOX_TOKEN)
      </div>
    )
  }

  return (
    <div className="absolute inset-0 top-[80px] z-0 h-[calc(100vh-80px)] w-full"> 
      {/* Adjust top to match header height, approx 80px-100px */}
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
          const sportIcon = sports.find(s => s.key === event.sport)?.icon || '🏅'
          const isSelected = selectedEvent?.id === event.id
          
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
              <div 
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110 ${isSelected ? 'bg-slate-900 scale-110 z-10' : 'bg-white'}`}
              >
                 <span className="text-xl leading-none">{sportIcon}</span>
              </div>
            </Marker>
          )
        })}
      </Map>

      {/* Bottom Floating Card */}
      {selectedEvent && (
        <div 
          className="fixed left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300"
          style={{ bottom: 'calc(68px + env(safe-area-inset-bottom, 0px) + 10px)' }}
        >
          <Link 
            to={`/event/${selectedEvent.id}`}
            className="block"
          >
            <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 active:scale-[0.98] transition-transform">
              {/* Image / Icon Placeholder */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                 {selectedEvent.heroImageUrl ? (
                   <img src={selectedEvent.heroImageUrl} alt="" className="h-full w-full object-cover" />
                 ) : (
                   <span className="text-2xl">{sports.find(s => s.key === selectedEvent.sport)?.icon || '🏟️'}</span>
                 )}
              </div>
              
              <div className="flex-1 min-w-0">
                 <h3 className="text-lg font-bold text-slate-900 truncate">{selectedEvent.title}</h3>
                 
                 <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                      {sports.find(s => s.key === selectedEvent.sport)?.label || selectedEvent.sport}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 truncate max-w-[100px]">
                      {selectedEvent.location.name}
                    </span>
                    {!selectedEvent.isFree && (
                       <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600">
                          付費
                       </span>
                    )}
                 </div>
              </div>
              
              <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
