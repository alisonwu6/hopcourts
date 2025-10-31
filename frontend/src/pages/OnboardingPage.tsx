import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { Button, InputField } from '@/components'
import { SportCard } from '@/components/onboarding/SportCard'
import Header from '@/components/navigation/Header'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { SkillLevel, useOnboardingStore } from '@/store/onboardingStore'

const ROLE_STEP = 1
const BASIC_INFO_STEP = 2
const USERNAME_STEP = 3
const SPORTS_STEP = 4
const SKILL_LEVEL_STEP = 5
const AVATAR_STEP = 6

const MAX_SPORTS = 3

const SPORTS = [
  { id: 'running', label: 'Running', icon: '🏃' },
  { id: 'basketball', label: 'Basketball', icon: '🏀' },
  { id: 'football', label: 'Football', icon: '⚽' },
  { id: 'tennis', label: 'Tennis', icon: '🎾' },
  { id: 'volleyball', label: 'Volleyball', icon: '🏐' },
  { id: 'swimming', label: 'Swimming', icon: '🏊' },
  { id: 'cycling', label: 'Cycling', icon: '🚴' },
  { id: 'golf', label: 'Golf', icon: '🏌️' },
  { id: 'yoga', label: 'Yoga', icon: '🧘' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
]

const SKILL_OPTIONS: Array<{
  value: SkillLevel
  title: string
  description: string
}> = [
  {
    value: 'beginner',
    title: 'Beginner',
    description: 'New to the sport and learning fundamentals.',
  },
  {
    value: 'intermediate',
    title: 'Intermediate',
    description: 'Play regularly and stay consistent.',
  },
  {
    value: 'advanced',
    title: 'Advanced',
    description: 'Competitive mindset and high intensity.',
  },
]

type StepHeaderProps = {
  step: number
  total: number
  title: string
  description: string
  heading?: 'h1' | 'h2'
}

function StepHeader({
  step,
  total,
  title,
  description,
  heading = 'h2',
}: StepHeaderProps) {
  const HeadingTag = heading === 'h1' ? 'h1' : 'h2'
  const headingClasses =
    heading === 'h1'
      ? 'mt-3 text-3xl font-semibold text-player-900'
      : 'mt-3 text-2xl font-semibold text-player-900'

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="w-full">
        <div className="flex justify-between text-xs font-semibold uppercase tracking-wide text-player-600">
          <div>STEP {step}</div>
          <div>
            STEP {step} OF {total}
          </div>
        </div>
        <HeadingTag className={headingClasses}>{title}</HeadingTag>
        <p className="mt-2 text-sm text-player-900/70">{description}</p>
      </div>
    </div>
  )
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Unable to read file'))
    reader.readAsDataURL(file)
  })

