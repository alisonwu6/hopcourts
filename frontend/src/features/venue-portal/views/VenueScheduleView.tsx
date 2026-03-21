import React from 'react';
import { PageLoading } from '@/components/PageLoading';
import { CheckCircle } from 'lucide-react';

// Internal Components from components/
import { VenueScheduleHeader } from '../components/VenueScheduleHeader';
import { VenueCalendarGrid } from '../components/VenueCalendarGrid';
import { VenueRulesEditor } from '../components/VenueRulesEditor';
import { VenueSessionDrawer } from '../components/VenueSessionDrawer';

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
    MOCK_PARTICIPANTS
}) => {
    if (loading) return <PageLoading />;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 text-slate-700">
            <VenueScheduleHeader 
                venueName={venueName} 
                viewMode={viewMode} 
                setViewMode={setViewMode} 
            />

            <main className="max-w-6xl mx-auto p-4 md:p-6 relative">
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
                    />
                )}
            </main>
        </div>
    );
};
