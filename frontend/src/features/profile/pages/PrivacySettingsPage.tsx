import { ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

export function PrivacySettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white pb-[120px] text-slate-900">
      <ActionToolbar
        onBack={() => navigate(-1)}
        showShare={false}
        showFavorite={false}
        title={<span className="text-lg font-semibold text-slate-900">Privacy</span>}
        contentClassName="max-w-3xl px-4"
        borderBottom
      />

      <div className="mx-auto w-full max-w-3xl px-4 pb-8 pt-4 space-y-6">
        <Section title="Data & visibility" icon={<ShieldCheck className="h-5 w-5 text-slate-500" />}>
          <Row label="Profile visibility" value="Only mates" />
        </Section>

        <Section title="Security" icon={<ShieldCheck className="h-5 w-5 text-slate-500" />}>
          <Row label="Sessions" value="Log out other devices" />
        </Section>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
  icon,
}: {
  title: string
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <section className="space-y-3 rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  )
}
