import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Map as MapIcon, List as ListIcon } from 'lucide-react'
import clsx from 'clsx'

import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { useSports } from '@/features/dictionaries/hooks'
import { PageLoading } from '@/components/PageLoading'
import { EventMap } from '@/features/events/components/EventMap'
import { VenueListPageContent } from './VenueListPageContent'

export function VenueListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { events, fetchEvents, isLoading } = useEventsStore()
  const { items: sportsCatalog } = useSports('zh')
  
  // Default to Map view unless explicit list view requested
  const isListView = searchParams.get('view') === 'list'
  const showMap = !isListView 

  const toggleView = () => {
    setSearchParams(prev => {
      if (showMap) prev.set('view', 'list')
      else prev.delete('view')
      return prev
    }, { replace: true })
  }

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Derive "Venue Events" (Representative event for each venue to show on Map)
  // We want one marker per venue. 
  // Map expects PlayerEvent[]. We can pick the first active event of each venue as the "representative".
  const venueRepresentativeEvents = useMemo(() => {
     const venueMap = new Map<string, any>()
     
     events.forEach(event => {
       // Filter out events without coordinates for map
       if (!event.location?.lat || !event.location?.lng) return
       
       const key = `${event.location.lat},${event.location.lng}`
       if (!venueMap.has(key)) {
         venueMap.set(key, event)
       }
     })
     
     return Array.from(venueMap.values())
  }, [events])

  if (isLoading && events.length === 0) {
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
                <span className="text-sm font-bold text-slate-900">開始搜尋</span>
                <span className="text-xs font-medium text-slate-500">任何時間・任何運動</span>
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
              events={venueRepresentativeEvents} 
              sports={sportsCatalog}
              onSelectEvent={(e) => {
                 // When clicking a pin, navigate to that venue page
                 if (e && e.location?.name) {
                    navigate(`/venue/${encodeURIComponent(e.location.name)}`)
                 }
              }}
            />
         </div>
       ) : (
         <div className="pt-24 pb-[100px]">
            <VenueListPageContent events={events} />
         </div>
       )}
    </div>
  )
}
