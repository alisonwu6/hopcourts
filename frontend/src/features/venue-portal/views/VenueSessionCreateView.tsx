import React from 'react';
import { PageLoading } from '@/components/PageLoading';

interface VenueSessionCreateViewProps {
    loading: boolean;
    venueData: any;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    SPORTS: string[];
    courts: { id: string; name: string; supported_sports?: string[] }[];
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
    const SKILL_LEVELS = [
        { label: 'All levels', value: 'any' },
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
    ];

    const GENDERS = [
        { label: 'Mixed', value: 'mixed' },
        { label: 'Women only', value: 'women' },
        { label: 'Men only', value: 'men' },
    ];

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
                    

                    <form id="create-event-form" onSubmit={onSubmit} className="space-y-8">
                        
                        {/* 1. Event Basics */}
                        <section className="space-y-4">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Event Basics</h2>
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Max Participants</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                            value={formData.maxPeople}
                                            onChange={e => setFormData({...formData, maxPeople: Number(e.target.value) || 0})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Min Participants</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                            value={formData.minPeople}
                                            onChange={e => setFormData({...formData, minPeople: Number(e.target.value) || 0})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Skill Level</label>
                                    <div className="flex flex-wrap gap-2">
                                        {SKILL_LEVELS.map((level) => {
                                            const active = formData.skillLevel === level.value;
                                            return (
                                                <button
                                                    key={level.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, skillLevel: level.value })}
                                                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${active
                                                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                                                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    {level.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Gender</label>
                                    <div className="flex flex-wrap gap-2">
                                        {GENDERS.map((gender) => {
                                            const active = formData.genderRule === gender.value;
                                            return (
                                                <button
                                                    key={gender.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, genderRule: gender.value })}
                                                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${active
                                                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                                                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    {gender.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Schedule */}
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

                        {/* 3. Pricing */}
                        <section className="space-y-4 border-t border-slate-50 pt-8">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Pricing</h2>
                            <p className="px-1 text-xs text-slate-400">Set event pricing details.</p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition">
                                    <input
                                        id="venue-is-free-checkbox"
                                        type="checkbox"
                                        checked={formData.isFree}
                                        onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                                        className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="venue-is-free-checkbox" className="text-sm font-semibold text-slate-800">Free</label>
                                </div>

                                {!formData.isFree && (
                                    <div className="grid gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex items-center gap-2">
                                            <div className="flex rounded-lg bg-slate-100 p-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, priceMode: 'total' })}
                                                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${formData.priceMode === 'total'
                                                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-600'
                                                        : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Total Cost
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, priceMode: 'person' })}
                                                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${formData.priceMode === 'person'
                                                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-600'
                                                        : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Per Person
                                                </button>
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                {formData.priceMode === 'total'
                                                    ? 'Per-person fee is estimated from total participants.'
                                                    : 'Set per-person fee directly.'}
                                            </span>
                                        </div>

                                        <div className="relative">
                                            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                                                {formData.priceMode === 'total' ? 'Total Cost (TWD)' : 'Per Person (TWD)'}
                                            </label>
                                            <input 
                                                type="number" 
                                                min="0"
                                                placeholder={formData.priceMode === 'total' ? 'e.g. 2000' : 'e.g. 200'}
                                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                                value={formData.pricePerPerson}
                                                onChange={e => setFormData({...formData, pricePerPerson: Number(e.target.value) || 0})}
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Fee Notes</label>
                                            <textarea
                                                rows={3}
                                                placeholder="e.g. on-site payment"
                                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-inner resize-none"
                                                value={formData.feeNotes}
                                                onChange={e => setFormData({ ...formData, feeNotes: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 4. Event Description */}
                        <section className="space-y-4">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Event Description</h2>
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
                    </form>
                </div>
            </main>
        </div>
    );
};
