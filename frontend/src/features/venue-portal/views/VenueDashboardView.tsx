import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, PersonStanding, Calendar, Building2, Sparkles, Users } from 'lucide-react'
import { VenueBottomNav } from '../components/VenueBottomNav'
import { ManagedVenue, VenueDashboardData } from '../services/venuePortalService'
import { VenuePortalHeader } from '../components/VenuePortalHeader'

interface VenueDashboardViewProps {
  loading: boolean
  venues: ManagedVenue[]
  selectedVenueId: string | null
  setSelectedVenueId: (id: string) => void
  dashboardData: VenueDashboardData | null
}

export function VenueDashboardView({
  loading,
  venues,
  selectedVenueId,
  setSelectedVenueId,
  dashboardData,
}: VenueDashboardViewProps) {
  const navigate = useNavigate()

  if (loading && venues.length === 0) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-50 pb-20">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-venue-500 border-t-transparent"></div>
        <div className="text-sm font-medium text-slate-500">Loading your venue...</div>
      </div>
    )
  }

  const venueName = dashboardData
    ? dashboardData.venue.name_display
    : venues.length > 0
      ? venues[0].name_display
      : 'My Venue'

  const leftAction =
    venues.length > 1 ? (
      <div className="relative">
        <select
          value={selectedVenueId || ''}
          onChange={(e) => setSelectedVenueId(e.target.value)}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          title="Switch Venue"
        >
          {venues.map((v) => (
            <option
              key={v.id}
              value={v.id}
            >
              {v.name_display}
            </option>
          ))}
        </select>
        <button className="pointer-events-none flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border-[1.5px] border-slate-900 text-slate-900">
          <Plus className="h-[18px] w-[18px] stroke-[2.5]" />
        </button>
      </div>
    ) : null

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-screen-md border-x border-slate-100 bg-slate-50 pb-20 text-slate-900">
      <VenuePortalHeader
        title="Venue Dashboard"
        subtitle={venueName}
        leftAction={
          <button
            onClick={() => navigate('/profile')}
            className="flex min-w-[48px] flex-col items-center justify-center gap-0.5 text-center text-[8px] font-black uppercase tracking-widest text-venue-500"
          >
            <PersonStanding className="h-5 w-5" /> Profile
          </button>
        }
        rightAction={
          <button
            onClick={() => dashboardData && window.open(`/venues/${dashboardData.venue.id}`, '_blank')}
            className="flex min-w-[48px] flex-col items-center justify-center gap-0.5 text-center text-[8px] font-black uppercase tracking-widest text-venue-500"
          >
            <Building2 className="h-5 w-5" />
            Public ↗
          </button>
        }
      />

      <div className="px-6 py-8">
        {dashboardData ? (
          <div className="space-y-6">
            {/* Main Insights Header */}
            <div className="mt-2 flex items-center justify-between px-1">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Venue Insights</h2>
              <span className="rounded-full bg-venue-50 px-2 py-0.5 text-[9px] font-black uppercase text-venue-500">
                Last 7 Days
              </span>
            </div>

            {/* Stats Grid 2x2 */}
            <div className="grid grid-cols-2 gap-4">
              {/* Row 1: Lifetime Stats */}
              <div className="group relative flex flex-col items-start overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                <div className="absolute right-0 top-0 p-3 opacity-10 transition-opacity group-hover:opacity-20">
                  <Calendar className="h-8 w-8 text-slate-900" />
                </div>
                <div className="mb-1 text-3xl font-black leading-none tracking-tighter text-slate-900">
                  {dashboardData.stats.sessions_completed}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Events Completed</div>
              </div>

              <div className="group relative flex flex-col items-start overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                <div className="absolute right-0 top-0 p-3 opacity-10 transition-opacity group-hover:opacity-20">
                  <Building2 className="h-8 w-8 text-venue-600" />
                </div>
                <div className="mb-1 text-3xl font-black leading-none tracking-tighter text-venue-600">
                  {dashboardData.stats.players_played_here}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Players</div>
              </div>

              {/* Row 2: Current Status */}
              <div className="group relative flex flex-col items-start overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                <div className="absolute right-0 top-0 p-3 opacity-10 transition-opacity group-hover:opacity-20">
                  <Sparkles className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="mb-1 text-3xl font-black leading-none tracking-tighter text-emerald-600">
                  {dashboardData.stats.active_events}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Events Active</div>
              </div>

              <div className="group relative flex flex-col items-start overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                <div className="absolute right-0 top-0 p-3 opacity-10 transition-opacity group-hover:opacity-20">
                  <Users className="h-8 w-8 text-venue-600" />
                </div>
                <div className="mb-1 text-3xl font-black leading-none tracking-tighter text-venue-600">
                  {dashboardData.stats.participants_this_week}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Players Weekly</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-200 bg-white p-12">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-venue-400"></div>
            <p className="text-center text-sm font-black uppercase tracking-widest text-slate-400">
              Preparing dashboard
            </p>
          </div>
        )}
      </div>

      <VenueBottomNav venueId={selectedVenueId} />
    </div>
  )
}
