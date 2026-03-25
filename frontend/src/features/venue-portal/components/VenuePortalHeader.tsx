import React from 'react';

interface VenuePortalHeaderProps {
    title: string;
    subtitle?: string;
    leftAction?: React.ReactNode;
    rightAction?: React.ReactNode;
}

export const VenuePortalHeader: React.FC<VenuePortalHeaderProps> = ({
    title,
    subtitle,
    leftAction,
    rightAction
}) => {
    return (
        <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 shadow-sm flex items-center justify-between min-h-[60px]">
            {/* Left section - Min width to balance center */}
            <div className="min-w-[64px] flex items-center shrink-0">
                {leftAction}
            </div>

            {/* Center section - Title and Subtitle */}
            <div className="text-center flex-1 font-sans px-2">
                <h1 className="font-black text-slate-900 leading-none mb-0.5 text-base tracking-tight uppercase">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest leading-tight mt-0.5 truncate">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Right section - Min width to balance center */}
            <div className="min-w-[64px] flex items-center justify-end shrink-0">
                {rightAction}
            </div>
        </header>
    );
};
