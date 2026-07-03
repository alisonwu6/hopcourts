import { useNavigate, useLocation } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

const steps = [
  {
    title: 'Set your profile',
    desc: 'Tell us what you play and what you want to pick up. The right games find you.',
    dotColor: 'bg-courts',
  },
  {
    title: 'Hop in & play',
    desc: 'Open the app, find an open slot, show up. No booking. No back-and-forth. No planning.',
    dotColor: 'bg-hop',
  },
  {
    title: 'Build your mates circle',
    desc: "Play with someone once and they're automatically saved. No swapping socials — just play again when you're ready.",
    dotColor: 'bg-courts',
  },
]

export function AboutPage() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-[100dvh] bg-[#edf4ed] text-[#1a3320]">
      <ActionToolbar
        onBack={() => (location.key !== 'default' ? navigate(-1) : navigate('/settings'))}
        showShare={false}
        showFavorite={false}
        showBack
        title={<span className="text-lg font-semibold text-slate-900">About Us</span>}
        borderBottom
      />

      {/* Hero */}
      <section className="px-5 pb-8 pt-8">
        <h1 className="text-[3.25rem] font-black leading-[1.0] tracking-tight text-[#1a3320]">
          Find your game.
          <br />
          No group chats
          <br />
          <span className="text-hop">required.</span>
        </h1>
        <p className="text-courts mt-5 text-base leading-relaxed">
          New to a city or just can&apos;t find people who are into the same sports — we get it. HopCourts was built to
          fix that.
        </p>
        <p className="text-courts mt-3 text-base leading-relaxed">
          We&apos;re not trying to replace your mates. We&apos;re helping you find more of them.
        </p>
      </section>

      <div className="mx-5 border-t border-[#c8d9c4]" />

      {/* Steps */}
      <section className="px-5 py-8">
        <p className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-400">Three steps, that&apos;s it</p>
        <div>
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className={`mt-[5px] h-3 w-3 flex-shrink-0 rounded-full ${step.dotColor}`} />
                {i < steps.length - 1 && (
                  <div
                    className="mt-1 w-px flex-1 bg-[#c8d9c4]"
                    style={{ minHeight: '36px' }}
                  />
                )}
              </div>
              <div className={i < steps.length - 1 ? 'pb-6' : 'pb-0'}>
                <h3 className="text-lg font-bold text-[#1a3320]">{step.title}</h3>
                <p className="text-courts mt-1 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="px-5 pb-10">
        <div className="rounded-3xl bg-courts px-6 py-7">
          <p className="text-[16px] font-black leading-snug tracking-tight text-white">
            "A ball and a court should be enough. We're building the missing piece."
          </p>
          <p className="mt-4 text-sm font-semibold text-white/80">— HopCourts Team</p>
        </div>
      </section>
    </div>
  )
}
