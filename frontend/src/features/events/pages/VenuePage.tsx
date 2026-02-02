import { useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { MapPin, Navigation } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { zhTW } from 'date-fns/locale'

import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { PlayerEvent } from '@/types'
import { EventCard } from '@/features/events/components/EventCard'

export function VenuePage() {
  const { venueId } = useParams<{ venueId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  
  const { events, fetchEvents } = useEventsStore()
  
  // Derived state
  const venueEvents = useMemo(() => {
    if (!venueId) return []
    const decodedName = decodeURIComponent(venueId)
    // Filter active events at this venue
    return events.filter(e => {
      return (e.location?.name === decodedName || e.location?.address?.includes(decodedName))
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [events, venueId])
  
  const venueInfo = useMemo(() => {
    if (venueEvents.length > 0) return venueEvents[0].location
    return location.state?.venueInfo || { name: decodeURIComponent(venueId || ''), address: '載入中...' }
  }, [venueEvents, venueId, location.state])

  useEffect(() => {
    fetchEvents() 
  }, [fetchEvents])

  // Group by Date
  const groupedEvents = useMemo(() => {
    const groups: { label: string, events: PlayerEvent[] }[] = []
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    venueEvents.forEach(event => {
       const date = new Date(event.startTime)
       let label = format(date, 'M/d (EEE)', { locale: zhTW })
       if (isSameDay(date, today)) label = '今天'
       if (isSameDay(date, tomorrow)) label = '明天'
       
       let group = groups.find(g => g.label === label)
       if (!group) {
         group = { label, events: [] }
         groups.push(group)
       }
       group.events.push(event)
    })
    return groups
  }, [venueEvents])
  
  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`)
  }

  // Address Navigation
  const openMaps = () => {
    const q = venueInfo.address || venueInfo.name
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <ActionToolbar 
        title={venueInfo.name}
        onBack={() => navigate(-1)} 
        showShare={false}
        showFavorite={false}
      />
      
      {/* 🧱 Section 1: Basic Info */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{venueInfo.name}</h1>
        <div className="mt-2 flex items-start gap-2 text-slate-600">
           <div className="flex items-center gap-1">
             <Navigation className="h-4 w-4" />
             <span className="text-sm font-medium">1.2 km</span> 
           </div>
           <span className="text-slate-300">|</span>
           <button onClick={openMaps} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
             <MapPin className="h-4 w-4" />
             {venueInfo.address || '查看地圖'}
           </button>
        </div>
      </div>

      {/* 🧱 Section 2: Activities */}
      <div className="px-4 py-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">場館開放時段</h2>
        
        {groupedEvents.length === 0 ? (
          <div className="rounded-xl bg-white py-10 text-center text-slate-500 shadow-sm">
            <p>目前無開放時段</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedEvents.map(group => (
              <div key={group.label} className="space-y-3">
                <h3 className="sticky top-[60px] z-10 bg-slate-50/95 py-2 text-sm font-bold text-slate-500 backdrop-blur">
                  {group.label}
                </h3>
                <div className="space-y-3">
                  {group.events.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onViewDetails={handleEventClick}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

       {/* Claim Venue CTA */}
       <div className="mx-4 mb-8 mt-4 rounded-xl border border-slate-200 bg-slate-100 p-4 text-center">
          <p className="text-sm text-slate-600">
            這是您的場館嗎？
          </p>
          <button 
             onClick={() => { alert('即將推出：場館認領功能') }}
             className="mt-2 text-sm font-bold text-blue-600 underline"
          >
            認領此頁面以管理官方時段
          </button>
       </div>

       <div className="safe-area-bottom h-10" />
    </div>
  )
}
