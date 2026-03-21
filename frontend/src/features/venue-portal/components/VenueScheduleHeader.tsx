import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VenueScheduleHeaderProps {
    venueName?: string;
    viewMode: 'calendar' | 'template';
    setViewMode: (mode: 'calendar' | 'template') => void;
}

export const VenueScheduleHeader: React.FC<VenueScheduleHeaderProps> = ({ 
    venueName, 
    viewMode, 
    setViewMode 
}) => {
    const navigate = useNavigate();

    return (
        <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
            <div className="max-w-6xl mx-auto flex items-center justify-between font-sans">
                <div className="flex items-center gap-3 text-slate-900">
                    <button
                        onClick={() => navigate('/venue-portal')}
                        className="p-1.5 hover:bg-slate-100 rounded-full transition-colors group"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
                    </button>
                    <div>
                        <h1 className="font-black text-slate-900 leading-none mb-0.5 text-base tracking-tight uppercase">
                            {viewMode === 'calendar' ? 'Schedule Calendar' : 'Schedule Rules'}
                        </h1>
                        <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">{venueName}</p>
                    </div>
                </div>

                <div className="bg-slate-100 p-1 rounded-xl flex gap-1 shadow-inner border border-slate-200/50">
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${viewMode === 'calendar' 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Preview
                    </button>
                    <button
                        onClick={() => setViewMode('template')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${viewMode === 'template' 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Editor
                    </button>
                </div>
            </div>
        </header>
    );
};
