import { Link, useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

type SectionColor = {
  badge: string
  card: string
}

const COLORS: SectionColor[] = [
  { badge: 'bg-green-100 text-green-700', card: 'bg-white' },
  { badge: 'bg-blue-100 text-blue-700', card: 'bg-white' },
  { badge: 'bg-orange-100 text-orange-700', card: 'bg-white' },
  { badge: 'bg-purple-100 text-purple-700', card: 'bg-white' },
  { badge: 'bg-slate-100 text-slate-600', card: 'bg-white' },
  { badge: 'bg-red-400 text-red-50', card: 'bg-red-50' },
]

const SECTIONS = [
  {
    id: 1,
    title: 'Be Authentic and Respectful',
    body: 'Use your real identity and treat others with respect and fairness. Harassment, discrimination, abuse, or inappropriate behaviour may lead to account restriction or termination.',
  },
  {
    id: 2,
    title: 'Personal Responsibility and Safety',
    body: 'All events are created and organised by users. Before participating, make sure you are physically fit to join and have considered any safety risks. If you have health concerns, consult a medical professional first.',
  },
  {
    id: 3,
    title: 'Host and Participant Responsibilities',
    body: 'Hosts are responsible for session details such as time and venue arrangements. Participants should verify event information themselves. HopCourts does not manage or supervise in-person events.',
  },
  {
    id: 4,
    title: 'Venues and Fees',
    body: 'Before attending, please ensure the venue is appropriate and safe for the activity. Venue rules and fees are determined by the venue provider.',
  },
  {
    id: 5,
    title: 'Privacy and Boundaries',
    body: "Participating in the same session doesn't mean you know each other personally. Please respect others' privacy and personal boundaries.",
  },
  {
    id: 6,
    title: 'Enforcement',
    body: 'If violations occur, we reserve the right to suspend or terminate your account.',
  },
]

function SectionBadge({ index }: { index: number }) {
  const color = COLORS[index]
  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${color.badge}`}>
      {index + 1}
    </span>
  )
}

export function UsageRulesPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[100dvh] bg-white text-slate-900">
      <ActionToolbar
        onBack={() => navigate('/settings')}
        showShare={false}
        showFavorite={false}
        title={<span className="text-lg font-semibold text-slate-900">Community Guidelines</span>}
        contentClassName="max-w-3xl px-4"
        showBack
        borderBottom
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-[#1e3d2b]">
        {/* Badminton court — upper right, counter-clockwise tilt */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 390 170"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g
            opacity="0.22"
            stroke="white"
            fill="none"
            strokeLinecap="round"
          >
            <g transform="translate(228, -18) rotate(-15, 65, 30) scale(1.45)">
              <rect
                x="0"
                y="0"
                width="130"
                height="60"
                strokeWidth="1.5"
              />
              <line
                x1="0"
                y1="9"
                x2="130"
                y2="9"
                strokeWidth="1.1"
              />
              <line
                x1="0"
                y1="51"
                x2="130"
                y2="51"
                strokeWidth="1.1"
              />
              <line
                x1="65"
                y1="0"
                x2="65"
                y2="60"
                strokeWidth="1.6"
              />
              <line
                x1="0"
                y1="30"
                x2="65"
                y2="30"
                strokeWidth="1.1"
              />
              <line
                x1="65"
                y1="30"
                x2="130"
                y2="30"
                strokeWidth="1.1"
              />
              <line
                x1="15"
                y1="9"
                x2="15"
                y2="51"
                strokeWidth="1.1"
              />
              <line
                x1="115"
                y1="9"
                x2="115"
                y2="51"
                strokeWidth="1.1"
              />
            </g>
          </g>
        </svg>

        <div className="relative px-6 py-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#6dac7f]">HopCourts</p>
          <h1 className="mb-4 text-4xl font-black leading-tight text-white">
            Community
            <br />
            Guidelines
          </h1>
          <p className="text-sm leading-relaxed text-[#a8c5b0]">
            HopCourts is a place to organise and join sports events with people across your city. To keep our community
            safe and enjoyable for everyone, please follow these guidelines.
          </p>
          <p className="mt-4 text-xs text-[#6d8f7a]">Last updated June 2026</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-5">
        {/* Section cards */}
        {SECTIONS.map((s, i) => (
          <div
            key={s.id}
            id={`section-${s.id}`}
            className={`scroll-mt-16 rounded-2xl p-5 shadow-sm ${COLORS[i].card}`}
          >
            <div className="mb-3 flex items-center gap-3">
              <SectionBadge index={i} />
              <h2 className="text-base font-bold text-slate-900">{s.title}</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">{s.body}</p>
          </div>
        ))}

        {/* Footer */}
        <div className="mt-10 p-5 text-center">
          <p className="text-sm text-[#2d6a4f]">
            Questions about these guidelines?{' '}
            <Link
              to="/settings/contact"
              className="inline-flex items-center gap-0.5 font-semibold text-[#2d6a4f] underline-offset-2 hover:underline"
            >
              Contact us
              <span className="text-xs">↗</span>
            </Link>
          </p>
          <p className="mt-1.5 text-xs text-slate-400">HopCourts · Community Guidelines</p>
        </div>
      </div>
    </div>
  )
}
