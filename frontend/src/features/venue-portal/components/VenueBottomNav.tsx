import React from 'react';
import { LayoutDashboard, Calendar, Building2 } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';

interface VenueBottomNavProps {
  venueId?: string | null;
}

export function VenueBottomNav({ venueId: propVenueId }: VenueBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ venueId: string }>();
  
  // Use passed venueId (from Dashboard) or the one from URL params
  const activeVenueId = propVenueId || params.venueId;

  const matchesPath = (segment: string) => {
    const path = location.pathname.replace(/\/$/, ''); // Remove trailing slash for comparison
    const target = segment.replace(/\/$/, '');
    
    // Dashboard should only be active on the exact venue dashboard page
    if (target === '/admin') {
      // Matches /admin/{venueId} but NOT /admin/{venueId}/schedule
      const dashboardPattern = /^\/admin\/[^\/]+$/;
      return dashboardPattern.test(path) || path === '/admin';
    }
    
    // Other pages (/schedule, /profile)
    return path.endsWith(target);
  };

  const handleNav = (path: string, requiresVenue: boolean = false) => {
    if (requiresVenue) {
        if (!activeVenueId) return; // Cannot navigate without venue context
      navigate(`/admin/${activeVenueId}${path}`);
    } else {
        navigate(path);
    }
  };

  const navItems = [
    {
      label: 'Schedule',
      icon: Calendar,
      path: '/schedule',
      requiresVenue: true,
      matchSegments: ['/schedule'],
    },
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '',
      requiresVenue: true,
      matchSegments: ['/admin/'],
    },
    {
      label: 'Venue',
      icon: Building2,
      path: '/profile', // Profile acts as Venue settings
      requiresVenue: true,
      matchSegments: ['/profile'],
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 mx-auto w-full max-w-screen-md border-t border-slate-200 bg-white/80 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex items-center justify-center gap-16 px-4 py-3">
        {navItems.map(({ label, icon: Icon, path, requiresVenue, matchSegments }) => {
          const isActive = matchSegments.some(m => matchesPath(m));
          const isDisabled = requiresVenue && !activeVenueId;

          return (
            <button
              key={label}
              onClick={() => handleNav(path, requiresVenue)}
              disabled={isDisabled}
              className={clsx(
                'flex flex-col items-center gap-1 rounded-md px-2 text-[10px] font-medium transition-colors',
                isActive ? 'text-[oklch(0.511_0.262_276.966)]' : 'text-slate-500',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={clsx('h-6 w-6', isActive ? 'text-[oklch(0.511_0.262_276.966)]' : 'text-slate-400')} />
              <span className="text-[11px] sm:text-xs">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  );
}
