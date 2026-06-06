import React from 'react';
import { X, ChevronLeft, Calendar as CalendarIcon, Clock, Award, User, DollarSign, Edit3, Check, Users } from 'lucide-react';
import { format } from 'date-fns';
import { VenueButton } from './ui/VenueButton';
import { VenueBadge } from './ui/VenueBadge';

interface GeneratedSession {
    id: string;
    date: Date;
    start_time: string;
    end_time: string;
    sport: string;
    status: 'published' | 'cancelled' | 'draft' | 'completed' | 'full';
    max_participants: number;
    participants_count: number;
    level: string;
    gender: string;
    price: number;
}

interface Participant {
    id: string;
    name: string;
    level_rating: string;
    has_paid: boolean;
}

interface VenueSessionDrawerProps {
    session: GeneratedSession;
    onClose: () => void;
    showParticipants: boolean;
    setShowParticipants: (show: boolean) => void;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    onUpdate: (updates: Partial<GeneratedSession>) => void;
    onCancel: () => void;
    mockParticipants: Participant[];
    SPORTS: string[];
}

export const VenueSessionDrawer: React.FC<VenueSessionDrawerProps> = ({
    session,
    onClose,
    showParticipants,
    setShowParticipants,
    isEditing,
    setIsEditing,
    onUpdate,
    onCancel,
    mockParticipants,
    SPORTS
}) => {
    const getStatusVariant = (status: GeneratedSession['status']) => {
        switch (status) {
            case 'published': return 'emerald';
            case 'full': return 'amber';
            case 'completed': return 'slate';
            case 'cancelled': return 'red';
            default: return 'default';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/10 backdrop-blur-[2px] font-sans flex justify-center">
            <div className="w-full max-w-screen-md relative h-full">
                <div className="absolute right-0 top-0 bottom-0 w-full md:w-[420px] bg-white shadow-2xl z-[110] animate-in slide-in-from-right duration-300 flex flex-col p-0">
                    {/* Drawer Header */}
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        {showParticipants && (
                            <button onClick={() => setShowParticipants(false)} className="p-2 hover:bg-white rounded-xl shadow-sm border border-slate-100 transition-all active:scale-90"><ChevronLeft className="w-4 h-4 text-slate-400" /></button>
                        )}
                        <div>
                            <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none mb-0.5">{showParticipants ? 'Live Roster' : isEditing ? 'Edit Instance' : 'Instance Dashboard'}</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{format(session.date, 'EEEE, MMM d, yyyy')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-white hover:text-red-500 rounded-2xl transition-all border border-transparent hover:border-red-100 shadow-sm active:scale-95"><X className="w-5 h-5 text-slate-300" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-7 space-y-6">
                    {showParticipants ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="bg-slate-900 rounded-[1.5rem] p-5 text-white shadow-xl shadow-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Summary Status</div>
                                    <VenueBadge variant="emerald" size="xs">Live Inventory</VenueBadge>
                                </div>
                                <div className="text-2xl font-black">{session.participants_count} <span className="text-slate-500 text-lg">/ {session.max_participants}</span></div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden shadow-inner">
                                    <div 
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                                        style={{ width: `${(session.participants_count / session.max_participants) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {mockParticipants.slice(0, session.participants_count).map(p => (
                                    <div key={p.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-[1.25rem] hover:shadow-lg hover:shadow-indigo-50/50 hover:border-indigo-100 transition-all group">
                                        <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xs shadow-inner group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors uppercase">
                                            {p.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{p.name}</div>
                                            <div className="text-[10px] text-slate-400 font-black tracking-widest">{p.level_rating}</div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/50 group-hover:shadow-sm transition-all">
                                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                            <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Paid</span>
                                        </div>
                                    </div>
                                ))}

                                {session.participants_count === 0 && (
                                    <div className="py-24 text-center group">
                                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100 opacity-20 group-hover:opacity-100 transition-all">
                                            <Users className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Waiting for registrations</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : !isEditing ? (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-white border border-slate-100 rounded-[2rem] p-7 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><CalendarIcon className="w-32 h-32 -mr-16 -mt-16" /></div>
                                
                                <div className="flex items-center justify-between mb-6">
                                    <VenueBadge variant="indigo" size="sm">{session.sport}</VenueBadge>
                                    <VenueBadge variant={getStatusVariant(session.status)} size="sm">{session.status}</VenueBadge>
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">{format(session.date, 'MMMM do')}</h4>
                                <div className="flex items-center gap-3 text-slate-400 font-black text-[11px] uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                    {session.start_time} — {session.end_time}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-5 text-center shadow-inner group">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Max Capacity</div>
                                    <div className="text-2xl font-black text-slate-900 tabular-nums">{session.max_participants}</div>
                                </div>
                                <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-5 text-center shadow-inner group">
                                    <div className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1 group-hover:text-amber-500 transition-colors">Registered</div>
                                    <div className="text-2xl font-black text-indigo-600 tabular-nums">{session.participants_count}</div>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-100 rounded-[1.5rem] p-6 space-y-4 shadow-sm">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-indigo-50 transition-colors"><Award className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /></div>
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">Skill Tier <span className="text-slate-900 ml-2">{session.level}</span></div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-indigo-50 transition-colors"><User className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /></div>
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">Gender Rule <span className="text-slate-900 ml-2">{session.gender}</span></div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-amber-50 transition-colors"><DollarSign className="w-4 h-4 text-amber-300 group-hover:text-amber-500" /></div>
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">Slot Fee <span className="text-indigo-600 ml-2">A${session.price}</span></div>
                                </div>
                            </div>

                            <div className="space-y-2.5 pt-4">
                                {session.status !== 'completed' && (
                                    <>
                                        <VenueButton 
                                            variant="secondary" 
                                            size="lg" 
                                            className="w-full"
                                            onClick={() => setIsEditing(true)}
                                            icon={<Edit3 className="w-4 h-4" />}
                                        >
                                            Modify Instance
                                        </VenueButton>

                                        {session.status !== 'cancelled' ? (
                                            <VenueButton variant="danger" size="lg" className="w-full" onClick={onCancel}>
                                                Force Cancel Session
                                            </VenueButton>
                                        ) : (
                                            <VenueButton variant="success" size="lg" className="w-full" onClick={() => onUpdate({ status: 'published' })}>
                                                Reactivate Session
                                            </VenueButton>
                                        )}
                                    </>
                                )}
                                <VenueButton 
                                    variant="outline" 
                                    size="lg" 
                                    className="w-full border-2" 
                                    onClick={() => setShowParticipants(true)}
                                    icon={<Users className="w-4 h-4" />}
                                >
                                    View Player List
                                </VenueButton>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in zoom-in-95 duration-200">
                            <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">Modify Instance Data</h4>
                            <div className="space-y-5 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                                <div>
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Instance Sport</label>
                                    <select value={session.sport} onChange={(e) => onUpdate({ sport: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-700 shadow-sm focus:border-indigo-500 transition-all outline-none">
                                        {SPORTS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Start</label>
                                        <input type="time" value={session.start_time} onChange={e => onUpdate({ start_time: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-700 shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">End</label>
                                        <input type="time" value={session.end_time} onChange={e => onUpdate({ end_time: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-700 shadow-sm" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Max Cap.</label>
                                        <input type="number" value={session.max_participants} onChange={e => onUpdate({ max_participants: parseInt(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-700 shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Rate (A$)</label>
                                        <input type="number" value={session.price} onChange={e => onUpdate({ price: parseFloat(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-indigo-600 shadow-sm font-black" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <VenueButton variant="ghost" size="lg" className="flex-1" onClick={() => setIsEditing(false)}>Discard Changes</VenueButton>
                                <VenueButton variant="primary" size="lg" className="flex-1 shadow-lg shadow-indigo-100" onClick={() => onUpdate({})}>Commit Changes</VenueButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};
