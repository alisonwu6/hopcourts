import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { VenuePortalHeader } from './VenuePortalHeader';

interface VenueScheduleHeaderProps {
    venueName?: string;
    viewMode: 'calendar' | 'template';
    setViewMode: (mode: 'calendar' | 'template') => void;
    onSync?: () => void;
    saving?: boolean;
}

export const VenueScheduleHeader: React.FC<VenueScheduleHeaderProps> = ({
    venueName,
    viewMode,
    setViewMode,
    onSync,
    saving
}) => {
    const leftAction = viewMode === 'template' ? (
        <button
            onClick={() => setViewMode('calendar')}
            className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
        >
            Cancel
        </button>
    ) : null;

    const rightAction = (viewMode === 'template' && onSync) ? (
        <button
            onClick={onSync}
            disabled={saving}
            className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:opacity-70 disabled:opacity-30 flex items-center gap-1.5 transition-opacity"
        >
            {saving ? 'Syncing...' : 'Sync Calendar'}
        </button>
    ) : null;

    return (
        <VenuePortalHeader 
            title={viewMode === 'calendar' ? 'Schedule Calendar' : 'Schedule Rules'}
            subtitle={venueName}
            leftAction={leftAction}
            rightAction={rightAction}
        />
    );
};
