import React from 'react'
import {
  X,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  Award,
  User,
  DollarSign,
  Edit3,
  Check,
  Users,
} from 'lucide-react'
import { format } from 'date-fns'
import { VenueButton } from './ui/VenueButton'
import { VenueBadge } from './ui/VenueBadge'

interface GeneratedSession {
  id: string
  date: Date
  start_time: string
  end_time: string
  sport: string
  status: 'published' | 'cancelled' | 'draft' | 'completed' | 'full'
  max_participants: number
  participants_count: number
  level: string
  gender: string
  price: number
}

interface Participant {
  id: string
  name: string
  level_rating: string
  has_paid: boolean
}

interface VenueSessionDrawerProps {
  session: GeneratedSession
  onClose: () => void
  showParticipants: boolean
  setShowParticipants: (show: boolean) => void
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  onUpdate: (updates: Partial<GeneratedSession>) => void
  onCancel: () => void
  mockParticipants: Participant[]
  SPORTS: string[]
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
  SPORTS,
}) => {
  const getStatusVariant = (status: GeneratedSession['status']) => {
    switch (status) {
      case 'published':
        return 'emerald'
      case 'full':
        return 'amber'
      case 'completed':
        return 'slate'
      case 'cancelled':
        return 'red'
      default:
        return 'default'
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-center bg-slate-900/10 font-sans backdrop-blur-[2px]">
      <div className="relative h-full w-full max-w-screen-md">
        <div className="absolute bottom-0 right-0 top-0 z-[110] flex w-full flex-col bg-white p-0 shadow-2xl duration-300 animate-in slide-in-from-right md:w-[420px]">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/20 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              {showParticipants && (
                <button
                  onClick={() => setShowParticipants(false)}
                  className="rounded-xl border border-slate-100 p-2 shadow-sm transition-all hover:bg-white active:scale-90"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-400" />
                </button>
              )}
              <div>
                <h3 className="mb-0.5 text-sm font-black uppercase leading-none tracking-tight text-slate-900">
                  {showParticipants ? 'Live Roster' : isEditing ? 'Edit Instance' : 'Instance Dashboard'}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {format(session.date, 'EEEE, MMM d, yyyy')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-2xl border border-transparent p-2.5 shadow-sm transition-all hover:border-red-100 hover:bg-white hover:text-red-500 active:scale-95"
            >
              <X className="h-5 w-5 text-slate-300" />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-7">
            {showParticipants ? (
              <div className="space-y-6 duration-300 animate-in fade-in slide-in-from-right-2">
                <div className="rounded-[1.5rem] bg-slate-900 p-5 text-white shadow-xl shadow-slate-200">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Summary Status
                    </div>
                    <VenueBadge
                      variant="emerald"
                      size="xs"
                    >
                      Live Inventory
                    </VenueBadge>
                  </div>
                  <div className="text-2xl font-black">
                    {session.participants_count}{' '}
                    <span className="text-lg text-slate-500">/ {session.max_participants}</span>
                  </div>
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800 shadow-inner">
                    <div
                      className="h-full rounded-full bg-venue-500 transition-all duration-1000"
                      style={{
                        width: `${(session.participants_count / session.max_participants) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  {mockParticipants.slice(0, session.participants_count).map((p) => (
                    <div
                      key={p.id}
                      className="group flex items-center gap-4 rounded-[1.25rem] border border-slate-100 bg-white p-4 transition-all hover:border-venue-100 hover:shadow-lg hover:shadow-venue-50/50"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xs font-black uppercase text-slate-400 shadow-inner transition-colors group-hover:bg-venue-50 group-hover:text-venue-400">
                        {p.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-black uppercase tracking-tight text-slate-800">{p.name}</div>
                        <div className="text-[10px] font-black tracking-widest text-slate-400">{p.level_rating}</div>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-emerald-100/50 bg-emerald-50 px-3 py-1.5 transition-all group-hover:shadow-sm">
                        <Check className="h-3.5 w-3.5 stroke-[3] text-emerald-600" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Paid</span>
                      </div>
                    </div>
                  ))}

                  {session.participants_count === 0 && (
                    <div className="group py-24 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-100 bg-slate-50 opacity-20 transition-all group-hover:opacity-100">
                        <Users className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Waiting for registrations
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : !isEditing ? (
              <div className="space-y-6 duration-300 animate-in slide-in-from-right-4">
                <div className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-7 shadow-xl shadow-slate-200/40">
                  <div className="pointer-events-none absolute right-0 top-0 p-4 opacity-5 transition-transform group-hover:scale-110">
                    <CalendarIcon className="-mr-16 -mt-16 h-32 w-32" />
                  </div>

                  <div className="mb-6 flex items-center justify-between">
                    <VenueBadge
                      variant="indigo"
                      size="sm"
                    >
                      {session.sport}
                    </VenueBadge>
                    <VenueBadge
                      variant={getStatusVariant(session.status)}
                      size="sm"
                    >
                      {session.status}
                    </VenueBadge>
                  </div>
                  <h4 className="mb-2 text-2xl font-black uppercase tracking-tighter text-slate-900">
                    {format(session.date, 'MMMM do')}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-200"></div>
                    <Clock className="h-3.5 w-3.5 text-venue-400" />
                    {session.start_time} — {session.end_time}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group rounded-2xl border border-slate-100/50 bg-slate-50 p-5 text-center shadow-inner">
                    <div className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400 transition-colors group-hover:text-venue-400">
                      Max Capacity
                    </div>
                    <div className="text-2xl font-black tabular-nums text-slate-900">{session.max_participants}</div>
                  </div>
                  <div className="group rounded-2xl border border-venue-100/50 bg-venue-50/30 p-5 text-center shadow-inner">
                    <div className="mb-1 text-[9px] font-black uppercase tracking-widest text-venue-300 transition-colors group-hover:text-amber-500">
                      Registered
                    </div>
                    <div className="text-2xl font-black tabular-nums text-venue-600">{session.participants_count}</div>
                  </div>
                </div>

                <div className="space-y-4 rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="group flex items-center gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 transition-colors group-hover:bg-venue-50">
                      <Award className="h-4 w-4 text-slate-400 group-hover:text-venue-400" />
                    </div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Skill Tier <span className="ml-2 text-slate-900">{session.level}</span>
                    </div>
                  </div>
                  <div className="group flex items-center gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 transition-colors group-hover:bg-venue-50">
                      <User className="h-4 w-4 text-slate-400 group-hover:text-venue-400" />
                    </div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Gender Rule <span className="ml-2 text-slate-900">{session.gender}</span>
                    </div>
                  </div>
                  <div className="group flex items-center gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 transition-colors group-hover:bg-amber-50">
                      <DollarSign className="h-4 w-4 text-amber-300 group-hover:text-amber-500" />
                    </div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Slot Fee <span className="ml-2 text-venue-600">A${session.price}</span>
                    </div>
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
                        icon={<Edit3 className="h-4 w-4" />}
                      >
                        Modify Instance
                      </VenueButton>

                      {session.status !== 'cancelled' ? (
                        <VenueButton
                          variant="danger"
                          size="lg"
                          className="w-full"
                          onClick={onCancel}
                        >
                          Force Cancel Session
                        </VenueButton>
                      ) : (
                        <VenueButton
                          variant="success"
                          size="lg"
                          className="w-full"
                          onClick={() => onUpdate({ status: 'published' })}
                        >
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
                    icon={<Users className="h-4 w-4" />}
                  >
                    View Player List
                  </VenueButton>
                </div>
              </div>
            ) : (
              <div className="space-y-6 duration-200 animate-in zoom-in-95">
                <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Modify Instance Data</h4>
                <div className="space-y-5 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-6">
                  <div>
                    <label className="mb-1.5 ml-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Instance Sport
                    </label>
                    <select
                      value={session.sport}
                      onChange={(e) => onUpdate({ sport: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-sm outline-none transition-all focus:border-venue-500"
                    >
                      {SPORTS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 ml-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Start
                      </label>
                      <input
                        type="time"
                        value={session.start_time}
                        onChange={(e) => onUpdate({ start_time: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 ml-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                        End
                      </label>
                      <input
                        type="time"
                        value={session.end_time}
                        onChange={(e) => onUpdate({ end_time: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 ml-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Max Cap.
                      </label>
                      <input
                        type="number"
                        value={session.max_participants}
                        onChange={(e) => onUpdate({ max_participants: parseInt(e.target.value) })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 ml-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Rate (A$)
                      </label>
                      <input
                        type="number"
                        value={session.price}
                        onChange={(e) => onUpdate({ price: parseFloat(e.target.value) })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-venue-600 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <VenueButton
                    variant="ghost"
                    size="lg"
                    className="flex-1"
                    onClick={() => setIsEditing(false)}
                  >
                    Discard Changes
                  </VenueButton>
                  <VenueButton
                    variant="primary"
                    size="lg"
                    className="flex-1 shadow-lg shadow-venue-100"
                    onClick={() => onUpdate({})}
                  >
                    Commit Changes
                  </VenueButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
