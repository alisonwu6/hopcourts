import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Building2, ChevronRight } from 'lucide-react'
import { PlayerEvent } from '@/types'

export function VenueListPageContent({ events }: { events: PlayerEvent[] }) {
  const navigate = useNavigate()

  const venues = useMemo(() => {
    const map = new Map<string, { name: string; address: string; activeEvents: number }>()
    
    events.forEach(event => {
       const locName = event.location?.name || 'Unknown Venue'
       const locAddress = event.location?.address || ''
       
       if (!map.has(locName)) {
         map.set(locName, { name: locName, address: locAddress, activeEvents: 0 })
       }
       
       const venue = map.get(locName)!
       venue.activeEvents += 1
    })

    return Array.from(map.values()).sort((a, b) => b.activeEvents - a.activeEvents)
  }, [events])

  return (
      <div className="px-4 space-y-4">
        {venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-slate-400">
            <Building2 className="mb-2 h-10 w-10 opacity-20" />
            <p>目前無開放場館</p>
          </div>
        ) : (
          venues.map((venue) => (
            <button
              key={venue.name}
              onClick={() => navigate(`/venue/${encodeURIComponent(venue.name)}`)}
              className="group relative mb-4 flex w-full items-center justify-between overflow-hidden rounded-[28px] border border-slate-100 bg-white p-5 text-left shadow-[0_20px_45px_rgba(15,41,77,0.08)] transition-all active:scale-[0.98]"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                     <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 line-clamp-1">{venue.name}</h3>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-0.5">
                       <MapPin className="h-3 w-3" />
                       <span className="line-clamp-1">{venue.address}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <div className="text-right">
                    <span className="block text-lg font-bold text-blue-600">{venue.activeEvents}</span>
                    <span className="text-[10px] text-slate-400">個時段</span>
                 </div>
                 <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:text-blue-500" />
              </div>
            </button>
          ))
        )}
      </div>
  )
}
