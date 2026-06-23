import React, { useEffect, useMemo, useRef, useState } from 'react'
import { format, isSameDay, isToday } from 'date-fns'
import { Eye, Lock, Plus } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Court {
  id: string
  name: string
  supported_sports?: string[]
}

interface Session {
  id: string
  date: Date
  start_time: string
  status: string
  participants_count: number
  max_participants?: number
  sport: string
  court_id?: string | null
  court_name?: string | null
}

// 5 states matching the reference design
type CellStatus = 'closed' | 'available' | 'open' | 'full' | 'locked'

interface ActiveCell {
  courtId: string
  courtName: string
  sport?: string
  hour: string
  status: CellStatus
  session?: Session
}

const DEFAULT_HOURS = [
  '07','08','09','10','11','12','13',
  '14','15','16','17','18','19','20','21','22',
]

// ─── Legend ───────────────────────────────────────────────────────────────────

const LEGEND: { label: string; bg: string; text: string }[] = [
  { label: 'Open',      bg: 'bg-[#d4edbe]',   text: 'text-[#2d6a0f]' },
  { label: 'Full',      bg: 'bg-orange-100',   text: 'text-orange-600' },
  { label: 'Locked',    bg: 'bg-rose-100',     text: 'text-rose-500' },
  { label: 'Closed',    bg: 'bg-slate-200',    text: 'text-slate-400' },
  { label: 'Available', bg: 'bg-white border border-slate-300', text: 'text-slate-400' },
]

// ─── Cell state resolver ──────────────────────────────────────────────────────

function isPastSlot(date: Date, hour: string) {
  const slotStart = new Date(date)
  slotStart.setHours(Number(hour), 0, 0, 0)
  return slotStart.getTime() < Date.now()
}

function resolveCellStatus(
  courtId: string,
  hour: string,
  date: Date,
  sessions: Session[],
  isFirstCourt: boolean,
): { status: CellStatus; session?: Session } {
  // Check sessions FIRST — a booked past slot must still show as open/full, not closed.
  const session = sessions.find(
    (s) =>
      isSameDay(s.date, date) &&
      s.start_time.startsWith(`${hour}:`) &&
      // Exact court match, or pin legacy sessions (court_id = null) to the first
      // court row only. Court order must remain stable to keep this pinning consistent.
      (String(s.court_id) === String(courtId) || (!s.court_id && isFirstCourt))
  )

  if (!session) {
    if (isPastSlot(date, hour)) return { status: 'closed' }
    return { status: 'available' }
  }

  // Cancelled / draft → locked (restricted, not bookable)
  if (session.status === 'cancelled' || session.status === 'draft') {
    return { status: 'locked', session }
  }

  const max = session.max_participants ?? 0
  const joined = session.participants_count ?? 0
  if (max > 0 && joined >= max) return { status: 'full', session }

  return { status: 'open', session }
}

// ─── Cell ─────────────────────────────────────────────────────────────────────

const CELL_STYLE: Record<CellStatus, string> = {
  closed:    'cursor-default border-slate-200 bg-slate-100 text-slate-300',
  available: 'border-slate-200 bg-white text-slate-300 hover:border-[#b8d890] hover:bg-[#f7fbef]',
  open:      'border-[#b8d890] bg-[#eaf6d8] text-[#2d6a0f] hover:bg-[#d8f0b8]',
  full:      'border-orange-200 bg-orange-50 text-orange-600',
  locked:    'border-rose-200 bg-rose-50 text-rose-500',
}

