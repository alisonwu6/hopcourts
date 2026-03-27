import React from 'react';
import { PageLoading } from '@/components/PageLoading';
import { CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// Internal Components from components/
import { VenueScheduleHeader } from '../components/VenueScheduleHeader';
import { VenueCalendarGrid } from '../components/VenueCalendarGrid';
import { VenueRulesEditor } from '../components/VenueRulesEditor';
import { VenueSessionDrawer } from '../components/VenueSessionDrawer';
import { VenueBottomNav } from '../components/VenueBottomNav';

interface VenueScheduleViewProps {
    loading: boolean;
    saving: boolean;
    venueName?: string;
    viewMode: 'calendar' | 'template';
    setViewMode: (mode: 'calendar' | 'template') => void;
    showSuccess: boolean;
    selectedSession: any;
    setSelectedSession: (session: any) => void;
    showParticipants: boolean;
    setShowParticipants: (show: boolean) => void;
    isEditingSession: boolean;
    setIsEditingSession: (editing: boolean) => void;
    isCompact: boolean;
    setIsCompact: (compact: boolean) => void;
    generatedSessions: any[];
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    calendarDays: Date[];
    slots: any[];
    venueDefaults: any;
    setVenueDefaults: (defaults: any) => void;
    activeDay: number;
    setActiveDay: (day: number) => void;
    handleAddSlot: () => void;
    handleUpdateSlot: (id: string, updates: any) => void;
    handleDeleteSlot: (id: string) => void;
    handleSaveAndGenerate: () => void;
    handleUpdateSession: (updates: any) => void;
    handleCancelSession: () => void;
    DAYS: any[];
    SPORTS: string[];
    LEVELS: string[];
    GENDERS: string[];
    MOCK_PARTICIPANTS: any[];
    courts: { id: string; name: string }[];
}

export const VenueScheduleView: React.FC<VenueScheduleViewProps> = ({
    loading,
    saving,
    venueName,
    viewMode,
    setViewMode,
    showSuccess,
    selectedSession,
    setSelectedSession,
    showParticipants,
    setShowParticipants,
    isEditingSession,
    setIsEditingSession,
    isCompact,
    setIsCompact,
    generatedSessions,
    currentMonth,
    setCurrentMonth,
    calendarDays,
    slots,
    venueDefaults,
    setVenueDefaults,
    activeDay,
    setActiveDay,
    handleAddSlot,
    handleUpdateSlot,
    handleDeleteSlot,
    handleSaveAndGenerate,
    handleUpdateSession,
    handleCancelSession,
    DAYS,
    SPORTS,
    LEVELS,
    GENDERS,
    MOCK_PARTICIPANTS,
    courts
}) => {
    const navigate = useNavigate();
    const { venueId } = useParams();

    if (loading) return <PageLoading />;

    const activeEventsCount = generatedSessions.filter(s => ['published', 'full'].includes(s.status)).length;
    const completedEventsCount = generatedSessions.filter(s => s.status === 'completed').length;

    return (
        <div className="mx-auto min-h-screen w-full max-w-screen-md bg-slate-50 pb-20 relative font-sans text-slate-700">
            <VenueScheduleHeader 
                venueName={venueName} 
                viewMode={viewMode} 
                setViewMode={setViewMode} 
                onSync={handleSaveAndGenerate}
                saving={saving}
            />

            <main className="p-4 md:p-6 relative">
                {viewMode === 'calendar' && (
                    <div className="flex flex-col gap-4 mb-6">
                        {/* Smaller Action Cards Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Create Event (One-off) */}
                            <div 
                                onClick={() => venueId && navigate(`/venue-portal/${venueId}/sessions/create`)}
                                className="bg-white rounded-2xl p-5 border border-slate-200 group cursor-pointer hover:border-indigo-300 hover:shadow-md hover:bg-slate-50/50 transition-all duration-300 flex flex-col justify-between"
                            >
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg text-slate-800 mb-1.5 group-hover:text-indigo-700 transition-colors">Create Event</h3>
                                    <p className="text-slate-500 text-sm mb-4 leading-relaxed">Create a one-off special event or session outside your regular schedule.</p>
                                </div>
                                <div className="mt-auto">
                                     <button
                                        onClick={(e) => { e.stopPropagation(); venueId && navigate(`/venue-portal/${venueId}/sessions/create`) }}
                                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm w-fit"
                                     >
                                        Create Now
                                     </button>
                                 </div>
                            </div>

                            {/* Manage Weekly Schedule (CORE) */}
                            <div 
                                onClick={() => setViewMode('template')}
                                className="bg-[#5A29E4] rounded-2xl p-5 text-white overflow-hidden relative group cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
                            >
                                <div className="absolute right-0 top-0 p-4 opacity-[0.08] text-8xl leading-none font-black select-none pointer-events-none">
                                    📅
                                </div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-1.5 shadow-sm">Manage Weekly Schedule</h3>
                                    <p className="text-indigo-100 text-sm mb-4 leading-relaxed font-medium">Set your recurring weekly rules. The system will auto-generate sessions for players to join.</p>
                                </div>
                                <div className="mt-auto relative z-10">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setViewMode('template') }}
                                        className="bg-white text-[#5A29E4] hover:bg-slate-50 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm w-fit"
                                    >
                                        Set Schedule
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Active Events</div>
                                <div className="flex items-baseline gap-2">
                                    <div className="text-4xl font-extrabold text-[#5A29E4] tracking-tight">{activeEventsCount}</div>
                                    <div className="text-sm font-medium text-slate-400">Published</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Completed</div>
                                <div className="flex items-baseline gap-2">
                                    <div className="text-4xl font-extrabold text-emerald-500 tracking-tight">{completedEventsCount}</div>
                                    <div className="text-sm font-medium text-slate-400">Past</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Overlay */}
                {showSuccess && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/5 backdrop-blur-[4px] animate-in fade-in duration-300">
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col items-center animate-in zoom-in-95 duration-200">
                            <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
                                <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sync Complete</h2>
                            <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest opacity-60">Venue Inventory is now live</p>
                        </div>
                    </div>
                )}

                {/* Session UI Parts */}
                {selectedSession && (
                    <VenueSessionDrawer 
                        session={selectedSession}
                        onClose={() => { setSelectedSession(null); setIsEditingSession(false); setShowParticipants(false); }}
                        showParticipants={showParticipants}
                        setShowParticipants={setShowParticipants}
                        isEditing={isEditingSession}
                        setIsEditing={setIsEditingSession}
                        onUpdate={handleUpdateSession}
                        onCancel={handleCancelSession}
                        mockParticipants={MOCK_PARTICIPANTS}
                        SPORTS={SPORTS}
                    />
                )}

                {viewMode === 'calendar' ? (
                    <VenueCalendarGrid 
                        currentMonth={currentMonth}
                        setCurrentMonth={setCurrentMonth}
                        calendarDays={calendarDays}
                        generatedSessions={generatedSessions}
                        isCompact={isCompact}
                        setIsCompact={setIsCompact}
                        setSelectedSession={setSelectedSession}
                        setViewMode={setViewMode}
                    />
                ) : (
                    <VenueRulesEditor 
                        venueDefaults={venueDefaults}
                        setVenueDefaults={setVenueDefaults}
                        activeDay={activeDay}
                        setActiveDay={setActiveDay}
                        slots={slots}
                        handleAddSlot={handleAddSlot}
                        handleUpdateSlot={handleUpdateSlot}
                        handleDeleteSlot={handleDeleteSlot}
                        handleSaveAndGenerate={handleSaveAndGenerate}
                        saving={saving}
                        DAYS={DAYS}
                        SPORTS={SPORTS}
                        LEVELS={LEVELS}
                        GENDERS={GENDERS}
                        courts={courts}
                    />
                )}
            </main>

            <VenueBottomNav />
        </div>
    );
};