export function OnboardingPage() {
  const navigate = useNavigate()
  const { setAuthData } = useAuthStore()
  const {
    data,
    status,
    currentStep,
    requiredSteps,
    setRole,
    setBasicInfo,
    setUsername,
    addSport,
    removeSport,
    setSkillLevel,
    setAvatar,
    setMotivations,
    nextStep,
    prevStep,
    markStepCompleted,
    setStatus,
    isLoading,
    setLoading,
    error,
    setError,
  } = useOnboardingStore()

  const [basicInfo, setBasicInfoState] = useState({
    fullName: data.fullName,
    age: data.age ? String(data.age) : '',
    location: data.location,
  })
  const [username, setUsernameState] = useState(data.username)
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >(data.usernameAvailable ? 'available' : 'idle')
  const [motivationSelection, setMotivationSelection] = useState<string[]>(
    data.motivations
  )
  const [submitting, setSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'player' | 'host' | null>(
    data.role
  )

  const currentIndex = useMemo(
    () => Math.max(0, requiredSteps.indexOf(currentStep)),
    [requiredSteps, currentStep]
  )

  const totalSteps = requiredSteps.length
  const canGoBack = currentIndex > 0

  if (!status) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-player-200 border-t-player-600" />
        <p className="mt-4 text-sm text-player-900/70">Loading onboarding...</p>
      </div>
    )
  }

  const confirmRoleSelection = () => {
    if (!selectedRole) {
      setError('Select a role to continue.')
      return
    }
    setError(null)
    setRole(selectedRole)
    markStepCompleted(ROLE_STEP)
    nextStep()
  }

  const handleBasicInfoSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!basicInfo.fullName || !basicInfo.age || !basicInfo.location) {
      setError('Please complete all fields.')
      return
    }
    const parsedAge = Number(basicInfo.age)
    if (Number.isNaN(parsedAge) || parsedAge <= 0) {
      setError('Enter a valid age.')
      return
    }
    setError(null)
    setBasicInfo(
      basicInfo.fullName.trim(),
      parsedAge,
      basicInfo.location.trim()
    )
    markStepCompleted(BASIC_INFO_STEP)
    nextStep()
  }

  const handleUsernameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!username.trim()) {
      setError('Username is required.')
      return
    }

    setUsernameStatus('checking')
    try {
      const result = await authService.checkUsername(username.trim())
      setUsername(username.trim(), result.available)
      if (result.available) {
        setError(null)
        setUsernameStatus('available')
        markStepCompleted(USERNAME_STEP)
        nextStep()
      } else {
        setUsernameStatus('taken')
        setError('That username is already taken.')
      }
    } catch (err: any) {
      setError(err?.message ?? 'Unable to check username.')
      setUsernameStatus('idle')
    }
  }

  const toggleSport = (sportId: string, label: string) => {
    const alreadySelected = data.sports.includes(label)
    if (alreadySelected) {
      removeSport(label)
      return
    }
    if (data.sports.length >= MAX_SPORTS) {
      setError(`You can choose up to ${MAX_SPORTS} sports.`)
      return
    }
    addSport(label)
    setError(null)
  }

  const handleSkillNext = () => {
    const hasAllLevels =
      data.sports.length > 0 &&
      data.sports.every((sport) => data.skillLevels[sport])
    if (!hasAllLevels) {
      setError('Pick a skill level for each sport.')
      return
    }
    setError(null)
    markStepCompleted(SKILL_LEVEL_STEP)
    nextStep()
  }

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const preview = await readFileAsDataUrl(file)
      setAvatar(file, preview)
    } catch (err: any) {
      setError(err?.message ?? 'Unable to load image.')
    }
  }

  const handleComplete = async () => {
    setSubmitting(true)
    setLoading(true)
    setError(null)
    try {
      const response = await authService.completeOnboarding({
        hasRole: true,
        hasBasicInfo: true,
        hasUsername: true,
        hasSports: data.role === 'player' ? data.sports.length > 0 : false,
        hasSkillLevels:
          data.role === 'player'
            ? data.sports.every((sport) => data.skillLevels[sport])
            : false,
        hasAvatar: Boolean(data.avatar || data.avatarPreview),
      })
      setStatus(response.onboardingStatus)
      setAuthData(response.user, response.token, response.onboardingStatus)
      navigate('/home', { replace: true })
    } catch (err: any) {
      setError(err?.message ?? 'Failed to complete onboarding.')
    } finally {
      setSubmitting(false)
      setLoading(false)
    }
  }

  const handleMotivationToggle = (value: string) => {
    setMotivationSelection((prev) => {
      const exists = prev.includes(value)
      const next = exists
        ? prev.filter((item) => item !== value)
        : [...prev, value]
      setMotivations(next)
      return next
    })
  }

  const renderRoleStep = () => (
    <div className="space-y-8 text-center sm:text-left">
      <StepHeader
        step={currentIndex + 1}
        total={totalSteps}
        title="Who are you?"
        description="Pick the role that matches how you use SportsMatch."
        heading="h1"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setSelectedRole('player')
            setError(null)
          }}
          className={clsx(
            'rounded-2xl border-2 p-6 text-left shadow-sm transition hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-player-300',
            selectedRole === 'player'
              ? 'border-player-600 bg-player-50'
              : 'border-player-100 bg-white hover:border-player-200'
          )}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🏃</span>
            <div>
              <h2 className="text-lg font-semibold text-player-900">Player</h2>
              <p className="text-sm text-player-900/70">
                Find teammates & pick-up games.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-player-900/70">
            Join sessions, meet new athletes, and stay motivated with curated
            matches.
          </p>
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedRole('host')
            setError(null)
          }}
          className={clsx(
            'rounded-2xl border-2 p-6 text-left shadow-sm transition hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-player-300',
            selectedRole === 'host'
              ? 'border-player-600 bg-player-50'
              : 'border-player-100 bg-white hover:border-player-200'
          )}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🏟️</span>
            <div>
              <h2 className="text-lg font-semibold text-player-900">
                Club Manager
              </h2>
              <p className="text-sm text-player-900/70">
                Recruit players & manage events.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-player-900/70">
            Fill rosters fast, grow your community, and keep every event
            organized.
          </p>
        </button>
      </div>
      <div className="pt-6 text-right">
        <Button
          type="button"
          storyLine="player"
          className="inline-flex items-center justify-center px-8"
          onClick={confirmRoleSelection}
          disabled={!selectedRole}
        >
          Next
        </Button>
      </div>
    </div>
  )

  const renderBasicInfoStep = () => (
    <form
      className="space-y-6"
      onSubmit={handleBasicInfoSubmit}
    >
      <StepHeader
        step={currentIndex + 1}
        total={totalSteps}
        title="Introduce yourself"
        description="30 seconds so future teammates know who’s joining."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Full name"
          placeholder="Alex Carter"
          value={basicInfo.fullName}
          onChange={(event) =>
            setBasicInfoState((prev) => ({
              ...prev,
              fullName: event.target.value,
            }))
          }
        />
        <InputField
          label="Age"
          type="number"
          placeholder="24"
          value={basicInfo.age}
          onChange={(event) =>
            setBasicInfoState((prev) => ({ ...prev, age: event.target.value }))
          }
        />
      </div>
      <InputField
        label="City / Postal code"
        placeholder="Taipei City / 106"
        value={basicInfo.location}
        onChange={(event) =>
          setBasicInfoState((prev) => ({
            ...prev,
            location: event.target.value,
          }))
        }
      />
      <div className="pt-6 text-right">
        <Button
          type="submit"
          storyLine="player"
          className="inline-flex items-center justify-center px-8"
        >
          Next
        </Button>
      </div>
    </form>
  )

  const renderUsernameStep = () => (
    <form
      className="space-y-6"
      onSubmit={handleUsernameSubmit}
    >
      <StepHeader
        step={currentIndex + 1}
        total={totalSteps}
        title="Claim your username"
        description="This is how players can find and tag you across SportsMatch."
      />
      <InputField
        label="Username"
        placeholder="alexruns"
        value={username}
        onChange={(event) => {
          setUsernameState(event.target.value)
          setUsernameStatus('idle')
          setError(null)
        }}
      />
      <div className="flex items-center gap-2 text-sm">
        {usernameStatus === 'available' && (
          <span className="text-green-600">
            Nice! That username is available.
          </span>
        )}
        {usernameStatus === 'taken' && (
          <span className="text-red-500">Try another username.</span>
        )}
        {usernameStatus === 'checking' && (
          <span className="text-player-600">Checking availability…</span>
        )}
      </div>
      <div className="pt-6 text-right">
        <Button
          type="submit"
          storyLine="player"
          className="inline-flex items-center justify-center px-8"
          disabled={usernameStatus === 'checking'}
        >
          Next
        </Button>
      </div>
    </form>
  )

  const renderSportsStep = () => (
    <div className="space-y-6">
      <StepHeader
        step={currentIndex + 1}
        total={totalSteps}
        title="Which sports fire you up?"
        description={`Pick up to ${MAX_SPORTS}. We’ll use this to match you with sessions and teammates.`}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SPORTS.map((sport) => (
          <SportCard
            key={sport.id}
            name={sport.label}
            icon={sport.icon}
            selected={data.sports.includes(sport.label)}
            onToggle={() => toggleSport(sport.id, sport.label)}
          />
        ))}
      </div>
      <div className="pt-6 text-right">
        <Button
          type="button"
          storyLine="player"
          className="inline-flex items-center justify-center px-8"
          onClick={() => {
            if (data.sports.length === 0) {
              setError('Select at least one sport.')
              return
            }
            setError(null)
            markStepCompleted(SPORTS_STEP)
            nextStep()
          }}
        >
          Next
        </Button>
      </div>
    </div>
  )

  const renderSkillStep = () => (
    <div className="space-y-6">
      <StepHeader
        step={currentIndex + 1}
        total={totalSteps}
        title="How do you rate your game?"
        description="Choose the level that best describes your vibe for each sport."
      />
      <div className="space-y-4">
        {data.sports.map((sport) => {
          const selectedLevel = data.skillLevels[sport]
          return (
            <div
              key={sport}
              className="rounded-2xl border border-player-100 bg-white/80 p-4"
            >
              <h3 className="text-lg font-semibold text-player-900">{sport}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {SKILL_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSkillLevel(sport, option.value)}
                    className={clsx(
                      'rounded-xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-player-300',
                      selectedLevel === option.value
                        ? 'border-player-600 bg-player-50 shadow-sm'
                        : 'border-player-200 bg-white hover:border-player-300'
                    )}
                  >
                    <div className="font-semibold text-player-900">
                      {option.title}
                    </div>
                    <p className="mt-1 text-xs text-player-900/70">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="pt-6 text-right">
        <Button
          type="button"
          storyLine="player"
          className="inline-flex items-center justify-center px-8"
          onClick={handleSkillNext}
        >
          Next
        </Button>
      </div>
    </div>
  )

  const renderAvatarStep = () => (
    <div className="space-y-6">
      <StepHeader
        step={currentIndex + 1}
        total={totalSteps}
        title="You’re almost there!"
        description="Add a profile photo (optional) and pick what drives your next session."
      />
      <div className="flex flex-col items-center gap-4">
        {data.avatarPreview ? (
          <>
            <img
              src={data.avatarPreview}
              alt="Avatar preview"
              className="h-32 w-32 rounded-full object-cover shadow-lg"
            />
            <div className="flex gap-3">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-player-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-player-700">
                Replace photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
              <button
                type="button"
                className="rounded-lg border border-player-200 px-4 py-2 text-sm font-semibold text-player-600 transition hover:border-player-300"
                onClick={() => setAvatar(null, null)}
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-player-200 bg-white/70 p-8 text-center text-sm text-player-900/70 transition hover:border-player-300">
            <span className="text-4xl">📸</span>
            <span className="mt-3 font-semibold text-player-900">
              Upload photo
            </span>
            <span className="mt-1 text-xs text-player-900/60">
              Supports JPG or PNG under 5MB.
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        )}
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold text-player-900">
          What motivates you right now?
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            'Build stamina',
            'Meet new players',
            'Stay consistent',
            'Have fun',
          ].map((item) => {
            const active = motivationSelection.includes(item)
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleMotivationToggle(item)}
                className={clsx(
                  'rounded-full border px-4 py-2 text-sm font-semibold transition',
                  active
                    ? 'border-player-600 bg-player-50 text-player-700'
                    : 'border-player-200 bg-white text-player-700 hover:border-player-300'
                )}
              >
                {item}
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-6 sm:flex-row sm:justify-between">
        <Button
          type="button"
          storyLine="player"
          variant="secondary"
          className="inline-flex items-center justify-center px-8"
          onClick={handleComplete}
          disabled={submitting || isLoading}
        >
          Skip photo
        </Button>
        <Button
          type="button"
          storyLine="player"
          className="inline-flex items-center justify-center px-8"
          onClick={handleComplete}
          disabled={submitting || isLoading}
        >
          {submitting ? 'Saving…' : 'Next'}
        </Button>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case ROLE_STEP:
        return renderRoleStep()
      case BASIC_INFO_STEP:
        return renderBasicInfoStep()
      case USERNAME_STEP:
        return renderUsernameStep()
      case SPORTS_STEP:
        return data.role === 'player' ? renderSportsStep() : renderAvatarStep()
      case SKILL_LEVEL_STEP:
        return data.role === 'player' ? renderSkillStep() : renderAvatarStep()
      case AVATAR_STEP:
      default:
        return renderAvatarStep()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-player-50 via-white to-player-200">
      <Header showActions={false} />
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-12 pt-6">
        {canGoBack && (
          <button
            type="button"
            onClick={prevStep}
            className="text-sm font-semibold text-player-600 transition hover:text-player-700"
          >
            ← Back
          </button>
        )}
        <div className="h-2 w-full rounded-full bg-player-200/40">
          <div
            className="h-2 rounded-full bg-player-600 transition-all"
            style={{ width: `${((currentIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <main className="rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur">
          {renderStepContent()}
        </main>
      </div>
    </div>
  )
}

export default OnboardingPage
