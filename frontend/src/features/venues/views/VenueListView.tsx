import { Search, Map as MapIcon, List as ListIcon, X } from 'lucide-react';
import clsx from 'clsx';
import { EventMap } from '@/features/events/components/EventMap';
import { ApiVenue } from '../services/venuesService';
import { VenueCard } from '../components/VenueCard';

interface VenueListViewProps {
  venues: ApiVenue[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchClear: () => void;
  showMap: boolean;
  onToggleView: () => void;
  onVenueClick: (id: string) => void;
  // Map props
  mapMarkers: any[];
  sportsCatalog: any[];
  selectedVenueId: string | null;
  onSelectMarker: (id: string | null) => void;
}

export function VenueListView({
  venues,
  searchQuery,
  onSearchChange,
  onSearchClear,
  showMap,
  onToggleView,
  onVenueClick,
  mapMarkers,
  sportsCatalog,
  selectedVenueId,
  onSelectMarker,
}: VenueListViewProps) {
  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Top Search Bar & Toggle (Floating) */}
      <div
        className={clsx(
          "fixed left-0 right-0 top-0 z-40 mx-auto w-full max-w-md p-4 transition-all duration-300",
          showMap ? "pointer-events-none" : "bg-white/95 backdrop-blur pointer-events-auto"
        )}
      >
        <div className="flex w-full items-center gap-3">
          {/* Real Input Search */}
          <div className="relative flex-1 pointer-events-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search
                className={clsx(
                  "h-5 w-5 transition-colors",
                  searchQuery ? "text-indigo-600" : "text-slate-400"
                )}
                strokeWidth={2.5}
              />
            </div>
            <input
              type="text"
              placeholder="Search venues by name or address"
              className="w-full h-[58px] rounded-full border border-slate-200 bg-white pl-12 pr-12 text-sm font-bold text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:bg-slate-50/50 transition-all placeholder:text-slate-400 font-medium"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={onSearchClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all flex items-center justify-center"
              >
                <X size={14} strokeWidth={3} />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <button
            onClick={onToggleView}
            className="flex h-[58px] w-[58px] flex-none items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition pointer-events-auto hover:bg-slate-50 active:scale-95"
          >
            {showMap ? (
              <ListIcon className="h-6 w-6 text-slate-700" />
            ) : (
              <MapIcon className="h-6 w-6 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {showMap ? (
        <div className="h-screen w-full">
          <EventMap
            events={mapMarkers}
            sports={sportsCatalog}
            mode="venues"
            selectedEventId={selectedVenueId}
            onSelectEvent={(e) => onSelectMarker(e?.id || null)}
          />
        </div>
      ) : (
        <div className="pt-24 pb-[100px] px-4 max-w-md mx-auto">
          {/* Simple list view for venues */}
          <div className="space-y-4">
            {venues.map((v) => (
              <VenueCard key={v.id} venue={v} onClick={onVenueClick} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
