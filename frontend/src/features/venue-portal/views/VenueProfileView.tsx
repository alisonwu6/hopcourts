import React, { useState } from 'react';
import { PageLoading } from '@/components/PageLoading';
import { VenueButton } from '../components/ui/VenueButton';
import { Clock, MousePointer2, Settings2 } from 'lucide-react';
import { VenueBottomNav } from '../components/VenueBottomNav';
import { VenuePortalHeader } from '../components/VenuePortalHeader';

interface OperatingDay {
    day: string;
    open_time: string;
    close_time: string;
    is_closed: boolean;
}

export interface VenueProfileData {
    name_display: string;
    address_display: string;
    logo_url: string;
    description: string;
    amenities: string[];
    spaces: { name: string; supported_sports: string[] }[];
    operating_hours: OperatingDay[];
    social_links: {
        facebook?: string;
        instagram?: string;
        website?: string;
    };
}

interface AmenityItem {
    label: string;
    icon: React.ReactNode;
}

interface AmenityCategory {
    title: string;
    items: AmenityItem[];
}

interface VenueProfileViewProps {
    loading: boolean;
    saving: boolean;
    mode: 'view' | 'edit';
    onToggleMode: (mode: 'view' | 'edit') => void;
    formData: VenueProfileData;
    setFormData: (data: VenueProfileData) => void;
    onBack: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onApplyAll: (open: string, close: string) => void;
    AMENITIES_CATEGORIES: AmenityCategory[];
}

