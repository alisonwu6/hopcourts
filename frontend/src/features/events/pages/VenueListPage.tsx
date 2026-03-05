import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Map as MapIcon, List as ListIcon } from 'lucide-react'
import clsx from 'clsx'

import { useSports } from '@/features/dictionaries/hooks'
import { PageLoading } from '@/components/PageLoading'
import { EventMap } from '@/features/events/components/EventMap'
import { venuesService, ApiVenue } from '@/features/venues/services/venuesService'

// Adapter to make ApiVenue compatible with EventMap logic
// Adapter to make ApiVenue compatible with EventMap logic
const mapVenueToEventStub = (venue: ApiVenue): any => ({
  id: `venue-${venue.id}`,
  venueId: venue.id,
  title: venue.name_display,
  sport: '🏟️', 
  startTime: new Date(), 
  heroImageUrl: venue.logo_url, // Use logo or a default
  location: {
    name: venue.name_display,
    address: venue.address_display,
    lat: Number(venue.lat),
    lng: Number(venue.lng),
    status: venue.status,
    logo_url: venue.logo_url
  },
  status: venue.status,
  activeSessionsCount: venue.active_sessions_count
})

export function VenueListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [venues, setVenues] = useState<ApiVenue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null)
  const { items: sportsCatalog } = useSports('zh')
  
  // Default to List view unless explicit map view requested
  const isMapView = searchParams.get('view') === 'map'
  const showMap = isMapView

  const toggleView = () => {
    setSearchParams(prev => {
      if (showMap) prev.delete('view')
      else prev.set('view', 'map')
      return prev
    }, { replace: true })
  }

  useEffect(() => {
    const fetchVenues = async () => {
      setIsLoading(true)
      const res = await venuesService.listVenues({ limit: 100 })
      if (res.success && res.data) {
        setVenues(res.data.data) // PaginatedResponse.data is the array
      }
      setIsLoading(false)
    }
    fetchVenues()
  }, [])

  // Adapting venues for the map
  const venueMarkers = useMemo(() => {
     return venues.map(mapVenueToEventStub)
  }, [venues])

  if (isLoading && venues.length === 0) {
    return <PageLoading />
  }

  return (
    <div className="relative min-h-screen bg-slate-50">
       {/* Top Search Bar & Toggle (Floating) */}
       <div 
         className={clsx(
           "fixed left-0 right-0 top-0 z-40 mx-auto w-full max-w-md p-4 transition-all duration-300",
           showMap ? "pointer-events-none" : "bg-white/95 backdrop-blur pointer-events-auto"
         )}
       >
         <div className="flex w-full items-center gap-3">
           {/* Search Input (Mock for now, just visual as per screenshot) */}
           <button 
             className="flex flex-1 items-center gap-1 rounded-full border border-slate-200 bg-white p-3 shadow-sm transition pointer-events-auto active:scale-95"
             // onClick={() => {}} // Open search modal if implemented
           >
             <Search className="ml-2 h-5 w-5 text-slate-800" strokeWidth={2.5} />
             <div className="flex flex-col items-start px-1">
                <span className="text-sm font-bold text-slate-900">Start Searching</span>
                <span className="text-xs font-medium text-slate-500">Search venues...</span>
             </div>
           </button>

           {/* View Toggle */}
           <button
             onClick={toggleView}
             className="flex h-[58px] w-[58px] flex-none items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition pointer-events-auto hover:bg-slate-50 active:scale-95"
           >
             {showMap ? (
               <ListIcon className="h-6 w-6 text-slate-700" />
             ) : (
               <MapIcon className="h-6 w-6 text-slate-700" />
             )}
           </button>
         </div>
       </div>

       {/* Content Area */}
       {showMap ? (
         <div className="h-screen w-full">
            <EventMap 
              events={venueMarkers} 
              sports={sportsCatalog}
              mode="venues"
              selectedEventId={selectedVenueId}
              onSelectEvent={(e) => setSelectedVenueId(e?.id || null)}
            />
         </div>
       ) : (
         <div className="pt-24 pb-[100px] px-4">
             {/* Simple list view for venues (Placeholder until VenueListContent adaptable) */}
            <div className="space-y-4">
              {venues.map(v => (
                <div key={v.id} onClick={() => navigate(`/venues/${v.id}`)} className="cursor-pointer rounded-xl bg-white p-4 shadow-sm">
                   <h3 className="font-bold text-slate-900">{v.name_display}</h3>
                   <p className="text-sm text-slate-500">{v.address_display}</p>
                   <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${v.status==='claimed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                         {v.status === 'claimed' ? 'Official' : 'Unclaimed'}
                      </span>
                   </div>
                </div>
              ))}
            </div>
         </div>
       )}
    </div>
  )
}
