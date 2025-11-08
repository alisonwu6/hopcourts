import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AthleteCard } from '@/components/athlete/AthleteCard'
import { mockAthlete } from '@/mocks/athlete'
import { mockAthletes } from '@/data/mock/athletes'
import { useAuthStore, useOnboardingStore } from '@/hooks'
import type { OnboardingRole } from '@/store/onboardingStore'
import type { AthleteCardProps } from '@/interfaces/athlete'

function buildSelfAthlete(user: ReturnType<typeof useAuthStore>['user'], role: OnboardingRole, preferredSports: string[]): AthleteCardProps {
  if (!user) {
    return { ...mockAthlete, id: 'me', statusLabel: 'new' }
  }

  const combinedSports = preferredSports.length ? preferredSports : user.sports ?? []
  const uniqueSports = Array.from(new Set(combinedSports))
  const primarySport = uniqueSports[0] ?? user.sports?.[0] ?? mockAthlete.primarySport ?? 'Sport TBD'
  const uniqueTags = Array.from(
    new Set(
      [primarySport, ...uniqueSports, ...(user.sports ?? []), ...(mockAthlete.tags ?? [])].filter(
        (tag): tag is string => Boolean(tag)
      )
    )
  )
  const isVenueManager = role === 'venue_manager'
  const roleTone = isVenueManager
    ? 'Hosting games and rallying the crew.'
    : 'Chasing good games and new teammates.'

  return {
    ...mockAthlete,
    id: user.id,
    name: user.name,
    city: user.location,
    sport: primarySport,
    primarySport,
    title: isVenueManager ? 'Community host · building the game vibe.' : 'Player · ready to jump in.',
    toneLines: [roleTone, ...(mockAthlete.toneLines?.slice(0, 3) ?? [])],
    visualTagline: uniqueSports.length ? uniqueSports.join(' · ') : mockAthlete.visualTagline,
    stats: {
      ...mockAthlete.stats,
      games: user.gamesAttended ?? mockAthlete.stats.games,
      badges: mockAthlete.stats.badges ?? 0,
      energy: mockAthlete.stats.energy ?? 72,
    },
    tags: uniqueTags,
    vibes:
      isVenueManager
        ? Array.from(new Set(['Crew Builder', ...(mockAthlete.vibes ?? [])]))
        : Array.from(new Set(['Game Ready', ...(mockAthlete.vibes ?? [])])),
    bio: user.bio ?? mockAthlete.bio,
    statusLabel: (user.gamesAttended ?? 0) > 3 ? 'active' : 'new',
    recentActivities: mockAthlete.recentActivities,
  }
}

export default function AthleteCardPage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data } = useOnboardingStore()
  const role = (data.role as OnboardingRole | null) ?? 'player'
  const preferredSports = data.sports ?? []
  const isOwnProfile = !username || username === 'me'
  const athlete = useMemo(() => {
    if (isOwnProfile) {
      return buildSelfAthlete(user, role, preferredSports)
    }
    if (!username) return mockAthlete

    const normalized = username.toLowerCase()
    return (
      mockAthletes.find((candidate) => candidate.id.toLowerCase() === normalized)
      ?? mockAthlete
    )
  }, [isOwnProfile, preferredSports, role, user, username])

  return (
    <div className="min-h-screen bg-[#F3F7FB] overflow-x-hidden">
      <AthleteCard
        {...athlete}
        fullBleed
        isOwner={isOwnProfile}
        onEdit={isOwnProfile ? () => navigate('/u/me/edit') : undefined}
        onHighFive={(id) => console.info('High five triggered', id)}
        onMessage={(id) => console.info('Message athlete', id)}
        onInvite={(id) => console.info('Invite athlete', id)}
        onShare={(id) => console.info('Share athlete', id)}
      />
    </div>
  )
}
