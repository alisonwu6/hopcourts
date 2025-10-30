import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components'
import { useOnboardingStore } from '@/hooks'
import { SportCard } from '@/components/onboarding/SportCard'

const SPORTS = [
  { id: 'running', name: 'Running', icon: '🏃' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'climbing', name: 'Climbing', icon: '🧗' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'volleyball', name: 'Volleyball', icon: '⛹️' },
  { id: 'swimming', name: 'Swimming', icon: '🏊' },
  { id: 'cycling', name: 'Cycling', icon: '🚴' },
  { id: 'golf', name: 'Golf', icon: '🏌️' },
  { id: 'yoga', name: 'Yoga', icon: '🤸' },
  { id: 'fitness', name: 'Fitness', icon: '💪' },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { preferredSports, setPreferredSports, completeOnboarding } = useOnboardingStore()

  const selectedSet = useMemo(() => new Set(preferredSports), [preferredSports])

  const toggleSport = (sportId: string) => {
    if (selectedSet.has(sportId)) {
      setPreferredSports(preferredSports.filter((id) => id !== sportId))
      return
    }
    if (preferredSports.length >= 3) {
      return
    }
    setPreferredSports([...preferredSports, sportId])
  }

  const handleContinue = () => {
    completeOnboarding({ preferredSports })
    navigate('/home', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-player-50">
      <div className="sticky top-0 z-10 bg-player-50 px-4 py-4">
        <h1 className="text-lg font-bold text-player-900">Setup</h1>
      </div>

      <div className="flex-1 px-4 pb-24">
        <div className="mb-8">
          <div className="h-2 w-full rounded-full bg-player-200/60">
            <div className="h-2 rounded-full bg-player-600" style={{ width: '100%' }} />
          </div>
          <p className="mt-2 text-xs text-gray-600">Step 1 of 1</p>
        </div>

        <h2 className="text-2xl font-bold text-player-900">What sports interest you?</h2>
        <p className="mt-2 text-sm text-gray-600">Select up to 3 sports you&apos;d like to play</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {SPORTS.map((sport) => (
            <SportCard
              key={sport.id}
              name={sport.name}
              icon={sport.icon}
              selected={selectedSet.has(sport.id)}
              onSelect={() => toggleSport(sport.id)}
            />
          ))}
        </div>

        <p className="mt-6 text-sm font-semibold text-player-600">Selected: {preferredSports.length} / 3</p>

        <Button
          storyLine="player"
          onClick={handleContinue}
          disabled={preferredSports.length === 0}
          className="mt-6 w-full"
        >
          Continue
        </Button>

        <p className="mt-4 text-center text-sm text-gray-600">You can change this later in settings</p>
      </div>
    </div>
  )
}
