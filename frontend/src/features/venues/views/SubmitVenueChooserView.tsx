import { useState } from 'react'
import { MapPin, ShieldCheck, Check, X } from 'lucide-react'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { useAuthStore } from '@/hooks'
import { httpPost } from '@/api/http'

interface SubmitVenueChooserViewProps {
  onCancel: () => void
  onPickPublic: () => void
  onPickOfficial: () => void
}

const PUBLIC_FEATURES = [
  { included: true, label: 'Instantly visible on search & map' },
  { included: true, label: 'Open to anyone to host pickup games' },
  { included: true, label: 'Free forever for the community' },
]

const OFFICIAL_FEATURES = [
  { included: true, label: 'Everything in Public, plus:' },
  { included: true, label: 'Live court schedule & utilization control' },
  { included: true, label: 'Direct booking & zero-friction payout' },
  { included: true, label: 'Verified Official Badge' },
]

export function SubmitVenueChooserView({ onCancel, onPickPublic, onPickOfficial }: SubmitVenueChooserViewProps) {
  const [waitlistOpen, setWaitlistOpen] = useState(false)

  return (
    <div className="min-h-[100dvh] bg-slate-50/60 pb-12">
      <ActionToolbar
        showBack
        onBack={onCancel}
        title="Submit venue"
        contentClassName="w-full max-w-md px-3"
        borderBottom
      />

      <div className="mx-auto mt-4 w-full max-w-md space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">What kind of venue is this?</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            You can always upgrade to Official later. <br/>
            Nothing here is permanent.
          </p>
        </div>

        <div className="space-y-4">
          <OptionCard
            tone="neutral"
            icon={
              <MapPin
                className="h-6 w-6 text-slate-600"
                strokeWidth={2}
              />
            }
            title="Public listing"
            badge="Free, always"
            description="Just mark a local court on the map so everyone can hop in. 100% community powered."
            features={PUBLIC_FEATURES}
            onClick={onPickPublic}
          />
          <OptionCard
            tone="official"
            icon={
              <ShieldCheck
                className="h-6 w-6 text-[#1A3A0A]"
                strokeWidth={2}
              />
            }
            title="Official venue"
            badge="Coming Soon"
            description="For venue owners and managers. Fill your empty off-peak hours and streamline bookings."
            features={OFFICIAL_FEATURES}
            onClick={() => setWaitlistOpen(true)}
          />
        </div>

        <p className="px-2 text-center text-xs leading-relaxed text-slate-500">
          Not sure? Start with{' '}
          <button
            type="button"
            onClick={onPickPublic}
            className="font-bold text-[#1A3A0A] underline-offset-2 hover:underline"
          >
            Public
          </button>{' '}
          , you can claim it as Official anytime.
        </p>
      </div>

      <OfficialWaitlistDialog
        open={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
      />
    </div>
  )
}

function OfficialWaitlistDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((s) => s.user)
  const [email, setEmail] = useState(user?.email ?? '')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await httpPost('/venues/waitlist', { body: { email } })
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setSubmitted(false)
      setEmail(user?.email ?? '')
    }, 300)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-xs overflow-hidden rounded-[28px] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {submitted ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f0c2]">
              <ShieldCheck
                className="h-7 w-7 text-[#1A3A0A]"
                strokeWidth={2}
              />
            </div>
            <h3 className="text-xl font-bold text-slate-900">You're on the list!</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              We'll reach out as soon as Official venue features go live in your area.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 w-full rounded-[20px] bg-[#1A3A0A] py-3 text-base font-bold text-white transition-transform active:scale-[0.98]"
            >
              Got it
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f0c2]">
              <ShieldCheck
                className="h-7 w-7 text-[#1A3A0A]"
                strokeWidth={2}
              />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Official venue features are on the way!</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              We're building verification tools and automated court booking for venue owners. Leave your email and we'll notify you first.
            </p>
            <form
              onSubmit={handleSubmit}
              className="mt-5 w-full space-y-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#a6c64a] focus:outline-none focus:ring-2 focus:ring-[#a6c64a]/20"
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full rounded-[20px] border border-slate-200 bg-white py-3 text-base font-bold text-slate-700 transition-transform active:scale-[0.98]"
                >
                  Maybe later
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-[20px] bg-[#1A3A0A] py-3 text-base font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? 'Joining…' : 'Notify me'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

function OptionCard({
  tone,
  icon,
  title,
  badge,
  description,
  features,
  onClick,
}: {
  tone: 'neutral' | 'official'
  icon: React.ReactNode
  title: string
  badge: string
  description: string
  features: { included: boolean; label: string }[]
  onClick: () => void
}) {
  const isOfficial = tone === 'official'
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full flex-col items-start gap-4 rounded-3xl border-2 p-5 text-left transition active:scale-[0.99]',
        isOfficial ? 'border-[#a6c64a] bg-[#f3f7e1]' : 'border-slate-200 bg-white',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div
          className={
            'flex h-12 w-12 flex-none items-center justify-center rounded-2xl ' +
            (isOfficial ? 'bg-[#e8f0c2]' : 'bg-slate-100')
          }
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="text-lg font-black leading-tight text-slate-900">{title}</h3>
          <span
            className={
              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ' +
              (isOfficial ? 'bg-[#dbe7b0] text-[#1A3A0A]' : 'bg-slate-100 text-slate-600')
            }
          >
            {badge}
          </span>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-slate-600">{description}</p>

      <ul className="w-full space-y-2 text-sm">
        {features.map((f) => (
          <li
            key={f.label}
            className={'flex items-center gap-2 ' + (f.included ? 'text-slate-700' : 'text-slate-400')}
          >
            {f.included ? (
              <Check
                className="h-4 w-4 flex-none text-[#1A3A0A]"
                strokeWidth={3}
              />
            ) : (
              <X
                className="h-4 w-4 flex-none text-slate-300"
                strokeWidth={2.5}
              />
            )}
            {f.label}
          </li>
        ))}
      </ul>
    </button>
  )
}
