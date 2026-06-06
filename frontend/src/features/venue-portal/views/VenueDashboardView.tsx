import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, PersonStanding, Calendar, Building2, Sparkles, Users } from 'lucide-react';
import { VenueBottomNav } from '../components/VenueBottomNav';
import { ManagedVenue, VenueDashboardData } from '../services/venuePortalService';
import { VenuePortalHeader } from '../components/VenuePortalHeader';

interface VenueDashboardViewProps {
  loading: boolean;
  venues: ManagedVenue[];
  selectedVenueId: string | null;
  setSelectedVenueId: (id: string) => void;
  dashboardData: VenueDashboardData | null;
}

export function VenueDashboardView({
  loading,
  venues,
  selectedVenueId,
  setSelectedVenueId,
  dashboardData,
}: VenueDashboardViewProps) {
  const navigate = useNavigate();

  if (loading && venues.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pb-20">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-sm font-medium text-slate-500">Loading your venue...</div>
      </div>
    );
  }

  const venueName = dashboardData 
    ? dashboardData.venue.name_display 
    : (venues.length > 0 ? venues[0].name_display : 'My Venue');

  const leftAction = venues.length > 1 ? (
    <div className="relative">
      <select 
          value={selectedVenueId || ''}
          onChange={(e) => setSelectedVenueId(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
          title="Switch Venue"
      >
        {venues.map(v => (
          <option key={v.id} value={v.id}>{v.name_display}</option>
        ))}
      </select>
      <button className="text-slate-900 border-[1.5px] border-slate-900 rounded-[6px] w-[26px] h-[26px] flex items-center justify-center pointer-events-none">
        <Plus className="w-[18px] h-[18px] stroke-[2.5]" />
      </button>
    </div>
  ) : null;

  return (
    <div className="mx-auto min-h-screen w-full max-w-screen-md bg-slate-50 pb-20 text-slate-900 border-x border-slate-100">
        <VenuePortalHeader
        title="Venue Dashboard"
        subtitle={venueName}
        leftAction={
          <button
            onClick={() => navigate('/profile')}
            className="flex min-w-[48px] flex-col items-center justify-center gap-0.5 text-center text-[8px] font-black uppercase tracking-widest text-indigo-500"
          >
            <PersonStanding className="h-5 w-5" /> Me
          </button>
        }
        rightAction={
          <button
            onClick={() =>
              dashboardData && window.open(`/venues/${dashboardData.venue.id}`, '_blank')
            }
            className="flex min-w-[48px] flex-col items-center justify-center gap-0.5 text-center text-[8px] font-black uppercase tracking-widest text-indigo-500"
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
            <div className="px-1 flex items-center justify-between mt-2">
               <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Venue Insights</h2>
               <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Last 7 Days</span>
            </div>

            {/* Stats Grid 2x2 */}
            <div className="grid grid-cols-2 gap-4">
              {/* Row 1: Lifetime Stats */}
              <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-start relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Calendar className="w-8 h-8 text-slate-900" />
                </div>
                <div className="text-3xl font-black tracking-tighter text-slate-900 leading-none mb-1">
                  {dashboardData.stats.sessions_completed}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Events Completed</div>
              </div>

              <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-start relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Building2 className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="text-3xl font-black tracking-tighter text-indigo-600 leading-none mb-1">
                  {dashboardData.stats.players_played_here}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Players</div>
              </div>

              {/* Row 2: Current Status */}
              <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-start relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Sparkles className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="text-3xl font-black tracking-tighter text-emerald-600 leading-none mb-1">
                  {dashboardData.stats.active_events}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Events Active</div>
              </div>

              <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-start relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-black tracking-tighter text-purple-600 leading-none mb-1">
                  {dashboardData.stats.participants_this_week}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Players Weekly</div>
              </div>
            </div>


          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 mt-4 rounded-[2.5rem] bg-white border border-dashed border-slate-200">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-purple-400 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">
              Preparing dashboard
            </p>
          </div>
        )}
      </div>

      <VenueBottomNav venueId={selectedVenueId} />
    </div>
  );
}
