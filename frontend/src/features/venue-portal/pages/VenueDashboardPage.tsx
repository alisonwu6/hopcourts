import { useEffect, useState } from 'react'
import { venuePortalService, ManagedVenue, VenueDashboardData } from '../services/venuePortalService'
import { Link, useNavigate } from 'react-router-dom'

export function VenueDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [venues, setVenues] = useState<ManagedVenue[]>([])
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<VenueDashboardData | null>(null)

  useEffect(() => {
    fetchMyVenues()
  }, [])

  useEffect(() => {
    if (selectedVenueId) {
      fetchVenueDashboard(selectedVenueId)
    }
  }, [selectedVenueId])

  const fetchMyVenues = async () => {
    setLoading(true)
    const res = await venuePortalService.getMyVenues()
    if (res.success && res.data && res.data.length > 0) {
      setVenues(res.data)
      // Auto-select first one for now
      setSelectedVenueId(res.data[0].id)
    }
    setLoading(false)
  }

  const fetchVenueDashboard = async (id: string) => {
    const res = await venuePortalService.getVenueDashboard(id)
    if (res.success && res.data) {
      setDashboardData(res.data)
    }
  }

  if (loading && venues.length === 0) {
    return <div className="p-8 text-center text-slate-500">Loading your portal...</div>
  }



  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/30">VP</div>
            <h1 className="font-bold text-slate-800 tracking-tight">Venue Portal</h1>
        </div>
        
        {/* Venue Switcher if multiple */}
        {venues.length > 1 && (
            <select 
                value={selectedVenueId || ''}
                onChange={(e) => setSelectedVenueId(e.target.value)}
                className="bg-slate-100 border-none rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
                {venues.map(v => (
                    <option key={v.id} value={v.id}>{v.name_display}</option>
                ))}
            </select>
        )}
         {venues.length === 1 && (
            <div className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded hidden md:block">
                {venues[0].name_display}
            </div>
         )}
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {dashboardData ? (
            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-slate-900">{dashboardData.venue.name_display}</h2>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full border border-green-200">
                                Official
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm flex items-center gap-1">
                            📍 {dashboardData.venue.address_display}
                        </p>
                    </div>
                    <Link 
                        to={`/venues/${dashboardData.venue.id}`} 
                        target="_blank"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-blue-100 flex items-center gap-1.5"
                    >
                        View Public Venue Page <span className="text-base">↗</span>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Active Events</div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-4xl font-bold text-indigo-600">{dashboardData.stats.active_events}</div>
                            <div className="text-xs text-slate-400">Published</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Participants This Week</div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-4xl font-bold text-slate-900">{dashboardData.stats.participants_this_week}</div>
                            <div className="text-xs text-slate-400">Total</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Players Played Here</div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-4xl font-bold text-emerald-600 font-mono">{dashboardData.stats.players_played_here}</div>
                            <div className="text-xs text-slate-400">Total Players</div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Create Event (One-off) */}
                    <div 
                        onClick={() => selectedVenueId && navigate(`/venue-portal/${selectedVenueId}/sessions/create`)}
                        className="bg-white rounded-xl p-6 border border-slate-200 group cursor-pointer hover:border-indigo-300 hover:shadow-lg hover:bg-slate-50/50 transition-all duration-300 flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">✨</div>
                            <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">Create Event</h3>
                            <p className="text-slate-500 text-sm mb-4">Create a one-off special event or session outside your regular schedule.</p>
                        </div>
                        <div className="text-right">
                             <button
                                onClick={(e) => { e.stopPropagation(); selectedVenueId && navigate(`/venue-portal/${selectedVenueId}/sessions/create`) }}
                                className="text-slate-400 group-hover:text-indigo-600 text-sm font-bold flex items-center justify-end gap-1 ml-auto transition-colors"
                             >
                                Create Now <span className="text-lg leading-none">&rarr;</span>
                             </button>
                         </div>
                    </div>

                    {/* Manage Weekly Schedule (CORE) */}
                    <div 
                        onClick={() => selectedVenueId && navigate(`/venue-portal/${selectedVenueId}/schedule`)}
                        className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-6 text-white overflow-hidden relative group cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
                    >
                        <div className="absolute right-0 top-0 p-8 opacity-10 text-9xl leading-none font-black select-none pointer-events-none">
                            📅
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-xl mb-2">Manage Weekly Schedule</h3>
                                <p className="text-indigo-100 text-sm mb-6">Set your recurring weekly rules. The system will auto-generate sessions for players to join.</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); selectedVenueId && navigate(`/venue-portal/${selectedVenueId}/schedule`) }}
                                className="bg-white text-indigo-700 hover:bg-indigo-50 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-lg w-fit"
                            >
                                Set Schedule
                            </button>
                        </div>
                    </div>

                    {/* Edit Venue Profile */}
                    <div 
                        onClick={() => selectedVenueId && navigate(`/venue-portal/${selectedVenueId}/profile`)}
                        className="bg-white rounded-xl p-6 border border-slate-200 group cursor-pointer hover:border-indigo-300 hover:shadow-lg hover:bg-slate-50/50 transition-all duration-300 flex flex-col justify-between"
                    >
                         <div>
                            <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">⚙️</div>
                            <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">Edit Venue Profile</h3>
                            <p className="text-slate-500 text-sm mb-4">Upload logo and cover image, and set detailed facility info.</p>
                         </div>
                         <div className="text-right">
                             <button
                                onClick={(e) => { e.stopPropagation(); selectedVenueId && navigate(`/venue-portal/${selectedVenueId}/profile`) }}
                                className="text-slate-400 group-hover:text-indigo-600 text-sm font-bold flex items-center justify-end gap-1 ml-auto transition-colors"
                             >
                                Go to Settings <span className="text-lg leading-none">&rarr;</span>
                             </button>
                         </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="py-32 flex flex-col items-center justify-center text-slate-300">
                <div className="animate-pulse mb-4 text-4xl">🏟️</div>
                <div className="text-sm font-medium">Loading Venue Data...</div>
            </div>
        )}
      </main>
    </div>
  )
}
