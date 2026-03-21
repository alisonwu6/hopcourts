import React from 'react';
import { format, isSameDay, isSameMonth, isToday, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { VenueBadge } from './ui/VenueBadge';

interface GeneratedSession {
    id: string;
    date: Date;
    start_time: string;
    end_time: string;
    sport: string;
    status: 'published' | 'cancelled' | 'draft' | 'completed' | 'full';
    participants_count: number;
}

interface CalendarGridProps {
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    calendarDays: Date[];
    generatedSessions: GeneratedSession[];
    isCompact: boolean;
    setIsCompact: (compact: boolean) => void;
    setSelectedSession: (session: GeneratedSession) => void;
    setViewMode: (mode: 'calendar' | 'template') => void;
}

export const VenueCalendarGrid: React.FC<CalendarGridProps> = ({
    currentMonth,
    setCurrentMonth,
    calendarDays,
    generatedSessions,
    isCompact,
    setIsCompact,
    setSelectedSession,
    setViewMode
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden text-slate-900 font-sans border-collapse">
            {/* Calendar Controls */}
            <div className="p-4 md:p-5 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <div className="flex gap-1 border border-slate-100 p-0.5 rounded-lg bg-slate-50/50 shadow-inner">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-white rounded-md transition-colors"><ChevronLeft className="w-4 h-4 text-slate-400" /></button>
                        <button onClick={() => setCurrentMonth(new Date())} className="px-2 py-0.5 text-[9px] font-black text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors">Today</button>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-white rounded-md transition-colors"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsCompact(!isCompact)} 
                        className={`text-[9px] font-black uppercase tracking-widest transition-all px-3 py-1 rounded-lg border ${isCompact 
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                            : 'bg-white text-slate-400 border-slate-100 hover:text-slate-600'}`}
                    >
                        {isCompact ? 'Standard' : 'Compact'}
                    </button>
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100/50 ring-1 ring-emerald-400/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                        Inventory Live
                    </div>
                </div>
            </div>

            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100 shadow-sm">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2.5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            {generatedSessions.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-white">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 border border-slate-100/50">
                        <CalendarIcon className="w-7 h-7 text-slate-200" />
                    </div>
                    <p className="font-black uppercase tracking-widest text-xs text-slate-500">No sessions published</p>
                    <button 
                        onClick={() => setViewMode('template')} 
                        className="text-indigo-600 mt-2 font-black uppercase tracking-[0.2em] hover:text-indigo-700 transition-all text-[10px]"
                    >
                        Define Rules & Sync
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-7 bg-white">
                    {calendarDays.map((day, idx) => {
                        const sessionsOnDay = generatedSessions.filter(s => isSameDay(s.date, day));
                        const is_Today = isToday(day);
                        const is_CurrentMonth = isSameMonth(day, currentMonth);

                        return (
                            <div 
                                key={idx} 
                                className={`${isCompact ? 'min-h-[85px] p-1.5' : 'min-h-[140px] p-2.5'} border-r border-b border-slate-50 transition-all ${
                                    !is_CurrentMonth ? 'bg-slate-50/10' : 'bg-white hover:bg-slate-50/30'
                                }`}
                            >
                                <div className="mb-2 flex items-center justify-center">
                                    <span className={`${isCompact ? 'text-[9px] w-5 h-5' : 'text-xs w-7 h-7'} font-black flex items-center justify-center rounded-xl transition-all ${
                                        is_Today 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                        : is_CurrentMonth ? 'text-slate-900 border border-slate-100' : 'text-slate-200'
                                    }`}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                <div className="space-y-1.5">
                                    {sessionsOnDay.map(session => {
                                        const isCancelled = session.status === 'cancelled';
                                        const isCompleted = session.status === 'completed';
                                        const isFull = session.status === 'full';
                                        
                                        return (
                                            <div
                                                key={session.id}
                                                onClick={() => setSelectedSession(session)}
                                                className={`p-1.5 rounded-xl border shadow-sm transition-all hover:scale-[1.02] cursor-pointer group ${
                                                    isCancelled
                                                    ? 'bg-slate-50 border-slate-100 opacity-50 grayscale'
                                                    : isCompleted
                                                    ? 'bg-slate-100/50 border-slate-200/50'
                                                    : 'bg-white border-slate-100 hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-1 overflow-hidden">
                                                    <div className="text-[9px] font-black leading-none truncate text-slate-800 uppercase tracking-tight">
                                                        {session.sport}
                                                    </div>
                                                    {isFull && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-sm shadow-amber-200"></div>}
                                                </div>
                                                <div className="flex items-baseline justify-between mt-1">
                                                    <div className="text-[8px] font-black text-slate-400 group-hover:text-indigo-500 transition-colors uppercase tabular-nums">
                                                        {session.start_time}
                                                    </div>
                                                    {!isCancelled && !isCompact && (
                                                        <div className="text-[7px] font-black text-slate-300 uppercase">
                                                            {session.participants_count} Joins
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
