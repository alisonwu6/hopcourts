import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { AthleteCard } from '@/components/athlete/AthleteCard'
import { mockAthlete } from '@/mocks/athlete'
import { mockAthletes } from '@/data/mock/athletes'

export default function AthleteCardPage() {
  const { username } = useParams<{ username: string }>()
  const athlete = useMemo(() => {
    if (!username) return mockAthlete

    const normalized = username.toLowerCase()
    return (
      mockAthletes.find((candidate) => candidate.id.toLowerCase() === normalized)
      ?? mockAthlete
    )
  }, [username])

  return (
    <div className="min-h-screen bg-[#F3F7FB] overflow-x-hidden">
      <AthleteCard
        {...athlete}
        fullBleed
        onHighFive={(id) => console.info('High five triggered', id)}
        onMessage={(id) => console.info('Message athlete', id)}
        onInvite={(id) => console.info('Invite athlete', id)}
        onShare={(id) => console.info('Share athlete', id)}
      />
    </div>
  )
}
