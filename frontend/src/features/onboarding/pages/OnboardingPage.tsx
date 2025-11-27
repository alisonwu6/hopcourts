import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { Button, InputField } from '@/components'
import { SportCard } from '@/components/onboarding/SportCard'
import Header from '@/components/navigation/Header'
import { sessionService } from '@/services/sessionService'
import { useAuthStore } from '@/hooks'
import {
  useOnboardingStore,
  ROLE_STEP,
  PLAYER_INTRO_STEP,
  PLAYER_USERNAME_STEP,
  PLAYER_SPORTS_STEP,
  PLAYER_SKILL_STEP,
  PLAYER_STYLE_STEP,
  PLAYER_FREQUENCY_STEP,
  PLAYER_AVATAR_STEP,
  PLAYER_MOTIVATION_STEP,
  VENUE_DETAILS_STEP,
  VENUE_SPORTS_STEP,
  VENUE_COURTS_STEP,
  VENUE_PHOTO_STEP,
  VENUE_VERIFY_STEP,
  type PlayingStyle,
  type PlayFrequency,
} from '@/store/onboardingStore'

const MAX_SPORTS = 5

const SPORTS = [
  { id: 'basketball', label: 'Basketball', icon: '🏀' },
  { id: 'tennis', label: 'Tennis', icon: '🎾' },
  { id: 'badminton', label: 'Badminton', icon: '🏸' },
  { id: 'pickleball', label: 'Pickleball', icon: '🏓' },
  { id: 'volleyball', label: 'Volleyball', icon: '🏐' },
  { id: 'climbing', label: 'Climbing', icon: '🧗' },
  { id: 'running', label: 'Running', icon: '🏃' },
  { id: 'hiking', label: 'Hiking', icon: '🥾' },
]

const SKILL_OPTIONS = [
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
] as const

const PLAYING_STYLE_OPTIONS: Array<{
  id: PlayingStyle
  title: string
  description: string
  icon: string
}> = [
  {
    id: 'social',
    title: 'Social Player',
    description: 'Here for fun, friends, and casual vibes.',
    icon: '😄',
  },
  {
    id: 'competitive',
    title: 'Competitive Player',
    description: 'Love winning, intense play, pushing limits.',
    icon: '🏆',
  },
  {
    id: 'learning',
    title: 'Learning Focused',
    description: 'Want to improve skills and love coaching.',
    icon: '📚',
  },
  {
    id: 'mixed',
    title: 'Mixed',
    description: 'Depends on the day and who shows up!',
    icon: '🎲',
  },
]

const AREA_OPTIONS = [
  { id: 'holland_park', label: 'Holland Park', postalCode: '4121' },
  { id: 'south_bank', label: 'South Bank', postalCode: '4101' },
  { id: 'valley', label: 'Valley', postalCode: '4005' },
  { id: 'fortitude_valley', label: 'Fortitude Valley', postalCode: '4006' },
  { id: 'brisbane_cbd', label: 'Brisbane CBD', postalCode: '4000' },
  { id: 'southside', label: 'Southside', postalCode: '4102' },
]

const FREQUENCY_OPTIONS: Array<{
  id: PlayFrequency
  title: string
  description: string
}> = [
  { id: 'new', title: 'New to the sport', description: 'First time joining!' },
  { id: 'casual', title: 'Casual', description: 'Just a few times each season.' },
  { id: 'regular', title: 'Regular', description: '1-2 times per month.' },
  { id: 'frequent', title: 'Frequent', description: '2-3+ times every week.' },
]

const GENDER_OPTIONS = [
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
]

const MOTIVATION_TAGS = ['Build stamina', 'Meet new players', 'Stay consistent', 'Have fun']

const VENUE_SPORT_OPTIONS = ['Pickleball', 'Tennis', 'Badminton', 'Basketball', 'Other']

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Unable to read file'))
    reader.readAsDataURL(file)
  })

type StepHeaderProps = {
  step: number
  total: number
  title: string
  description: string
  heading?: 'h1' | 'h2'
}

