import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BadgeCheck, Calendar, CalendarClock, CheckCircle2, ChevronRight, Building2, Users, Zap, BarChart3 } from 'lucide-react'
import { VenueBottomNav } from '../components/VenueBottomNav'
import { ManagedVenue, VenueDashboardData } from '../services/venuePortalService'

interface VenueDashboardViewProps {
  loading: boolean
  venues: ManagedVenue[]
  selectedVenueId: string | null
  setSelectedVenueId: (id: string) => void
  dashboardData: VenueDashboardData | null
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function formatTrialEnd(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

type StatPeriod = '7d' | '30d' | 'all'

export function VenueDashboardView({
  loading,
  venues,
  selectedVenueId,
  setSelectedVenueId,
  dashboardData,
}: VenueDashboardViewProps) {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<StatPeriod>('7d')

  if (loading && venues.length === 0) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#f5f7f0] pb-20">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#3c4a22] border-t-transparent" />
        <p className="text-sm font-semibold text-slate-500">Loading your venue...</p>
      </div>
    )
  }

  const activeVenue = venues.find((v) => v.id === selectedVenueId) ?? venues[0]
  const venueName = dashboardData?.venue.name_display ?? activeVenue?.name_display ?? 'My Venue'
  const venueId = selectedVenueId ?? activeVenue?.id ?? null
  const trialEndsAt = activeVenue?.trial_ends_at
  const daysLeft = daysUntil(trialEndsAt)

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-screen-md bg-[#f5f7f0] pb-24 text-slate-900">

      {/* Header */}
      <div className="px-5 pb-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {venues.length > 1 ? (
              <div className="relative inline-block">
                <h1 className="text-2xl font-black leading-tight text-[#1A3A0A]">{venueName}</h1>
                <select
                  value={selectedVenueId || ''}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>{v.name_display}</option>
                  ))}
                </select>
              </div>
            ) : (
              <h1 className="text-2xl font-black leading-tight text-[#1A3A0A]">{venueName}</h1>
            )}
            <p className="mt-0.5 text-sm font-semibold text-[#5a7a2a]">Venue dashboard</p>
          </div>
          <button
            type="button"
            onClick={() => venueId && window.open(`/venues/${venueId}`, '_blank')}
            className="flex-none rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            Public page ↗
          </button>
        </div>

        {/* Trial banner */}
        {daysLeft !== null && (
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#1A3A0A] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#2d5a1a]">
                <BadgeCheck className="h-4 w-4 text-[#a8d060]" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Official trial active</p>
                {trialEndsAt && (
                  <p className="text-xs text-[#a8d060]/80">
                    Ends {formatTrialEnd(trialEndsAt)} · reminder at 3 days
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black leading-none text-[#c8f060]">{daysLeft}</span>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#a8d060]/80">days left</p>
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="px-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Insights</p>
          <div className="flex gap-1 rounded-full bg-slate-200/70 p-0.5">
            {(['7d', '30d', 'all'] as StatPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  period === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                {p === 'all' ? 'All' : p}
              </button>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <StatCard
            label="Events completed"
            value={dashboardData?.stats.sessions_completed ?? 0}
            emptyLabel="No events yet"
            icon={<Calendar className="h-6 w-6" />}
          />
          <StatCard
            label="Total players"
            value={dashboardData?.stats.players_played_here ?? 0}
            emptyLabel="Getting started"
            icon={<Users className="h-6 w-6" />}
          />
          <StatCard
            label="Active now"
            value={dashboardData?.stats.active_events ?? 0}
            emptyLabel="—"
            icon={<Zap className="h-6 w-6" />}
          />
          <StatCard
            label="Weekly avg"
            value={dashboardData?.stats.participants_this_week ?? 0}
            emptyLabel="—"
            icon={<BarChart3 className="h-6 w-6" />}
          />
        </div>
      </div>

      {/* Setup checklist */}
      {dashboardData && (
        <div className="px-5 pt-4">
          <SetupChecklist venueId={venueId} stats={dashboardData.stats} />
        </div>
      )}

      <VenueBottomNav venueId={selectedVenueId} />
    </div>
  )
}

function StatCard({ label, value, emptyLabel, icon }: {
  label: string
  value: number
  emptyLabel: string
  icon: React.ReactNode
}) {
  const isEmpty = value === 0
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white p-4 shadow-sm">
      <div className="absolute right-2 top-2 opacity-[0.07]">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      {isEmpty ? (
        <>
          <div className="my-2 h-6 w-6 rounded-full bg-slate-100" />
          <p className="text-xs font-semibold text-slate-400">{emptyLabel}</p>
        </>
      ) : (
        <p className="mt-1 text-3xl font-black leading-none tracking-tighter text-[#1A3A0A]">{value}</p>
      )}
    </div>
  )
}

type SetupStats = VenueDashboardData['stats']

function SetupChecklist({ venueId, stats }: { venueId: string | null; stats: SetupStats }) {
  const navigate = useNavigate()
  const hasEvents = stats.active_events + stats.sessions_completed > 0

  const steps = [
    {
      label: 'Setup your venue',
      description: 'Add logo, description and facilities',
      icon: <Building2 className="h-5 w-5" />,
      iconBg: 'bg-[#e8f0c2] text-[#1A3A0A]',
      done: false,
      path: `/admin/${venueId}/profile`,
    },
    {
      label: 'Set weekly schedule',
      description: 'Auto-generate recurring sessions',
      icon: <CalendarClock className="h-5 w-5" />,
      iconBg: 'bg-amber-50 text-amber-600',
      done: hasEvents,
      path: `/admin/${venueId}/schedule`,
    },
  ]

  const doneCount = steps.filter((s) => s.done).length
  if (doneCount === steps.length) return null

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-5">
        <h3 className="text-lg font-black leading-tight text-[#1A3A0A]">
          Finish setup to fill your courts
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Players can't find or join your sessions until these are done.
        </p>
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#3c4a22] transition-all duration-500"
              style={{ width: `${(doneCount / steps.length) * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs font-semibold text-slate-400">
            {doneCount} of {steps.length} required steps done
          </p>
        </div>
      </div>

      {steps.map((step, i) => (
        <button
          key={step.label}
          type="button"
          onClick={() => venueId && navigate(step.path)}
          className="flex w-full items-center gap-4 border-b border-slate-100 px-5 py-4 text-left transition last:border-0 active:bg-slate-50"
        >
          <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-400">
            {step.done ? <CheckCircle2 className="h-5 w-5 text-[#3c4a22]" /> : i + 1}
          </span>
          <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-2xl ${step.iconBg}`}>
            {step.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block text-sm font-bold ${step.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
              {step.label}
            </span>
            <span className="block text-xs text-slate-400">{step.description}</span>
          </span>
          {!step.done && <ChevronRight className="h-4 w-4 flex-none text-slate-300" />}
        </button>
      ))}
    </div>
  )
}
