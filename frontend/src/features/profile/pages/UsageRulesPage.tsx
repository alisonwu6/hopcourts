import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

export function UsageRulesPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white pb-[120px] text-slate-900">
      <ActionToolbar
        onBack={() => navigate('/settings')}
        showShare={false}
        showFavorite={false}
        title={<span className="text-lg font-semibold text-slate-900">Community Guidelines</span>}
        contentClassName="max-w-3xl px-4"
        showBack
        borderBottom
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="space-y-8 text-base leading-relaxed text-slate-600">
          <section>
            <p>Welcome to HopCourts.</p>
            <p className="mt-3">
              HopCourts is a place to organize and join sports events with people across your city. To keep our
              community safe and enjoyable for everyone, please follow these guidelines.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-slate-900">1. Be Authentic and Respectful</h2>
            <p>
              Use your real identity and treat others with respect and fairness. Harassment, discrimination, abuse, or
              inappropriate behavior may lead to account restriction or termination.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-slate-900">2. Personal Responsibility and Safety</h2>
            <p>
              All events are created and organized by users. Before participating, make sure you are physically fit to
              join and have considered any safety risks. If you have health concerns, consult a medical professional
              first.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-slate-900">3. Host and Participant Responsibilities</h2>
            <p>
              Hosts are responsible for session details such as time and venue arrangements. Participants should verify
              event information themselves. HopCourts does not manage or supervise in-person events.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-slate-900">4. Venues and Fees</h2>
            <p>
              Before attending, please ensure the venue is appropriate and safe for the activity. Venue rules and fees
              are determined by the venue provider.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-slate-900">5. Privacy and Boundaries</h2>
            <p>
              Participating in the same session doesn&apos;t mean you know each other personally. Please respect
              others&apos; privacy and personal boundaries.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-slate-900">6. Enforcement</h2>
            <p>If violations occur, we reserve the right to suspend or terminate your account.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
