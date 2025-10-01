import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import { Pencil } from 'lucide-react'

const sportPalette: Record<string, { ring: string; chipBg: string; chipText: string }> = {
  basketball: {
    ring: 'from-[#F47920] to-[#F59E0B]',
    chipBg: 'bg-[#FEE8D9]',
    chipText: 'text-[#F47920]',
  },
  badminton: {
    ring: 'from-[#10B981] to-[#34D399]',
    chipBg: 'bg-[#E6F9F1]',
    chipText: 'text-[#0F9F77]',
  },
  running: {
    ring: 'from-[#0F9F77] to-[#4CA65A]',
    chipBg: 'bg-[#E6F9F1]',
    chipText: 'text-[#0F9F77]',
  },
  strength: {
    ring: 'from-[#7C3AED] to-[#9333EA]',
    chipBg: 'bg-[#EFE7FF]',
    chipText: 'text-[#7C3AED]',
  },
  '路跑': {
    ring: 'from-[#0F9F77] to-[#4CA65A]',
    chipBg: 'bg-[#E6F9F1]',
    chipText: 'text-[#0F9F77]',
  },
  籃球: {
    ring: 'from-[#F47920] to-[#F59E0B]',
    chipBg: 'bg-[#FEE8D9]',
    chipText: 'text-[#F47920]',
  },
  肌力: {
    ring: 'from-[#7C3AED] to-[#9333EA]',
    chipBg: 'bg-[#EFE7FF]',
    chipText: 'text-[#7C3AED]',
  },
}

type Props = {
  isOwner?: boolean
  inviteLabel: string
  messageLabel: string
  editHref?: string
  copy: {
    location: string
    levelLabel: string
    levelValue: string
    sports: string[]
    strengths: string[]
    badges: string[]
    recentSessions: Array<{ title: string; sport: string; date: string }>
    upcomingSessions: Array<{ title: string; sport: string; date: string }>
  squad: Array<{ name: string; sport: string; lastPlayed: string; avatarUrl: string }>
    trustNote: string
    editFabLabel: string
  }
  displayName: string
}

export default function AthleteCardView({
  isOwner = false,
  copy,
  displayName,
  inviteLabel,
  messageLabel,
  editHref = '#',
}: Props) {
  const primarySport = copy.sports[0]?.toLowerCase() ?? 'basketball'
  const palette = sportPalette[primarySport] || sportPalette.basketball

  return (
    <section className="space-y-6">
      <Card className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        {isOwner && (
          <Link
            to={editHref}
            className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-white"
            aria-label={copy.editFabLabel}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            <span>{copy.editFabLabel}</span>
          </Link>
        )}
        <div className="absolute inset-0 h-32 bg-gradient-to-br from-[var(--color-secondary)]/15 via-transparent to-transparent" />
        <div className="absolute -left-6 top-8 h-20 w-20 rounded-full bg-[var(--color-primary)]/20" />
        <CardContent className="relative space-y-6 p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className={clsx('rounded-full p-[3px] shadow-lg', `bg-gradient-to-br ${palette.ring}`)}>
                <Avatar className="h-24 w-24 border-4 border-white">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=320&q=80"
                    alt={displayName}
                    className="rounded-full object-cover"
                  />
                  <AvatarFallback />
                </Avatar>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{displayName}</h2>
              <p className="text-sm text-slate-500">{copy.location}</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <Badge
              variant="outline"
              className="rounded-full border-transparent bg-[#102A43]/10 px-3 py-1 text-[#102A43]"
            >
              {copy.levelLabel}: {copy.levelValue}
            </Badge>
            {copy.sports.map((sport) => {
              const key = sportPalette[sport.toLowerCase()] || palette
              return (
                <Badge
                  key={sport}
                  variant="outline"
                  className={clsx('rounded-full border-transparent px-3 py-1 text-xs', key?.chipBg, key?.chipText)}
                >
                  {sport}
                </Badge>
              )
            })}
          </div>
          <div className="text-sm text-slate-600">
            <p>{copy.strengths.join(' · ')}</p>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            {copy.badges.map((badge) => (
              <div
                key={badge}
                className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-amber-100/80 px-4 py-2 text-sm font-medium text-amber-700 shadow-sm"
              >
                🏅 {badge}
              </div>
            ))}
          </div>
          <div className="space-y-3 text-left">
            <h3 className="text-sm font-semibold text-slate-700">Recent sessions</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {copy.recentSessions.map((session) => (
                <div
                  key={`${session.title}-${session.date}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs text-slate-600"
                >
                  <div className="text-sm font-semibold text-slate-800">{session.title}</div>
                  <div>{session.sport}</div>
                  <div className="text-[11px] text-slate-500">{session.date}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3 text-left">
            <h3 className="text-sm font-semibold text-slate-700">Upcoming play</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {copy.upcomingSessions.map((session) => (
                <div
                  key={`${session.title}-${session.date}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{session.title}</div>
                    <div className="text-xs text-slate-500">{session.date}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-transparent bg-[var(--color-secondary)]/10 text-xs text-[var(--color-secondary)]"
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <Button size="sm" variant="secondary" className="rounded-full">
              {inviteLabel}
            </Button>
            <Button size="sm" variant="outline" className="rounded-full">
              {messageLabel}
            </Button>
          </div>
          <footer className="mt-4 flex justify-between text-xs text-slate-400">
            <span>{copy.recentSessions.length} recent sessions</span>
            <span>{copy.badges.length} badges collected</span>
          </footer>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm">
        <CardContent className="space-y-4 p-6">
          <h3 className="text-sm font-semibold text-slate-700">Your squad</h3>
          <div className="flex flex-col gap-3">
            {copy.squad.map((member) => (
              <div
                key={member.name}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={member.avatarUrl}
                      alt={member.name}
                      className="rounded-full object-cover"
                    />
                    <AvatarFallback />
                  </Avatar>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{member.name}</div>
                    <div className="text-xs text-slate-500">{member.sport} · {member.lastPlayed}</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-xs text-[var(--color-secondary)]"
                >
                  View card
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-slate-400">{copy.trustNote}</p>

    </section>
  )
}