function MatrixCell({
  status,
  session,
  selected,
  onClick,
}: {
  status: CellStatus
  session?: Session
  selected: boolean
  onClick: () => void
}) {
  const disabled = status === 'closed'
  const max = session?.max_participants ?? 0
  const joined = session?.participants_count ?? 0
  const spots = max > 0 ? Math.max(max - joined, 0) : null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative flex h-14 w-14 flex-col items-center justify-center rounded-xl border transition-all active:scale-95 ${CELL_STYLE[status]} ${selected ? 'ring-2 ring-[#1A3A0A] ring-offset-1' : ''}`}
    >
      {status === 'closed' && (
        <span className="text-[10px] font-bold text-slate-300">–</span>
      )}
      {status === 'available' && (
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
      )}
      {status === 'open' && (
        <>
          <span className="text-sm font-black tabular-nums leading-none">{spots ?? '·'}</span>
          <span className="mt-0.5 text-[9px] font-bold lowercase tracking-wide opacity-70">spots</span>
        </>
      )}
      {status === 'full' && (
        <>
          <span className="text-[11px] font-black uppercase leading-none">Full</span>
          <span className="mt-0.5 text-[9px] font-semibold tabular-nums opacity-70">{joined}/{max}</span>
        </>
      )}
      {status === 'locked' && (
        <Lock className="h-4 w-4 opacity-70" />
      )}
    </button>
  )
}

// ─── Action panel ─────────────────────────────────────────────────────────────

function ActionPanel({
  cell,
  onViewSession,
  onAddSlot,
  onDismiss,
}: {
  cell: ActiveCell
  onViewSession: () => void
  onAddSlot: () => void
  onDismiss: () => void
}) {
  const h = Number(cell.hour)
  const h12 = h % 12 || 12
  const ampm = h < 12 ? 'am' : 'pm'
  const timeLabel = `${h12}:00 ${ampm}`

  const isAvailable = cell.status === 'available'
  const isOpen = cell.status === 'open'
  const isFull = cell.status === 'full'
  const isLocked = cell.status === 'locked'

  const iconBg =
    isOpen ? 'bg-[#eaf6d8] text-[#2d6a0f]'
    : isFull ? 'bg-orange-50 text-orange-500'
    : isLocked ? 'bg-rose-50 text-rose-500'
    : 'bg-slate-100 text-slate-400'

  const Icon = (isOpen || isFull) ? Eye : isLocked ? Lock : Plus

  const statusLabel =
    isOpen ? 'Open · Available to join'
    : isFull ? 'Full · No spots remaining'
    : isLocked ? 'Locked · Restricted session'
    : 'Available to schedule'

  return (
    <div className="mt-3 border-t border-slate-100 bg-white px-5 py-4 duration-200 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black leading-tight text-[#1A3A0A]">
            {cell.courtName} · {timeLabel}
          </h3>
          <p className="mt-1 text-sm font-semibold text-[#7b8b72]">
            {cell.session?.sport || cell.sport || 'Court'} · {statusLabel}
          </p>
        </div>
      </div>

      <div className="mt-4 pl-[4.5rem]">
        {isAvailable && (
          <button
            type="button"
            onClick={onAddSlot}
            className="w-full rounded-2xl bg-slate-100 px-5 py-3 text-base font-black text-slate-800 transition hover:bg-slate-200 active:scale-[0.99]"
          >
            + Add slot here
          </button>
        )}
        {(isOpen || isFull || isLocked) && (
          <button
            type="button"
            onClick={onViewSession}
            className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-base font-black text-white transition hover:bg-slate-800 active:scale-[0.99]"
          >
            View session
          </button>
        )}
      </div>

      <button type="button" onClick={onDismiss} className="sr-only">Dismiss</button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface VenueMatrixGridProps {
  date: Date
  courts: Court[]
  hours?: string[]
  onViewSession?: (session: Session) => void
  onCreateAvailableSlot?: (cell: ActiveCell) => void
  sessions?: Session[]
}

export function VenueMatrixGrid({
  date,
  courts,
  hours = DEFAULT_HOURS,
  onViewSession,
  onCreateAvailableSlot,
  sessions = [],
}: VenueMatrixGridProps) {
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const currentHour = useMemo(() => {
    if (!isToday(date) || hours.length === 0) return null
    const nowHour = new Date().getHours()
    const hourNumbers = hours.map((h) => Number(h))
    const exactIndex = hourNumbers.indexOf(nowHour)
    if (exactIndex >= 0) return hours[exactIndex]
    const nextIndex = hourNumbers.findIndex((h) => h > nowHour)
    if (nextIndex >= 0) return hours[nextIndex]
    return hours[hours.length - 1]
  }, [date, hours])

  useEffect(() => {
    if (!currentHour) return
    // Scroll to 1 hour before current so the operator sees a slice of recent context
    // plus all upcoming hours. setTimeout(300) waits for React to finish mounting the table.
    const targetHour = Math.max(Number(hours[0]), Number(currentHour) - 1)
    const timer = setTimeout(() => {
      document
        .getElementById(`time-col-${targetHour}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    }, 300)
    return () => clearTimeout(timer)
  }, [currentHour, hours])

  const handleCellClick = (court: Court, hour: string, isFirstCourt: boolean) => {
    const { status, session } = resolveCellStatus(court.id, hour, date, sessions, isFirstCourt)
    if (status === 'closed') return

    if (activeCell?.courtId === court.id && activeCell?.hour === hour) {
      setActiveCell(null)
      return
    }
    setActiveCell({ courtId: court.id, courtName: court.name, sport: court.supported_sports?.[0], hour, status, session })
  }

  const handleAddSlot = () => {
    if (!activeCell) return
    onCreateAvailableSlot?.({ courtId: activeCell.courtId, courtName: activeCell.courtName, sport: activeCell.sport, hour: activeCell.hour, status: activeCell.status })
    setActiveCell(null)
  }

  const handleViewSession = () => {
    if (!activeCell?.session) return
    onViewSession?.(activeCell.session)
    setActiveCell(null)
  }

  if (courts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <Lock className="h-5 w-5 text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-400">No courts configured</p>
        <p className="text-xs text-slate-300">Add courts in Venue Profile to manage slots.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {LEGEND.map(({ label, bg, text }) => (
          <span key={label} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className={`h-4 w-4 shrink-0 rounded ${bg}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div ref={scrollRef} className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <table className="border-collapse" style={{ minWidth: `${6.5 + hours.length * 4}rem` }}>
          <thead>
            <tr className="border-b border-slate-100">
              <th className="sticky left-0 z-20 min-w-[6rem] bg-white py-3 pl-4 pr-3 text-left shadow-[1px_0_0_0_rgba(226,232,240,1)]">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Court</span>
              </th>
              {hours.map((h) => {
                const h12 = Number(h) % 12 || 12
                const ampm = Number(h) < 12 ? 'am' : 'pm'
                const isCurrentHour = h === currentHour
                return (
                  <th
                    key={h}
                    id={`time-col-${Number(h)}`}
                    data-hour={h}
                    className={`min-w-16 px-1 py-3 text-center ${isCurrentHour ? 'bg-[#eef8df]' : ''}`}
                  >
                    <span className={`text-[10px] font-black tabular-nums ${isCurrentHour ? 'text-[#1A3A0A]' : 'text-slate-400'}`}>
                      {h12}{ampm}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {courts.map((court, ri) => (
              <tr key={court.id} className={ri % 2 === 0 ? 'bg-white' : 'bg-[#fafaf8]'}>
                <td className="sticky left-0 z-20 border-r border-slate-100 bg-white py-3 pl-4 pr-3 shadow-[1px_0_0_0_rgba(226,232,240,1)]">
                  <span className="block text-sm font-black leading-tight text-slate-800">{court.name}</span>
                  {court.supported_sports && court.supported_sports.length > 0 && (
                    <span className="block max-w-[5rem] truncate text-[10px] font-semibold text-slate-400">
                      {court.supported_sports.join(' & ')}
                    </span>
                  )}
                </td>
                {hours.map((h) => {
                  const { status, session } = resolveCellStatus(court.id, h, date, sessions, ri === 0)
                  const isSelected = activeCell?.courtId === court.id && activeCell?.hour === h
                  const isCurrentHour = h === currentHour
                  return (
                    <td key={h} className={`px-1 py-2 ${isCurrentHour ? 'bg-[#f7fbef]' : ''}`}>
                      <MatrixCell
                        status={status}
                        session={session}
                        selected={isSelected}
                        onClick={() => handleCellClick(court, h, ri === 0)}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeCell ? (
        <ActionPanel
          cell={activeCell}
          onViewSession={handleViewSession}
          onAddSlot={handleAddSlot}
          onDismiss={() => setActiveCell(null)}
        />
      ) : (
        <p className="py-1 text-center text-[11px] font-semibold text-slate-300">Tap any slot to see details</p>
      )}
    </div>
  )
}