export const VenueProfileView: React.FC<VenueProfileViewProps> = ({
    loading,
    saving,
    mode,
    onToggleMode,
    formData,
    setFormData,
    onBack,
    onSubmit,
    onApplyAll,
    AMENITIES_CATEGORIES
}) => {
    const [templateHours, setTemplateHours] = useState({ open: '06:00', close: '22:00' });

    if (loading) return <PageLoading />;

    const toggleAmenity = (label: string) => {
        const next = formData.amenities.includes(label)
            ? formData.amenities.filter(a => a !== label)
            : [...formData.amenities, label];
        setFormData({ ...formData, amenities: next });
    };

    const addSpace = () => {
        setFormData({ ...formData, spaces: [...(formData.spaces || []), { name: '', supported_sports: [] }] });
    };

    const removeSpace = (index: number) => {
        const next = [...(formData.spaces || [])];
        next.splice(index, 1);
        setFormData({ ...formData, spaces: next });
    };

    const updateSpaceName = (index: number, name: string) => {
        const next = [...(formData.spaces || [])];
        next[index] = { ...next[index], name };
        setFormData({ ...formData, spaces: next });
    };

    const toggleSportInSpace = (spaceIndex: number, sport: string) => {
        const next = [...(formData.spaces || [])];
        const sports = next[spaceIndex].supported_sports;
        const nextSports = sports.includes(sport)
            ? sports.filter(s => s !== sport)
            : [...sports, sport];
        next[spaceIndex] = { ...next[spaceIndex], supported_sports: nextSports };
        setFormData({ ...formData, spaces: next });
    };

    const updateDay = (day: string, field: keyof OperatingDay, value: string | boolean) => {
        const nextHours = formData.operating_hours.map(h =>
            h.day === day ? { ...h, [field]: value } : h
        );
        setFormData({ ...formData, operating_hours: nextHours });
    };

    const leftAction = mode === 'edit' && (
        <button 
            type="button"
            onClick={() => !saving && onToggleMode('view')} 
            disabled={saving}
            className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 p-2 transition-all disabled:opacity-30"
        >
            Cancel
        </button>
    );

    const rightAction = mode === 'view' ? (
        <button 
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleMode('edit');
            }} 
            className="text-[11px] font-black text-[oklch(0.511_0.262_276.966)] uppercase tracking-widest hover:opacity-70 p-2 transition-opacity"
        >
            Edit
        </button>
    ) : (
        <button 
            type="submit"
            form="venue-profile-form"
            disabled={saving}
            className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 p-2 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
            {saving ? (
                <>
                   <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                   <span>Saving...</span>
                </>
            ) : (
                'Update'
            )}
        </button>
    );

    return (
        <div className="mx-auto min-h-screen w-full max-w-screen-md bg-slate-50 pb-20 relative font-sans text-slate-700">
            <VenuePortalHeader 
                title="Venue Profile"
                subtitle={formData.name_display}
                leftAction={leftAction || undefined}
                rightAction={rightAction}
            />

            <main className={mode === 'view' ? "bg-slate-50 relative pb-4" : "p-6"}>
                {mode === 'view' ? (
                   <div className="bg-white px-6 py-8 shadow-sm border-b border-slate-100">
                     <div className="flex flex-col items-start gap-4">
                        <div className="h-24 w-24 overflow-hidden rounded-[2.5rem] border-4 border-slate-50 shadow-xl shrink-0 bg-slate-50 flex items-center justify-center text-4xl">
                            {formData.logo_url ? <img src={formData.logo_url} className="h-full w-full object-cover" /> : '🏟️'}
                        </div>
                        <div className="mt-2 min-w-0">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{formData.name_display}</h1>
                            <div className="mt-3 flex items-start gap-2 text-sm text-slate-500 font-medium">
                                <span className="text-slate-300 mt-0.5">📍</span>
                                <span>{formData.address_display}</span>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200/50">
                                  ✓ OFFICIAL
                                </span>
                            </div>
                        </div>
                     </div>

                     {formData.description && (
                        <div className="mt-8">
                           <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">About</h2>
                           <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-50 italic">"{formData.description}"</p>
                        </div>
                     )}

                     {formData.amenities.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Amenities & Services</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {formData.amenities.map(item => (
                                    <div key={item} className="flex items-center gap-2.5 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100/50">
                                      <span className="text-[oklch(0.511_0.262_276.966)]">✓</span>
                                      <span className="text-xs font-bold text-slate-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                     )}

                     {formData.spaces && formData.spaces.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Courts & Supported Sports</h2>
                            <div className="space-y-3">
                                {formData.spaces.map((space, idx) => (
                                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                      <div className="font-black text-slate-700 uppercase tracking-tight mb-2 flex items-center gap-2">
                                          <span className="w-5 h-5 rounded-[4px] bg-[oklch(0.511_0.262_276.966)] text-white flex items-center justify-center text-[10px]">📍</span>
                                          {space.name || `Unnamed Space`}
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {space.supported_sports.length > 0 ? space.supported_sports.map(sport => (
                                            <span key={sport} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 shadow-sm">{sport}</span>
                                        )) : <span className="text-slate-400 text-xs italic">No sports configured</span>}
                                      </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                     )}

                     {formData.operating_hours.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-4">
                              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operating Hours 🕒</h2>
                            </div>
                            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                              {formData.operating_hours.map(hour => (
                                <div key={hour.day} className="flex justify-between items-center text-xs">
                                    <span className="font-black text-slate-500 uppercase tracking-widest text-[9px] w-20">{hour.day}</span>
                                    <div className="h-px flex-1 bg-slate-200/50 mx-4" />
                                    {hour.is_closed ? (
                                        <span className="font-bold text-red-400 uppercase tracking-widest text-[9px]">Closed</span>
                                    ) : (
                                        <span className="font-black text-[oklch(0.511_0.262_276.966)] tabular-nums">{hour.open_time} — {hour.close_time}</span>
                                    )}
                                </div>
                              ))}
                            </div>
                        </div>
                     )}
                   </div>
                ) : (
                <form id="venue-profile-form" onSubmit={onSubmit} className="space-y-6">

                    {/* Basic Information Section */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-3 border-slate-50 w-full text-left">Basic Information</h2>

                        <div className="w-24 h-24 bg-slate-100 rounded-[2rem] relative mb-6 group border-4 border-white shadow-xl overflow-hidden shrink-0">
                            {formData.logo_url ? (
                                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl">🏟️</div>
                            )}
                        </div>

                        <div className="w-full space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 flex justify-between">
                                    <span>Venue Name</span>
                                    <span className="text-slate-400 font-bold opacity-70">ADMIN MANAGED</span>
                                </label>
                                <div className="w-full rounded-2xl bg-slate-50 border border-slate-200/60 px-4 py-3.5 text-sm font-bold text-slate-700 opacity-80 select-none cursor-not-allowed">
                                    {formData.name_display}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 flex justify-between">
                                    <span>Address</span>
                                    <span className="text-slate-400 font-bold opacity-70">ADMIN MANAGED</span>
                                </label>
                                <div className="w-full rounded-2xl bg-slate-50 border border-slate-200/60 px-4 py-3.5 text-sm font-bold text-slate-700 opacity-80 select-none cursor-not-allowed">
                                    {formData.address_display}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Logo URL (Profile Picture)</label>
                                <input
                                    type="url"
                                    value={formData.logo_url}
                                    onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                                    className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">About</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Spaces & Supported Sports Section */}
                    <div className="bg-white rounded-[2rem] p-4 sm:p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6 border-b pb-3 border-slate-50">
                           <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Courts & Supported Sports</h2>
                           <button type="button" onClick={addSpace} className="text-[10px] font-black text-[oklch(0.511_0.262_276.966)] uppercase hover:opacity-70">+ Add Space</button>
                        </div>
                        
                        <div className="space-y-4">
                           {(formData.spaces || []).map((space, index) => (
                               <div key={index} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 relative group">
                                  <button type="button" title="Remove" onClick={() => removeSpace(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">✕</button>
                                  
                                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Space Name / Number</label>
                                  <input 
                                     type="text" 
                                     placeholder="e.g. Court 1, Field A, Studio Room" 
                                     value={space.name}
                                     onChange={e => updateSpaceName(index, e.target.value)}
                                     className="w-full rounded-2xl bg-white border border-slate-100 px-4 py-3.5 text-sm font-bold text-slate-900 mb-4 outline-none focus:ring-4 focus:ring-[oklch(0.511_0.262_276.966)]/10 focus:border-[oklch(0.511_0.262_276.966)] shadow-inner transition-all" 
                                  />

                                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Supported Sports</label>
                                  <div className="grid grid-cols-2 gap-2">
                                      {['Badminton', 'Tennis', 'Pickleball', 'Basketball', 'Soccer', 'Padel', 'Volleyball'].map(sport => {
                                          const isSelected = space.supported_sports.includes(sport);
                                          return (
                                              <button
                                                  key={sport}
                                                  type="button"
                                                  onClick={() => toggleSportInSpace(index, sport)}
                                                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isSelected
                                                      ? 'bg-[oklch(0.511_0.262_276.966)] text-white border-[oklch(0.511_0.262_276.966)] shadow-md shadow-[oklch(0.511_0.262_276.966)]/20'
                                                      : 'bg-white text-slate-400 border-slate-100 opacity-60'}`}
                                              >
                                                  {sport}
                                              </button>
                                          );
                                      })}
                                  </div>
                               </div>
                           ))}
                           {(!formData.spaces || formData.spaces.length === 0) && (
                               <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">No Courts Configured</p>
                                   <VenueButton variant="primary" size="sm" type="button" onClick={addSpace}>Add First Space</VenueButton>
                               </div>
                           )}
                        </div>
                    </div>

                    {/* Operating Hours Section */}
                    <div className="bg-white rounded-[2rem] p-4 sm:p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-3 border-slate-50">Operating Hours</h2>

                        {/* Quick Template Apply */}
                        <div className="mb-8 p-4 sm:p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                            <div className="flex items-center gap-2 mb-4">
                                <Settings2 size={14} className="text-indigo-600" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-900">Apply Template to All Days</h3>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                                <div className="flex flex-1 items-center gap-3">
                                    <div className="flex-1">
                                        <label className="block text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1 ml-1 text-center">Open</label>
                                        <input
                                            type="time"
                                            value={templateHours.open}
                                            onChange={e => setTemplateHours({ ...templateHours, open: e.target.value })}
                                            className="w-full bg-white rounded-lg px-3 py-2 text-xs font-black text-indigo-600 border border-indigo-100 outline-none text-center"
                                        />
                                    </div>
                                    <div className="text-indigo-200 font-bold pt-4">—</div>
                                    <div className="flex-1">
                                        <label className="block text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1 ml-1 text-center">Close</label>
                                        <input
                                            type="time"
                                            value={templateHours.close}
                                            onChange={e => setTemplateHours({ ...templateHours, close: e.target.value })}
                                            className="w-full bg-white rounded-lg px-3 py-2 text-xs font-black text-indigo-600 border border-indigo-100 outline-none text-center"
                                        />
                                    </div>
                                </div>
                                <VenueButton
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    className="sm:px-4 py-2.5 sm:py-2"
                                    onClick={() => onApplyAll(templateHours.open, templateHours.close)}
                                    icon={<MousePointer2 size={12} />}
                                >
                                    Apply to All
                                </VenueButton>
                            </div>
                        </div>

                        {/* Weekly Schedule List */}
                        <div className="flex flex-col gap-3">
                            {formData.operating_hours.map(hour => (
                                <div
                                    key={hour.day}
                                    className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-6 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all gap-4 sm:gap-0 ${hour.is_closed ? 'opacity-60' : ''}`}
                                >
                                    <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-2">
                                        <div className="font-black text-[13px] sm:text-sm uppercase tracking-widest text-slate-900">{hour.day}</div>
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => updateDay(hour.day, 'is_closed', !hour.is_closed)}
                                                className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-lg border transition-all ${hour.is_closed
                                                    ? 'bg-red-50 text-red-500 border-red-100'
                                                    : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}
                                            >
                                                {hour.is_closed ? 'Closed' : 'Open'}
                                            </button>
                                        </div>
                                    </div>

                                    {!hour.is_closed ? (
                                        <div className="flex items-center gap-2 sm:gap-3 bg-slate-50/50 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-slate-100 sm:border-none">
                                            <div className="flex-1 min-w-0">
                                                <input
                                                    type="time"
                                                    value={hour.open_time}
                                                    onChange={e => updateDay(hour.day, 'open_time', e.target.value)}
                                                    className="bg-white sm:bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-black text-indigo-600 border border-slate-100 outline-none focus:bg-white focus:border-indigo-500 transition-all w-full sm:w-28 text-center shadow-sm sm:shadow-inner"
                                                />
                                            </div>
                                            <span className="text-slate-300 font-bold">—</span>
                                            <div className="flex-1 min-w-0">
                                                <input
                                                    type="time"
                                                    value={hour.close_time}
                                                    onChange={e => updateDay(hour.day, 'close_time', e.target.value)}
                                                    className="bg-white sm:bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-black text-indigo-600 border border-slate-100 outline-none focus:bg-white focus:border-indigo-500 transition-all w-full sm:w-28 text-center shadow-sm sm:shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic text-center sm:text-right pr-0 sm:pr-4">
                                            No Business
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Amenities by Categories */}
                    {AMENITIES_CATEGORIES.map(category => (
                        <div key={category.title} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-3 border-slate-50">{category.title}</h2>

                            <div className="flex flex-col gap-2">
                                {category.items.map(amenity => {
                                    const active = formData.amenities.includes(amenity.label);
                                    return (
                                        <button
                                            key={amenity.label}
                                            type="button"
                                            onClick={() => toggleAmenity(amenity.label)}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-white transition-all hover:border-slate-200 group"
                                        >
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 text-indigo-500 group-hover:bg-slate-100 transition-colors">
                                                {amenity.icon}
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <div className="font-black text-sm uppercase tracking-tight text-slate-800">{amenity.label}</div>
                                            </div>

                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${active
                                                ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-100'
                                                : 'bg-transparent border-slate-200'}`}>
                                                {active && <span className="text-white text-xs font-black">✓</span>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}


                </form>
                )}
            </main>

            <VenueBottomNav />
        </div>
    );
};
