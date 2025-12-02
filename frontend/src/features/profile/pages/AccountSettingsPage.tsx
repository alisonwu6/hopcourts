import { Lock, Shield, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

export function AccountSettingsPage() {
  const navigate = useNavigate()
  const method = 'email'
  const email = 'alison@example.com'

  return (
    <div className="min-h-screen bg-white pb-[120px] text-slate-900">
      <ActionToolbar
        onBack={() => navigate(-1)}
        showShare={false}
        showFavorite={false}
        title={<span className="text-lg font-semibold text-slate-900">My account</span>}
        contentClassName="max-w-3xl px-4"
        borderBottom
      />

      <div className="mx-auto w-full max-w-3xl px-4 pb-8 pt-4 space-y-6">
        <Section title="Account information" icon={<UserRound className="h-5 w-5 text-slate-500" />}>
          <Row label="Email" value={email} />
          <Row label="Sign in with" value="Apple / Google / Email" />
        </Section>

        <Section title="Password" icon={<Lock className="h-5 w-5 text-slate-500" />}>
          {method === 'email' ? (
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">Reset password</button>
          ) : (
            <p className="text-sm text-slate-500">Password reset available for email sign-in.</p>
          )}
        </Section>

        <Section title="Danger zone" icon={<Shield className="h-5 w-5 text-rose-400" />}>
          <button
            className="w-full rounded-lg bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-500"
            disabled
          >
            Delete my account (coming soon)
          </button>
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
