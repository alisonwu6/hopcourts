import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, CalendarClock, CheckCircle2, ChevronRight, Building2, Users, Zap, BarChart3 } from 'lucide-react'
import { ManagedVenue, VenueDashboardData } from '../services/venuePortalService'

interface VenueDashboardViewProps {
  venues: ManagedVenue[]
  selectedVenueId: string | null
  dashboardData: VenueDashboardData | null
}

type StatPeriod = '7d' | '30d' | 'all'

export function VenueDashboardView({
  venues,
  selectedVenueId,
  dashboardData,
}: VenueDashboardViewProps) {
  const [period, setPeriod] = useState<StatPeriod>('7d')

  const venueId = selectedVenueId ?? venues[0]?.id ?? null

  return (
    <div className="text-slate-900">
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
