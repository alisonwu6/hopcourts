import React from 'react';
import { PageLoading } from '@/components/PageLoading';
import { VenueButton } from '../components/ui/VenueButton';
import { VenueBadge } from '../components/ui/VenueBadge';

interface VenueSessionCreateViewProps {
    loading: boolean;
    venueData: any;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    SPORTS: string[];
    courts: { id: string; name: string }[];
}

export const VenueSessionCreateView: React.FC<VenueSessionCreateViewProps> = ({
    loading,
    venueData,
    formData,
    setFormData,
    onSubmit,
    onCancel,
    SPORTS,
    courts
}) => {
    if (loading && !venueData) return <PageLoading />;

    return (
        <div className="mx-auto min-h-screen w-full max-w-screen-md bg-slate-50 pb-20 relative font-sans text-slate-700">
            <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
                <div className="w-full flex items-center justify-between">
                    <button 
                        type="button"
                        onClick={onCancel} 
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    
                    <h1 className="font-black text-slate-900 text-base uppercase tracking-tight absolute left-1/2 -translate-x-1/2">Create Event</h1>
                    
                    <button 
                        form="create-event-form"
                        type="submit"
                        disabled={loading}
                        className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:opacity-70 transition-opacity disabled:opacity-30"
                    >
                        {loading ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </header>

            <main className="p-6">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-10 mb-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-10 opacity-5 text-8xl font-black select-none pointer-events-none">✨</div>
                    
                    <div className="mb-10 flex items-center gap-4 p-5 bg-indigo-50/50 border border-indigo-100/50 rounded-3xl ring-1 ring-indigo-500/5">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-indigo-100/50 shrink-0">Stadium</div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] uppercase font-black text-indigo-500 mb-0.5 tracking-widest opacity-80">Host Venue</div>
                            <div className="font-black text-slate-900 truncate uppercase tracking-tight">{venueData?.name_display}</div>
                            <div className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-tight">{venueData?.address_display}</div>
                        </div>
                        <VenueBadge variant="published" className="ml-auto">Official</VenueBadge>
                    </div>

                    <form id="create-event-form" onSubmit={onSubmit} className="space-y-8">
                        
                        {/* 1. Basic Info */}
                        <section className="space-y-4">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Identity</h2>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Event Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. Friday midnight open play"
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Sport</label>
                                        <select 
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner appearance-none"
                                            value={formData.sportKey}
                                            onChange={e => setFormData({...formData, sportKey: e.target.value})}
                                        >
                                            {SPORTS.map(s => <option key={s} value={s.toUpperCase()}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Spot / Court</label>
                                        <select 
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner appearance-none"
                                            value={formData.court_id}
                                            onChange={e => setFormData({...formData, court_id: e.target.value})}
                                        >
                                            <option value="">No Spot Assigned</option>
                                            {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Timing */}
                        <section className="space-y-4">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Schedule</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Session Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                        value={formData.date}
                                        onChange={e => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Starts At</label>
                                    <input 
                                        type="time" 
                                        required
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                        value={formData.startTime}
                                        onChange={e => setFormData({...formData, startTime: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Ends At</label>
                                    <input 
                                        type="time" 
                                        required
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                        value={formData.endTime}
                                        onChange={e => setFormData({...formData, endTime: e.target.value})}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 3. Description */}
                        <section className="space-y-4">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Notes</h2>
                            <div>
                                <textarea 
                                    rows={4}
                                    placeholder="Ex: Shuttlecocks provided, Intermediate players only..."
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                        </section>

                        {/* 4. Capacity & Price */}
                        <section className="space-y-4 border-t border-slate-50 pt-8">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Inventory & Price</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Max Capacity</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        max="100"
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                        value={formData.maxPeople}
                                        onChange={e => setFormData({...formData, maxPeople: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Pricing Model</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, isFree: true, pricePerPerson: 0})}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.isFree 
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                                                : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                                        >
                                            Free Access
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, isFree: false})}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!formData.isFree 
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                                                : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                                        >
                                            Paid Entry
                                        </button>
                                    </div>
                                    {!formData.isFree && (
                                        <div className="animate-in slide-in-from-top-2 duration-200">
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    placeholder="0.00"
                                                    className="w-full px-8 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                                    value={formData.pricePerPerson}
                                                    onChange={e => setFormData({...formData, pricePerPerson: parseInt(e.target.value)})}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </form>
                </div>
            </main>
        </div>
    );
};
