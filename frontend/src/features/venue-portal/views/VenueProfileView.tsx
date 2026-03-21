import React, { useState } from 'react';
import { PageLoading } from '@/components/PageLoading';
import { VenueButton } from '../components/ui/VenueButton';
import { Clock, MousePointer2, Settings2 } from 'lucide-react';

interface OperatingDay {
    day: string;
    open_time: string;
    close_time: string;
    is_closed: boolean;
}

interface VenueProfileData {
    logo_url: string;
    description: string;
    amenities: string[];
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

    const updateDay = (day: string, field: keyof OperatingDay, value: string | boolean) => {
        const nextHours = formData.operating_hours.map(h =>
            h.day === day ? { ...h, [field]: value } : h
        );
        setFormData({ ...formData, operating_hours: nextHours });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 text-slate-700">
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-all active:scale-95 text-xl font-black"
                    >
                        ←
                    </button>
                    <h1 className="font-black text-slate-900 tracking-tight uppercase">Venue Settings</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-6">
                <form onSubmit={onSubmit} className="space-y-6">

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

                        <div className="w-full">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Logo URL (Profile Picture)</label>
                            <input
                                type="url"
                                value={formData.logo_url}
                                onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                                className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                placeholder="https://example.com/logo.png"
                            />
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

                    <div className="flex gap-4 pt-6">
                        <VenueButton
                            variant="secondary"
                            size="lg"
                            className="flex-1"
                            onClick={onBack}
                            type="button"
                        >
                            Cancel
                        </VenueButton>
                        <VenueButton
                            variant="primary"
                            size="lg"
                            className="flex-1"
                            isLoading={saving}
                            type="submit"
                        >
                            Submit
                        </VenueButton>
                    </div>
                </form>
            </main>
        </div>
    );
};