function StepHeader({ step, total, title, description, heading = 'h2' }: StepHeaderProps) {
  const HeadingTag = heading === 'h1' ? 'h1' : 'h2'
  const headingClasses = heading === 'h1' ? 'mt-3 text-3xl font-semibold text-player-900' : 'mt-3 text-2xl font-semibold text-player-900'

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

const SelectionBadge = ({ active }: { active: boolean }) => (
  <span
    aria-hidden="true"
    className={clsx(
      'pointer-events-none absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-semibold transition',
      active ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.45)]' : 'border-emerald-400 bg-white text-transparent'
    )}
  >
    ✓
  </span>
)

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
    setPlayingStyle,
    setPlayFrequency,
    setAvatar,
    setMotivations,
    setAthleteMotivation,
    setVenueDetails,
    setVenueSports,
    setVenueCourts,
    setVenuePhoto,
    setVenueConsent,
    nextStep,
    prevStep,
    markStepCompleted,
    setStatus,
    isLoading,
    setLoading,
    error,
    setError,
  } = useOnboardingStore()

  const [selectedRole, setSelectedRole] = useState<'player' | 'venue_manager' | null>(data.role)
  const [basicInfo, setBasicInfoState] = useState({
    fullName: data.fullName,
    city: data.city || 'Brisbane',
    postalCode: data.postalCode ?? '',
    postalArea: data.postalArea ?? '',
    gender: data.gender ?? 'prefer_not_to_say',
  })
  const [username, setUsernameState] = useState(data.username)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [motivationSelection, setMotivationSelection] = useState<string[]>(data.motivations ?? [])
  const [motivationText, setMotivationText] = useState(data.athleteMotivation ?? '')
  const [venueDetailsState, setVenueDetailsState] = useState({
    venueName: data.venueName,
    venueAddress: data.venueAddress,
    venuePhone: data.venuePhone,
    venueEmail: data.venueEmail,
    venueDescription: data.venueDescription,
  })
  const [totalCourtsInput, setTotalCourtsInput] = useState(data.totalCourts ? String(data.totalCourts) : '')
  const [courtNamesInput, setCourtNamesInput] = useState(data.courtNames.join(', '))
  const [submitting, setSubmitting] = useState(false)

  const currentIndex = Math.max(requiredSteps.indexOf(currentStep), 0)
  const totalSteps = requiredSteps.length || 1
  const canGoBack = currentIndex > 0

  const selectedSports = data.sports
  const isVenueFlow = data.role === 'venue_manager'

  const hasSkillSelections = useMemo(
    () => selectedSports.length > 0 && selectedSports.every((sport) => data.skillLevels[sport]),
    [data.skillLevels, selectedSports]
  )

  useEffect(() => {
    if (!error) return
    const timeoutId = window.setTimeout(() => setError(null), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [error, setError])

  if (!status || isLoading) {
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
    if (!basicInfo.fullName.trim()) {
      setError('Please share your full name.')
      return
    }
    if (!basicInfo.city.trim()) {
      setError('City is required.')
      return
    }
    if (!basicInfo.postalArea) {
      setError('Select your neighborhood.')
      return
    }
    setError(null)
    setBasicInfo({
      fullName: basicInfo.fullName.trim(),
      city: basicInfo.city.trim(),
      postalCode: basicInfo.postalCode.trim(),
      postalArea: basicInfo.postalArea,
      gender: basicInfo.gender,
    })
    markStepCompleted(PLAYER_INTRO_STEP)
    nextStep()
  }

  const handlePostalAreaChange = (areaId: string) => {
    setBasicInfoState((prev) => {
      const selectedArea = AREA_OPTIONS.find((option) => option.id === areaId)
      return {
        ...prev,
        postalArea: areaId,
        postalCode: selectedArea?.postalCode ?? prev.postalCode,
      }
    })
  }

  const handleUsernameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) {
      setError('Username is required.')
      return
    }
    if (trimmed.length < 3 || !/^\w+$/.test(trimmed)) {
      setError('Use at least 3 characters, letters, numbers, or underscore.')
      return
    }

    setUsernameStatus('checking')
    try {
      const result = await sessionService.checkUsername(trimmed)
      setUsername(trimmed, result.available)
      if (result.available) {
        setError(null)
        setUsernameStatus('available')
        markStepCompleted(PLAYER_USERNAME_STEP)
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

  const toggleSport = (sportLabel: string) => {
    const alreadySelected = selectedSports.includes(sportLabel)
    if (alreadySelected) {
      removeSport(sportLabel)
      return
    }
    if (selectedSports.length >= MAX_SPORTS) {
      setError(`You can choose up to ${MAX_SPORTS} sports.`)
      return
    }
    setError(null)
    addSport(sportLabel)
  }

  const handleSkillNext = () => {
    if (!hasSkillSelections) {
      setError('Pick a skill level for each sport.')
      return
    }
    setError(null)
    markStepCompleted(PLAYER_SKILL_STEP)
    nextStep()
  }

  const handlePlayingStyleNext = () => {
    if (!data.playingStyle) {
      setError('Select the playing vibe that feels right.')
      return
    }
    setError(null)
    markStepCompleted(PLAYER_STYLE_STEP)
    nextStep()
  }

  const handleFrequencySubmit = () => {
    if (!data.playFrequency) {
      setError('Choose how often you play.')
      return
    }
    setError(null)
    markStepCompleted(PLAYER_FREQUENCY_STEP)
    nextStep()
  }

  const handlePlayFrequencySelect = (value: PlayFrequency) => {
    setError(null)
    setPlayFrequency(value)
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

  const handleProfilePhotoNext = () => {
    setError(null)
    markStepCompleted(PLAYER_AVATAR_STEP)
    nextStep()
  }

  const handleVenuePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const preview = await readFileAsDataUrl(file)
      setVenuePhoto(file, preview)
    } catch (err: any) {
      setError(err?.message ?? 'Unable to load image.')
    }
  }

  const handleVenueDetailsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const { venueName, venueAddress, venuePhone, venueEmail } = venueDetailsState
    if (!venueName.trim() || !venueAddress.trim() || !venuePhone.trim() || !venueEmail.trim()) {
      setError('Please provide venue name, address, phone, and email.')
      return
    }
    setError(null)
    setVenueDetails({
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim(),
      venuePhone: venuePhone.trim(),
      venueEmail: venueEmail.trim(),
      venueDescription: venueDetailsState.venueDescription.trim(),
    })
    markStepCompleted(VENUE_DETAILS_STEP)
    nextStep()
  }

  const handleVenueSportsToggle = (label: string) => {
    const alreadySelected = data.venueSports.includes(label)
    const nextSports = alreadySelected
      ? data.venueSports.filter((item) => item !== label)
      : [...data.venueSports, label]
    setVenueSports(nextSports)
    setError(null)
  }

  const handleVenueSportsSubmit = () => {
    if (data.venueSports.length === 0) {
      setError('Select at least one sport you offer.')
      return
    }
    setError(null)
    markStepCompleted(VENUE_SPORTS_STEP)
    nextStep()
  }

  const handleVenueCourtsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsedCourts = Number(totalCourtsInput)
    if (Number.isNaN(parsedCourts) || parsedCourts <= 0) {
      setError('Enter the number of courts you manage.')
      return
    }
    const parsedNames = courtNamesInput
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
    setError(null)
    setVenueCourts({ totalCourts: parsedCourts, courtNames: parsedNames })
    markStepCompleted(VENUE_COURTS_STEP)
    nextStep()
  }

  const handleVenuePhotoNext = () => {
    setError(null)
    markStepCompleted(VENUE_PHOTO_STEP)
    nextStep()
  }

  const handleMotivationSubmit = async () => {
    setAthleteMotivation(motivationText.trim())
    await handleCompleteFlow(motivationText.trim())
  }

  const buildCompletionPayload = (motivationValue: string) => {
    if (data.role === 'venue_manager') {
      return {
        hasRole: true,
        hasBasicInfo: true,
        hasVenueDetails: Boolean(data.venueName && data.venueAddress && data.venueEmail && data.venuePhone),
        hasVenueSports: data.venueSports.length > 0,
        hasVenueCourts: (data.totalCourts ?? 0) > 0,
        hasVenuePhoto: Boolean(data.venuePhoto || data.venuePhotoPreview),
        hasVenueVerification: data.venueConsent,
      }
    }
    return {
      hasRole: true,
      hasBasicInfo: true,
      hasUsername: true,
      hasSports: selectedSports.length > 0,
      hasSkillLevels: hasSkillSelections,
      hasPlayingStyle: Boolean(data.playingStyle),
      hasPlayFrequency: Boolean(data.playFrequency),
      hasAvatar: Boolean(data.avatar || data.avatarPreview),
      hasMotivation: Boolean((motivationValue || data.athleteMotivation).trim()),
    }
  }

  const buildCompletionRequest = (motivationValue: string) => ({
    fullName: basicInfo.fullName,
    city: basicInfo.city,
    gender: basicInfo.gender,
    username,
    sports: selectedSports.map((sport) => ({
      sport,
      skillLevel: data.skillLevels[sport] ?? 'mixed',
      playingStyle: data.playingStyle ?? 'mixed',
    })),
    motivation: motivationValue || data.athleteMotivation,
  })

  const handleCompleteFlow = async (motivationOverride?: string) => {
    if (data.role === 'venue_manager' && !data.venueConsent) {
      setError('Please authorize contact so we can verify your venue.')
      return
    }
    setSubmitting(true)
    setLoading(true)
    setError(null)
    try {
      const motivationValue = motivationOverride ?? motivationText
      const statusPayload = buildCompletionPayload(motivationValue)
      const response = await sessionService.completeOnboarding(buildCompletionRequest(motivationValue))
      setStatus(response.onboardingStatus)
      setAuthData(response.user, response.token, response.onboardingStatus)
      navigate(data.role === 'venue_manager' ? '/venues' : '/', { replace: true })
    } catch (err: any) {
      setError(err?.message ?? 'Failed to complete onboarding.')
    } finally {
      setSubmitting(false)
      setLoading(false)
    }
  }

  const handleVenueVerificationSubmit = async () => {
    if (!data.venueConsent) {
      setError('Please confirm we can contact you for verification.')
      return
    }
    await handleCompleteFlow()
  }

  const handleMotivationToggle = (value: string) => {
    setMotivationSelection((prev) => {
      const exists = prev.includes(value)
      const next = exists ? prev.filter((item) => item !== value) : [...prev, value]
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
            'relative rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-player-300',
            selectedRole === 'player'
              ? 'border-player-200 bg-player-50 shadow-[0_8px_24px_rgba(16,32,96,0.12)]'
              : 'border-player-200 bg-white hover:border-player-300'
          )}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🏃</span>
            <div>
              <h2 className="text-lg font-semibold text-player-900">Player</h2>
              <p className="text-sm text-player-900/70">Find teammates & pick-up events.</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-player-900/70">
            Join events, meet new athletes, and stay motivated with curated matches.
          </p>
          <SelectionBadge active={selectedRole === 'player'} />
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedRole('venue_manager')
            setError(null)
          }}
          className={clsx(
            'relative rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-player-300',
            selectedRole === 'venue_manager'
              ? 'border-player-200 bg-player-50 shadow-[0_8px_24px_rgba(16,32,96,0.12)]'
              : 'border-player-200 bg-white hover:border-player-300'
          )}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🏟️</span>
            <div>
              <h2 className="text-lg font-semibold text-player-900">Venue Manager</h2>
              <p className="text-sm text-player-900/70">Manage courts & connect with players.</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-player-900/70">
            Post availability, see who joins, and grow your community effortlessly.
          </p>
          <SelectionBadge active={selectedRole === 'venue_manager'} />
        </button>
      </div>
      <div className="pt-6 text-right">
        <Button
          type="button"
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
    <>
      <form className="space-y-6" onSubmit={handleBasicInfoSubmit}>
        <StepHeader
          step={currentIndex + 1}
          total={totalSteps}
          title="Introduce yourself"
          description="Help future teammates know who's joining."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Full name"
            type="text"
            placeholder="Alison Wu"
            value={basicInfo.fullName}
            onChange={(event) =>
              setBasicInfoState((prev) => ({
                ...prev,
                fullName: event.target.value,
              }))
            }
          />
          <InputField
            label="City"
            type="text"
            placeholder="Brisbane"
            value={basicInfo.city}
            disabled
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-player-900">
              Area name
            </label>
            <select
              value={basicInfo.postalArea}
              onChange={(event) => handlePostalAreaChange(event.target.value)}
              className="w-full rounded-lg border border-player-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-player-600"
            >
              <option value="">Select neighborhood</option>
              {AREA_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} · {option.postalCode}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-player-900">
            Gender (optional)
          </label>
          <p className="mb-2 text-xs text-player-500">Only used when a specific event requires it.</p>
          <select
            value={basicInfo.gender}
            onChange={(event) =>
              setBasicInfoState((prev) => ({
                ...prev,
                gender: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-player-200 bg-white px-4 py-3 text-sm text-player-900 focus:outline-none focus:ring-2 focus:ring-player-600"
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="pt-6 text-right">
          <Button type="submit" className="inline-flex items-center justify-center px-8">
            Next
          </Button>
        </div>
      </form>
    </>
  )

  const renderUsernameStep = () => (
    <form className="space-y-6" onSubmit={handleUsernameSubmit}>
      <StepHeader
        step={currentIndex + 1}
        total={totalSteps}
        title="Claim your username"
        description="This is how players can find and tag you across SportsMatch."
      />
      <InputField
        label="Username"
        type="text"
        placeholder=""
        value={username}
        onChange={(event) => {
          setUsernameState(event.target.value)
          setUsernameStatus('idle')
          setError(null)
        }}
      />
      <div className="flex items-center gap-2 text-sm">
        {usernameStatus === 'available' && <span className="text-green-600">Nice! That username is available.</span>}
        {usernameStatus === 'taken' && <span className="text-red-500">Try another username.</span>}
        {usernameStatus === 'checking' && <span className="text-player-600">Checking availability…</span>}
      </div>
      <div className="pt-6 text-right">
        <Button
          type="submit"
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
        description={`Pick up to ${MAX_SPORTS}. We'll use this to match you with events and teammates.`}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SPORTS.map((sport) => (
          <SportCard
            key={sport.id}
            name={sport.label}
            icon={sport.icon}
            selected={selectedSports.includes(sport.label)}
            onToggle={() => toggleSport(sport.label)}
          />
        ))}
      </div>
      <div className="pt-6 text-right">
        <Button
          type="button"
          className="inline-flex items-center justify-center px-8"
          onClick={() => {
            if (selectedSports.length === 0) {
              setError('Select at least one sport.')
              return
            }
            setError(null)
            markStepCompleted(PLAYER_SPORTS_STEP)
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
        title="How do you rate your play?"
        description="Choose the level that best describes your vibe for each sport."
      />
      <div className="space-y-4">
        {selectedSports.map((sport) => {
          const selectedLevel = data.skillLevels[sport]
          return (
            <div key={sport} className="rounded-2xl border border-player-200 bg-white/70 p-4">
              <p className="font-semibold text-player-900">{sport}</p>
              <div className="mt-3 grid gap-3 lg:grid-cols-3">
                {SKILL_OPTIONS.map((option) => {
                  const active = selectedLevel === option.value
                  return (
                    <label
                      key={option.value}
                      className={clsx(
                        'relative flex cursor-pointer flex-col rounded-2xl border p-4 text-left transition',
                        active
                          ? 'border-player-200 bg-player-50 shadow-[0_8px_24px_rgba(16,32,96,0.12)]'
                          : 'border-player-200 bg-white hover:border-player-300'
                      )}
                    >
                      <input
                        type="radio"
                        name={`${sport}-skill`}
                        value={option.value}
                        checked={active}
                        onChange={() => setSkillLevel(sport, option.value)}
                        className="sr-only"
                      />
                      <span className="font-semibold text-player-900">{option.title}</span>
                      <span className="mt-1 text-sm text-player-900/70">{option.description}</span>
                      <SelectionBadge active={active} />
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="pt-6 text-right">
        <Button type="button" className="inline-flex items-center justify-center px-8" onClick={handleSkillNext}>
          Next
        </Button>
      </div>
    </div>
  )

  const renderPlayingStyleStep = () => (
    <div className="space-y-6">
      <StepHeader
        step={currentIndex + 1}
        total={totalSteps}
        title="What's your playing vibe?"
        description="Help us match you with teammates who share your style."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {PLAYING_STYLE_OPTIONS.map((option) => {
          const active = data.playingStyle === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setPlayingStyle(option.id)
                setError(null)
              }}
              className={clsx(
                'relative rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-player-300',
                active
                  ? 'border-player-200 bg-player-50 shadow-[0_8px_24px_rgba(16,32,96,0.12)]'
                  : 'border-player-200 bg-white hover:border-player-300'
              )}
            >
              <span className="text-3xl">{option.icon}</span>
              <p className="mt-3 text-lg font-semibold text-player-900">{option.title}</p>
              <p className="mt-1 text-sm text-player-900/70">{option.description}</p>
              <SelectionBadge active={active} />
            </button>
          )
        })}
      </div>
      <div className="pt-6 text-right">
        <Button type="button" className="inline-flex items-center justify-center px-8" onClick={handlePlayingStyleNext}>
          Next
        </Button>
      </div>
    </div>
  )

  const renderFrequencyStep = () => (
    <div className="space-y-6">
      <StepHeader
        step={currentIndex + 1}
        total={totalSteps}
        title="How often do you play?"
        description="Help us understand your commitment level."
      />
      <div className="space-y-3">
        {FREQUENCY_OPTIONS.map((option) => {
          const active = data.playFrequency === option.id
          return (
            <label
              key={option.id}
              className={clsx(
                'relative flex cursor-pointer flex-col rounded-2xl border p-4 transition',
                active
                  ? 'border-player-200 bg-player-50 shadow-[0_8px_24px_rgba(16,32,96,0.12)]'
                  : 'border-player-200 bg-white hover:border-player-300'
              )}
            >
              <input
                type="radio"
                name="frequency"
                className="sr-only"
                checked={active}
                onChange={() => handlePlayFrequencySelect(option.id)}
              />
              <span className="text-base font-semibold text-player-900">{option.title}</span>
              <span className="text-sm text-player-900/70">{option.description}</span>
              <SelectionBadge active={active} />
            </label>
          )
        })}
      </div>
      <div className="pt-6 text-right">
        <Button type="button" className="inline-flex items-center justify-center px-8" onClick={handleFrequencySubmit}>
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
        title="Add your profile photo"
        description="Let teammates spot you quicker. You can skip for now."
      />
      <div className="rounded-2xl border-2 border-dashed border-player-200 bg-white/70 p-6 text-center">
        {data.avatarPreview ? (
          <div className="flex flex-col items-center gap-4">
            <img src={data.avatarPreview} alt="Profile preview" className="h-40 w-40 rounded-full object-cover" />
            <div className="flex gap-3">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border-2 border-player-600 px-6 py-3 text-sm font-semibold text-player-600 transition hover:bg-player-50">
                Change photo
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
              <button
                type="button"
                onClick={() => setAvatar(null, null)}
                className="text-sm font-semibold text-player-600"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-player-200 bg-white/70 p-8 text-center text-sm text-player-900/70 transition hover:border-player-300">
            <span className="text-4xl">📸</span>
            <span className="mt-3 font-semibold text-player-900">Upload photo</span>
            <span className="mt-1 text-xs text-player-900/60">Supports JPG or PNG under 5MB.</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        )}
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold text-player-900">What motivates you right now?</p>
        <div className="flex flex-wrap gap-2">
          {MOTIVATION_TAGS.map((item) => {
            const active = motivationSelection.includes(item)
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleMotivationToggle(item)}
                className={clsx(
                  'rounded-full border px-4 py-2 text-sm font-semibold transition',
                  active ? 'border-player-600 bg-player-50 text-player-700' : 'border-player-200 bg-white text-player-700 hover:border-player-300'
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
          variant="secondary"
          className="inline-flex items-center justify-center px-8"
          onClick={handleProfilePhotoNext}
          disabled={isLoading}
        >
          Skip photo
        </Button>
        <Button
          type="button"
          className="inline-flex items-center justify-center px-8"
          onClick={handleProfilePhotoNext}
          disabled={isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  )

  const renderMotivationStep = () => (
    <div className="space-y-6">
      <StepHeader
        step={currentIndex + 1}
        total={totalSteps}
        title="What motivates you to play?"
        description="Optional, but it helps us build your athlete identity."
      />
      <div>
        <label className="mb-2 block text-sm font-semibold text-player-900">Share what drives you</label>
        <textarea
          value={motivationText}
          onChange={(event) => setMotivationText(event.target.value)}
          rows={5}
          className="w-full rounded-2xl border border-player-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-player-600"
          placeholder="e.g., Love the social community and learning new skills"
        />
      </div>
      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="secondary"
          className="inline-flex items-center justify-center px-8"
          onClick={() => {
            setAthleteMotivation(motivationText.trim())
            void handleCompleteFlow(motivationText)
          }}
          disabled={submitting || isLoading}
        >
          Skip & finish
        </Button>
        <Button
          type="button"
          className="inline-flex items-center justify-center px-8"
          onClick={handleMotivationSubmit}
          disabled={submitting || isLoading}
        >
          {submitting ? 'Saving…' : 'Complete profile'}
        </Button>
      </div>
    </div>
  )

  const renderVenueDetailsStep = () => (
    <form className="space-y-6" onSubmit={handleVenueDetailsSubmit}>
      <StepHeader
        step={currentIndex + 1}
        total={totalSteps}
        title="Tell us about your venue"
        description="Players use this info to find and trust your courts."
      />
      <InputField
        label="Venue name"
        type="text"
        placeholder="Holland Park Community Courts"
        value={venueDetailsState.venueName}
        onChange={(event) =>
          setVenueDetailsState((prev) => ({ ...prev, venueName: event.target.value }))
        }
      />
      <InputField
        label="Address"
        type="text"
        placeholder="123 Park Lane, Holland Park QLD 4121"
        value={venueDetailsState.venueAddress}
        onChange={(event) =>
          setVenueDetailsState((prev) => ({ ...prev, venueAddress: event.target.value }))
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Phone number"
          type="tel"
          placeholder="+61 7 1234 5678"
          value={venueDetailsState.venuePhone}
          onChange={(event) =>
            setVenueDetailsState((prev) => ({ ...prev, venuePhone: event.target.value }))
          }
        />
        <InputField
          label="Email"
          type="email"
          placeholder="manager@hollandparktennis.com.au"
          value={venueDetailsState.venueEmail}
          onChange={(event) =>
            setVenueDetailsState((prev) => ({ ...prev, venueEmail: event.target.value }))
          }
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-player-900">Description (optional)</label>
        <textarea
          value={venueDetailsState.venueDescription}
          onChange={(event) =>
            setVenueDetailsState((prev) => ({ ...prev, venueDescription: event.target.value }))
          }
          rows={4}
          className="w-full rounded-2xl border border-player-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-player-600"
          placeholder="What makes your venue special?"
        />
      </div>
      <div className="pt-6 text-right">
        <Button type="submit" className="inline-flex items-center justify-center px-8">
          Next
        </Button>
      </div>
    </form>
  )

  const renderVenueSportsStep = () => (
    <div className="space-y-6">
      <StepHeader
        step={currentIndex + 1}
        total={totalSteps}
        title="What sports do you offer?"
        description="Select all that apply so players can find you."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {VENUE_SPORT_OPTIONS.map((sport) => {
          const active = data.venueSports.includes(sport)
          return (
            <button
              key={sport}
              type="button"
              onClick={() => handleVenueSportsToggle(sport)}
              className={clsx(
                'relative flex min-h-[90px] items-center rounded-2xl border bg-white px-4 py-4 text-left text-sm font-semibold shadow-sm transition',
                active
                  ? 'border-player-200 bg-player-50 text-player-900 shadow-[0_8px_24px_rgba(16,32,96,0.12)]'
                  : 'border-player-200 text-player-700 hover:border-player-300'
              )}
            >
              <span className="text-base text-player-900">{sport}</span>
              <SelectionBadge active={active} />
            </button>
          )
        })}
      </div>
      <div className="pt-6 text-right">
        <Button type="button" className="inline-flex items-center justify-center px-8" onClick={handleVenueSportsSubmit}>
          Next
        </Button>
      </div>
    </div>
  )

  const renderVenueCourtsStep = () => (
    <form className="space-y-6" onSubmit={handleVenueCourtsSubmit}>
      <StepHeader
        step={currentIndex + 1}
        total={totalSteps}
        title="What's your court setup?"
        description="Share how many courts you run and their names."
      />
      <InputField
        label="Number of courts"
        type="number"
        placeholder="4"
        value={totalCourtsInput}
        onChange={(event) => setTotalCourtsInput(event.target.value)}
      />
      <div>
        <label className="mb-2 block text-sm font-semibold text-player-900">
          Court names (optional)
        </label>
        <textarea
          value={courtNamesInput}
          onChange={(event) => setCourtNamesInput(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-player-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-player-600"
          placeholder="Court A, Court B, Court C, Court D"
        />
      </div>
      <div className="pt-6 text-right">
        <Button type="submit" className="inline-flex items-center justify-center px-8">
          Next
        </Button>
      </div>
    </form>
  )

  const renderVenuePhotoStep = () => (
    <div className="space-y-6">
      <StepHeader
        step={currentIndex + 1}
        total={totalSteps}
        title="Add a venue photo"
        description="Help players recognize your venue."
      />
      <div className="rounded-2xl border-2 border-dashed border-player-200 bg-white/70 p-6 text-center">
        {data.venuePhotoPreview ? (
          <div className="flex flex-col items-center gap-4">
            <img src={data.venuePhotoPreview} alt="Venue preview" className="h-48 w-full rounded-2xl object-cover md:w-3/4" />
            <div className="flex gap-3">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border-2 border-player-600 px-6 py-3 text-sm font-semibold text-player-600 transition hover:bg-player-50">
                Change photo
                <input type="file" accept="image/*" className="hidden" onChange={handleVenuePhotoChange} />
              </label>
              <button
                type="button"
                onClick={() => setVenuePhoto(null, null)}
                className="text-sm font-semibold text-player-600"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-player-200 bg-white/70 p-8 text-center text-sm text-player-900/70 transition hover:border-player-300">
            <span className="text-4xl">🏙️</span>
            <span className="mt-3 font-semibold text-player-900">Upload venue photo</span>
            <span className="mt-1 text-xs text-player-900/60">Supports JPG or PNG under 5MB.</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleVenuePhotoChange} />
          </label>
        )}
      </div>
      <div className="flex flex-col gap-3 pt-6 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="secondary"
          className="inline-flex items-center justify-center px-8"
          onClick={handleVenuePhotoNext}
        >
          Skip photo
        </Button>
        <Button
          type="button"
          className="inline-flex items-center justify-center px-8"
          onClick={handleVenuePhotoNext}
        >
          Next
        </Button>
      </div>
    </div>
  )

  const renderVenueVerifyStep = () => (
    <div className="space-y-6">
      <StepHeader
        step={currentIndex + 1}
        total={totalSteps}
        title="Venue contact & verification"
        description="We'll send a verification email to confirm you're the venue manager."
      />
      <div className="rounded-2xl border border-player-200 bg-white/80 p-6">
        <p className="text-sm text-player-900/70">Email</p>
        <p className="text-lg font-semibold text-player-900">{data.venueEmail || venueDetailsState.venueEmail || 'manager@yourvenue.com'}</p>
        <label className="mt-4 flex items-center gap-2 text-sm text-player-900">
          <input
            type="checkbox"
            checked={data.venueConsent}
            onChange={(event) => {
              setVenueConsent(event.target.checked)
              setError(null)
            }}
            className="h-4 w-4 rounded border-player-300 text-player-600 focus:ring-player-600"
          />
          I authorize this email to be contacted for verification.
        </label>
      </div>
      <div className="pt-6 text-right">
        <Button
          type="button"
          className="inline-flex items-center justify-center px-8"
          onClick={handleVenueVerificationSubmit}
          disabled={submitting || isLoading}
        >
          {submitting ? 'Sending…' : 'Complete verification'}
        </Button>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case ROLE_STEP:
        return renderRoleStep()
      case PLAYER_INTRO_STEP:
        return renderBasicInfoStep()
      case PLAYER_USERNAME_STEP:
        return renderUsernameStep()
      case PLAYER_SPORTS_STEP:
        return renderSportsStep()
      case PLAYER_SKILL_STEP:
        return renderSkillStep()
      case PLAYER_STYLE_STEP:
        return renderPlayingStyleStep()
      case PLAYER_FREQUENCY_STEP:
        return renderFrequencyStep()
      case PLAYER_AVATAR_STEP:
        return renderAvatarStep()
      case PLAYER_MOTIVATION_STEP:
        return renderMotivationStep()
      case VENUE_DETAILS_STEP:
        return renderVenueDetailsStep()
      case VENUE_SPORTS_STEP:
        return renderVenueSportsStep()
      case VENUE_COURTS_STEP:
        return renderVenueCourtsStep()
      case VENUE_PHOTO_STEP:
        return renderVenuePhotoStep()
      case VENUE_VERIFY_STEP:
        return renderVenueVerifyStep()
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-player-50 via-white to-player-200">
      <Header showActions={false} />
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 pb-12 pt-6">
        <div className="flex items-center gap-3">
          {canGoBack && (
            <button
              type="button"
              onClick={prevStep}
              className="text-sm font-semibold text-player-600 transition hover:text-player-700"
            >
              ← Back
            </button>
          )}
          {error && (
            <div className="ml-auto rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 shadow-sm">
              {error}
            </div>
          )}
        </div>
        <main className="rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur">
          {renderStepContent()}
        </main>
      </div>
    </div>
  )
}

export default OnboardingPage
