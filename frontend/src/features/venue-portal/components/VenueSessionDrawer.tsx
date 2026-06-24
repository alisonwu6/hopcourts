import React, { useEffect, useState } from 'react'
import { X, Users } from 'lucide-react'
import { format } from 'date-fns'
import { venuePortalService } from '../services/venuePortalService'
import { cacheGet, cacheSet } from '../services/venuePortalCache'

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
  court_name?: string | null
}

interface RealParticipant {
  user_id: string
  display_name: string
  avatar_url: string | null
  role: string
  joined_at: string
}

interface VenueSessionDrawerProps {
  session: GeneratedSession
  onClose: () => void
  onUpdate: (updates: Partial<GeneratedSession>) => void
  onCancel: () => void
  SPORTS: string[]
}

export const VenueSessionDrawer: React.FC<VenueSessionDrawerProps> = ({
  session,
  onClose,
  onUpdate,
  onCancel,
  SPORTS,
}) => {
  const [sport, setSport] = useState(session.sport)
  const [maxCap, setMaxCap] = useState(session.max_participants)
  const [rate, setRate] = useState(session.price)
  const [participants, setParticipants] = useState<RealParticipant[]>([])

  useEffect(() => {
    if (!session.id) return
    const cacheKey = `participants:${session.id}`
    const cached = cacheGet<RealParticipant[]>(cacheKey)
    if (cached) { setParticipants(cached); return }
    venuePortalService.getEventParticipants(session.id).then((res) => {
      if (res.success && res.data) {
        setParticipants(res.data)
        cacheSet(cacheKey, res.data)
      }
    })
  }, [session.id])

  const isDirty =
    sport !== session.sport ||
    maxCap !== session.max_participants ||
    rate !== session.price

  const handleCommit = () => {
    onUpdate({ sport, max_participants: maxCap, price: rate })
  }

  const h = Number(session.start_time.split(':')[0]) || 0
  const h12 = h % 12 || 12
  const ampm = h < 12 ? 'am' : 'pm'
  const timeLabel = `${h12}:00 ${ampm}`
  const courtLabel = session.court_name
    ? `${session.court_name} · ${timeLabel}`
    : timeLabel

  const pct = session.max_participants > 0
    ? (session.participants_count / session.max_participants) * 100
    : 0

  const isCancelled = session.status === 'cancelled'

  return (
    <div className="fixed inset-0 z-[100] flex justify-center bg-slate-900/10 font-sans backdrop-blur-[2px]">
      <div className="relative h-full w-full max-w-[1024px]">
        <div className="absolute bottom-0 right-0 top-0 z-[110] flex w-full flex-col bg-white shadow-2xl duration-300 animate-in slide-in-from-right md:w-[420px]">

          {/* ── Header ── */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {format(session.date, 'EEE, MMM d, yyyy')}
              </p>
              <h2 className="mt-0.5 text-lg font-black leading-tight text-slate-900">
                {courtLabel}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent transition hover:border-slate-200 hover:bg-slate-50 active:scale-90"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto">

            {/* 1 ── Live Roster ── */}
            <div className="p-5 pb-0">
              <div className="rounded-2xl bg-slate-900 p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Summary Status
                  </span>
                  <span className="rounded-full bg-[#3cba6e] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-900">
                    Live Inventory
                  </span>
                </div>
                <div className="mt-2 text-3xl font-black tabular-nums">
                  {session.participants_count}
                  <span className="ml-1 text-xl text-slate-500">/ {session.max_participants}</span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-[#3cba6e] transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Player list */}
                <div className="mt-4 border-t border-slate-800 pt-4">
                  {participants.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-6 text-center">
                      <Users className="h-6 w-6 text-slate-600" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Waiting for registrations
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {participants.map((p) => (
                        <div key={p.user_id} className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-black text-slate-300">
                            {p.avatar_url
                              ? <img src={p.avatar_url} className="h-8 w-8 rounded-full object-cover" alt="" />
                              : (p.display_name.charAt(0).toUpperCase())}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-bold text-white">{p.display_name}</p>
                            <p className="text-[10px] text-slate-500">{p.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2 ── Modify fields ── */}
            {!isCancelled && (
              <div className="p-5 pt-4">
                <p className="mb-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Modify constraints
                </p>
                <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Sport
                    </label>
                    <select
                      value={sport}
                      onChange={(e) => setSport(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#2f6d16]"
                    >
                      {SPORTS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Max cap.
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={maxCap}
                        onChange={(e) => setMaxCap(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-black text-slate-800 outline-none focus:border-[#2f6d16]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Rate (A$)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-black text-slate-800 outline-none focus:border-[#2f6d16]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Sticky footer actions ── */}
          <div className="shrink-0 space-y-2.5 border-t border-slate-100 px-5 py-4">
            {!isCancelled ? (
              <>
                <button
                  type="button"
                  onClick={handleCommit}
                  disabled={!isDirty}
                  className="w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-black text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Commit Changes
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full rounded-2xl bg-rose-50 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-100 active:scale-[0.99]"
                >
                  Force Cancel Session
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onUpdate({ status: 'published' })}
                className="w-full rounded-2xl bg-[#1A3A0A] py-3.5 text-sm font-black text-white transition hover:bg-[#244d10] active:scale-[0.99]"
              >
                Reactivate Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
