import { X, MapPin, BadgeCheck, Check } from 'lucide-react'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

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
  return (
    <div className="min-h-[100dvh] bg-slate-50/60 pb-12">
      <ActionToolbar
        showBack={false}
        title="Submit venue"
        contentClassName="w-full max-w-md px-3"
        leftContent={
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 items-center justify-center px-2 text-sm font-semibold text-slate-500 transition active:text-slate-700"
            aria-label="Cancel"
          >
            <span className="md:hidden">
              <X
                className="h-5 w-5"
                strokeWidth={2}
              />
            </span>
            <span className="hidden md:inline">Cancel</span>
          </button>
        }
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
              <BadgeCheck
                className="h-6 w-6 text-[#1A3A0A]"
                strokeWidth={2}
              />
            }
            title="Official venue"
            badge="Coming Soon"
            description="For venue owners and managers. Fill your empty off-peak hours and streamline bookings."
            features={OFFICIAL_FEATURES}
            disabled
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
  disabled = false,
}: {
  tone: 'neutral' | 'official'
  icon: React.ReactNode
  title: string
  badge: string
  description: string
  features: { included: boolean; label: string }[]
  onClick?: () => void
  disabled?: boolean
}) {
  const isOfficial = tone === 'official'
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={[
        'flex w-full flex-col items-start gap-4 rounded-3xl border-2 p-5 text-left transition',
        disabled ? 'cursor-default' : 'active:scale-[0.99]',
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
