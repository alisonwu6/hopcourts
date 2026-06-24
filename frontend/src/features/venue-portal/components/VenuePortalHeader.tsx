import React from 'react'

interface VenuePortalHeaderProps {
  title: string
  subtitle?: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  titleClassName?: string
}

export const VenuePortalHeader: React.FC<VenuePortalHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  titleClassName = 'mb-0.5 text-base font-black uppercase leading-none tracking-tight text-slate-900',
}) => {
  return (
    <header className="sticky top-0 z-50 flex min-h-[60px] items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
      {/* Left section - Min width to balance center */}
      <div className="flex min-w-[64px] shrink-0 items-center">{leftAction}</div>

      {/* Center section - Title and Subtitle */}
      <div className="flex-1 px-2 text-center font-sans">
        <h1 className={titleClassName}>{title}</h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-[11px] font-black uppercase leading-tight tracking-widest text-[#5a7a2a]">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right section - Min width to balance center */}
      <div className="flex min-w-[64px] shrink-0 items-center justify-end">{rightAction}</div>
    </header>
  )
}
