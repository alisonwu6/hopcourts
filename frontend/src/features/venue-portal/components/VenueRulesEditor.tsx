import React from 'react';
import { Settings, Plus, Trash2, Save, Award, User, DollarSign } from 'lucide-react';
import { VenueButton } from './ui/VenueButton';

interface ScheduleSlot {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    sport: string;
    max_participants: number;
    level: string;
    gender: string;
    price: number;
    court_id?: string;
}

interface VenueDefaults {
    sport: string;
    max_participants: number;
    level: string;
    gender: string;
    price: number;
    court_id?: string;
}

interface RulesEditorProps {
    venueDefaults: VenueDefaults;
    setVenueDefaults: (defaults: VenueDefaults) => void;
    activeDay: number;
    setActiveDay: (day: number) => void;
    slots: ScheduleSlot[];
    handleAddSlot: () => void;
    handleUpdateSlot: (id: string, updates: Partial<ScheduleSlot>) => void;
    handleDeleteSlot: (id: string) => void;
    handleSaveAndGenerate: () => void;
    saving: boolean;
    DAYS: { key: number; label: string }[];
    SPORTS: string[];
    LEVELS: string[];
    GENDERS: string[];
    courts: { id: string; name: string }[];
}

export const VenueRulesEditor: React.FC<RulesEditorProps> = ({
    venueDefaults,
    setVenueDefaults,
    activeDay,
    setActiveDay,
    slots,
    handleAddSlot,
    handleUpdateSlot,
    handleDeleteSlot,
    handleSaveAndGenerate,
    saving,
    DAYS,
    SPORTS,
    LEVELS,
    GENDERS,
    courts
}) => {
    return (
        <div className="w-full space-y-6 animate-in slide-in-from-bottom-2 duration-300 font-sans">
            {/* Default Template Settings */}
            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100/50 shadow-inner">
                            <Settings className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-sm tracking-tight uppercase">Quick Prep Rules</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Templates for new slots</p>
                        </div>
                    </div>
                    
                    <div className="hidden md:flex flex-col items-end text-right">
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">System Mode</div>
                        <div className="text-[10px] text-indigo-500 font-extrabold tracking-tight uppercase bg-indigo-50/50 px-2 py-0.5 rounded-full border border-indigo-100/30">B2B Auto-Cluster Active</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Sport</label>
                        <select 
                            value={venueDefaults.sport} 
                            onChange={e => setVenueDefaults({...venueDefaults, sport: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-black text-slate-700 tracking-tight focus:border-indigo-500 hover:border-slate-300 transition-all outline-none"
                        >
                            {SPORTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Spot / Court</label>
                        <select 
                            value={venueDefaults.court_id} 
                            onChange={e => setVenueDefaults({...venueDefaults, court_id: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-black text-slate-700 tracking-tight focus:border-indigo-500 hover:border-slate-300 transition-all outline-none"
                        >
                            <option value="">No Default</option>
                            {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Level</label>
                        <select value={venueDefaults.level} onChange={e => setVenueDefaults({...venueDefaults, level: e.target.value})} className="w-full bg-slate-50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-black text-slate-700 tracking-tight focus:border-indigo-500 hover:border-slate-300 transition-all outline-none">
                            {LEVELS.map(l => <option key={l}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Gender</label>
                        <select value={venueDefaults.gender} onChange={e => setVenueDefaults({...venueDefaults, gender: e.target.value})} className="w-full bg-slate-50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-black text-slate-700 tracking-tight focus:border-indigo-500 hover:border-slate-300 transition-all outline-none">
                            {GENDERS.map(g => <option key={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Cap.</label>
                        <input type="number" value={venueDefaults.max_participants} onChange={e => setVenueDefaults({...venueDefaults, max_participants: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-black text-slate-700 tracking-tight focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fee</label>
                        <input type="number" value={venueDefaults.price} onChange={e => setVenueDefaults({...venueDefaults, price: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-black text-slate-700 tracking-tight focus:border-indigo-500" />
                    </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-50">
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed max-w-2xl">
                        <span className="text-indigo-600 font-bold uppercase tracking-widest text-[9px] mr-2">Smart Generation:</span>
                        Syncing will auto-generate session instances for the next 28 days based on your recurring rules.
                    </p>
                </div>
            </div>

            {/* Weekly Day Tabs & Slots */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/30 border border-slate-100 overflow-hidden">
                <div className="flex border-b border-slate-50 bg-slate-50/30 p-2">
                    {DAYS.map(day => (
                        <button
                            key={day.key}
                            onClick={() => setActiveDay(day.key)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeDay === day.key
                                ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100 ring-1 ring-slate-100'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {day.label}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                {DAYS.find(d => d.key === activeDay)?.label}s Recurring Slots
                            </h2>
                            <p className="text-[11px] text-slate-400 font-semibold tracking-wide mt-1">This config will apply every {DAYS.find(d => d.key === activeDay)?.label} in the calendar</p>
                        </div>
                        <VenueButton 
                            onClick={handleAddSlot}
                            size="md"
                            icon={<Plus className="w-4 h-4" />}
                        >
                            Add New Slot
                        </VenueButton>
                    </div>

                    <div className="space-y-4">
                        {slots.filter(s => s.day_of_week === activeDay).map(slot => (
                            <div key={slot.id} className="bg-slate-50/50 rounded-[1.5rem] p-6 border border-slate-100 hover:border-indigo-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300">
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                         <div>
                                             <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Sport Category</label>
                                             <select
                                                 value={slot.sport}
                                                 onChange={(e) => handleUpdateSlot(slot.id, { sport: e.target.value })}
                                                 className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm focus:border-indigo-500 transition-colors"
                                             >
                                                 {SPORTS.map(s => <option key={s}>{s}</option>)}
                                             </select>
                                         </div>
                                         <div>
                                             <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Session Timing</label>
                                             <div className="flex items-center gap-1.5">
                                                 <input type="time" value={slot.start_time} onChange={e => handleUpdateSlot(slot.id, { start_time: e.target.value })} className={`flex-1 bg-white border rounded-xl px-3 py-2.5 text-xs font-black text-slate-700 shadow-sm ${!slot.start_time ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'}`} />
                                                 <span className="text-slate-300 font-bold">—</span>
                                                 <input type="time" value={slot.end_time} onChange={e => handleUpdateSlot(slot.id, { end_time: e.target.value })} className={`flex-1 bg-white border rounded-xl px-3 py-2.5 text-xs font-black text-slate-700 shadow-sm ${!slot.end_time ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'}`} />
                                             </div>
                                         </div>
                                         <div className="flex items-end gap-3">
                                             <div className="flex-1">
                                                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Max Cap.</label>
                                                 <input type="number" value={slot.max_participants} onChange={e => handleUpdateSlot(slot.id, { max_participants: parseInt(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all" />
                                             </div>
                                             <VenueButton variant="danger" size="md" onClick={() => handleDeleteSlot(slot.id)} icon={<Trash2 className="w-4 h-4" />} />
                                         </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-5 border-t border-slate-100/80">
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Spot / Court</label>
                                            <select
                                                value={slot.court_id}
                                                onChange={(e) => handleUpdateSlot(slot.id, { court_id: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm focus:border-indigo-500 transition-colors"
                                            >
                                                <option value="">No Spot Assigned</option>
                                                {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Skill Tier</label>
                                            <select value={slot.level} onChange={e => handleUpdateSlot(slot.id, { level: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-600 shadow-sm">
                                                {LEVELS.map(l => <option key={l}>{l}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Gender Rule</label>
                                            <select value={slot.gender} onChange={e => handleUpdateSlot(slot.id, { gender: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-600 shadow-sm">
                                                {GENDERS.map(g => <option key={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fee (A$ AUD)</label>
                                            <input type="number" value={slot.price} onChange={e => handleUpdateSlot(slot.id, { price: parseFloat(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-indigo-600 shadow-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {slots.filter(s => s.day_of_week === activeDay).length === 0 && (
                            <div className="py-20 text-center bg-slate-50/30 rounded-[2rem] border-2 border-dashed border-slate-100/50 flex flex-col items-center">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 border border-slate-50 shadow-sm">
                                    <Plus className="w-5 h-5 text-slate-200" />
                                </div>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No rules defined for {DAYS.find(d => d.key === activeDay)?.label}</p>
                                <button onClick={handleAddSlot} className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mt-2 hover:underline"> Create First Slot </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 border-t border-slate-50" />
                </div>
            </div>
            

        </div>
    );
};
