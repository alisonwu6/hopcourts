import clsx from 'clsx'
import { Menu, PlusSquare, Copy, MessageCircle, Bell } from 'lucide-react'
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { type MateCardProps } from '@/features/mates/components/MateCard'
import { notificationsService } from '@/features/notifications/services/notificationsService'
import { BottomSheet } from '@/components/BottomSheet'
import { SheetLayout } from '@/components/SheetLayout'
import { AlertDialog } from '@/components'
import { useAuthStore } from '@/hooks'
import { profileService } from '@/features/profile/profile.service'
import { useSports } from '@/features/dictionaries/hooks'
import { useCities, useVibes } from '@/features/dictionaries/hooks'
import { HeroCard } from '@/features/profile/components/HeroCard'
import { AvatarCropSheet } from '@/features/profile/components/AvatarCropSheet'
import { ProfileRequiredSheet } from '@/features/profile/components/ProfileRequiredSheet'
import { ProfileCompletionSheet } from '@/features/profile/components/ProfileCompletionSheet'
import { ProfileEventsPanel } from '@/features/profile/components/ProfileEventsPanel'
import { createDaySlots, dayLabels } from '@/features/profile/constants'
import type { GoalState } from '@/features/profile/types'
import { PageLoading } from '@/components/PageLoading'
import { vibeTokens, type Vibe } from '@/constants/vibeTokens'

type ProfileVM = {
  username: string
  usernameUpdatedCount: number
  card: MateCardProps
  favoriteSportKeys: string[]
  tryingSportKeys: string[]
}

const isUuid = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

const emptyProfile: MateCardProps = {
  name: '',
  location: '',
  cityKey: '',
  vibe: null,
  vibeKey: null,
  sports: [],
  trying: [],
  blurb: '',
  avatar: '',
  gender: null,
  ageRangeKey: null,
}

export function ProfilePage() {
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean
    title: string
    description: React.ReactNode
    type: 'success' | 'error' | 'info' | 'warning'
  }>({ open: false, title: '', description: '', type: 'info' })

  const [unreadCount, setUnreadCount] = useState(0)

  const [showGoalSheet, setShowGoalSheet] = useState(false)
  const [showShareSheet, setShowShareSheet] = useState(false)
  const [goal, setGoal] = useState<GoalState | null>(null)
  const [draftGoal, setDraftGoal] = useState<GoalState>({
    sessionsPerWeek: '',
    timeOfDay: 'Morning',
    days: [],
  })
  const [goalDaySlots, setGoalDaySlots] = useState<Record<string, string[]>>(createDaySlots())
  const [draftDaySlots, setDraftDaySlots] = useState<Record<string, string[]>>(createDaySlots())
  const [draftPreferredTime, setDraftPreferredTime] = useState('Morning')
  const [showAvatarCropper, setShowAvatarCropper] = useState(false)
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const userAvatar = (user as any)?.avatar || (user as any)?.avatar_url || (user as any)?.avatarUrl
  const userId = (user as any)?.id
  const [vm, setVm] = useState<ProfileVM | null>(null)
  const [draftProfile, setDraftProfile] = useState<MateCardProps>(emptyProfile)
  const [draftUsername, setDraftUsername] = useState<string>((user as any)?.username || '')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingGoal, setIsSavingGoal] = useState(false)
  const [isProfileLoaded, setIsProfileLoaded] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showProfileRequiredSheet, setShowProfileRequiredSheet] = useState(false)
  const [showSportsSheet, setShowSportsSheet] = useState(false)
  const [showTryingSheet, setShowTryingSheet] = useState(false)
  const [showCompletionSheet, setShowCompletionSheet] = useState(false)

  const [fieldError, setFieldError] = useState<string | null>(null)
  const [activeField, setActiveField] = useState<
    null | 'name' | 'username' | 'location' | 'vibe' | 'bio' | 'gender'
  >(null)
  const [fieldValue, setFieldValue] = useState('')
  const [sportsSearch, setSportsSearch] = useState('')
  const [tryingSearch, setTryingSearch] = useState('')
  const { items: sportsCatalog } = useSports('en')
  const { items: vibesCatalog } = useVibes('en')
  const { items: citiesCatalog } = useCities(undefined, 'en')
  const navigate = useNavigate()
  const location = useLocation()
  const labelForSport = useMemo(() => {
    const keyMap = new Map<string, string>()
    const labelMap = new Map<string, string>()
    sportsCatalog.forEach((s) => {
      keyMap.set(s.key.toLowerCase(), s.label)
      labelMap.set(s.label.toLowerCase(), s.label)
    })
    return (value: string) => {
      if (!value) return value
      const lower = value.toLowerCase()
      return keyMap.get(lower) || labelMap.get(lower) || value
    }
  }, [sportsCatalog])

  const keyForLabel = useMemo(() => {
    const map = new Map<string, string>()
    sportsCatalog.forEach((s) => {
      map.set(s.label, s.key)
      map.set(s.key, s.key)
      map.set(s.label.toLowerCase(), s.key)
      map.set(s.key.toLowerCase(), s.key)
    })
    return (label: string) => map.get(label) || map.get(label?.toLowerCase?.() || '') || label
  }, [sportsCatalog])

  const labelForVibe = useMemo(() => {
    const map = new Map<string, string>()
    vibesCatalog.forEach((v) => {
      map.set(v.key, v.label)
      map.set(v.key.toLowerCase(), v.label)
    })
    return (key: string) => map.get(key) || map.get(key?.toLowerCase?.() || '') || key
  }, [vibesCatalog])

  const vibeKeyToUnion = useMemo(() => {
    const map = new Map<string, MateCardProps['vibe']>()
    vibesCatalog.forEach((v) => {
      const union = (v.key.charAt(0) + v.key.slice(1).toLowerCase()) as MateCardProps['vibe']
      map.set(v.key, union)
      map.set(v.key.toLowerCase(), union)
    })
    return map
  }, [vibesCatalog])

  const vibeUnionToKey = useMemo(() => {
    const map = new Map<string, string>()
    vibesCatalog.forEach((v) => {
      const union = (v.key.charAt(0) + v.key.slice(1).toLowerCase()) as MateCardProps['vibe']
      if (union) {
        map.set(union as string, v.key)
        map.set((union as string).toLowerCase(), v.key)
      }
    })
    return map
  }, [vibesCatalog])

  const labelForCity = useMemo(() => {
    const map = new Map(citiesCatalog.map((c) => [c.key, c.label]))
    return (key?: string) => (key ? map.get(key) || key : '')
  }, [citiesCatalog])

  // Helper: fallback for vibe key to union conversion (e.g., 'CHILL' -> 'Chill')
  const vibeKeyToUnionFallback = (key: string): MateCardProps['vibe'] =>
    key && typeof key === 'string'
      ? ((key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()) as MateCardProps['vibe'])
      : null

  // Memo: derive resolvedProfile (display-ready, labels filled, union vibe)
  const resolvedProfile = useMemo<MateCardProps | null>(() => {
    if (!vm?.card) return null
    const favoriteLabels = (
      vm.favoriteSportKeys.length ? vm.favoriteSportKeys : vm.card.sports || []
    ).map(labelForSport)
    const tryingLabels = (
      vm.tryingSportKeys.length ? vm.tryingSportKeys : vm.card.trying || []
    ).map(labelForSport)
    const locationLabel = vm.card.cityKey
      ? labelForCity(vm.card.cityKey) || vm.card.location
      : vm.card.location
    let vibeUnion: MateCardProps['vibe'] = null
    if (vm.card.vibe) {
      vibeUnion = vm.card.vibe
    } else if (vm.card.vibeKey) {
      vibeUnion =
        vibeKeyToUnion.get(vm.card.vibeKey) ||
        vibeKeyToUnion.get(vm.card.vibeKey.toLowerCase()) ||
        vibeKeyToUnionFallback(vm.card.vibeKey)
    } else {
      vibeUnion = null
    }
    return {
      ...vm.card,
      sports: favoriteLabels,
      trying: tryingLabels,
      location: locationLabel,
      vibe: vibeUnion,
    }
  }, [vm, labelForSport, labelForCity, vibeKeyToUnion])

  // Memo: derive resolvedDraftProfile (for HeroCard, always label fields, union vibe)
  const resolvedDraftProfile = useMemo<MateCardProps>(() => {
    const locationLabel = draftProfile.cityKey
      ? labelForCity(draftProfile.cityKey) || draftProfile.location
      : draftProfile.location
    let vibeUnion: MateCardProps['vibe'] = draftProfile.vibe
    const draftVibeKey = (draftProfile as any).vibeKey
    if (!vibeUnion && draftVibeKey) {
      vibeUnion =
        vibeKeyToUnion.get(draftVibeKey) ||
        vibeKeyToUnion.get(draftVibeKey.toLowerCase()) ||
        vibeKeyToUnionFallback(draftVibeKey)
    }
    return {
      ...draftProfile,
      location: locationLabel,
      vibe: vibeUnion,
    }
  }, [draftProfile, labelForCity, vibeKeyToUnion])

  const usernameFromVm = vm?.username
  const usernameFromUser = (user as any)?.username
  const username =
    usernameFromVm || usernameFromUser || draftUsername || (resolvedProfile as any)?.username || ''

  const [rawProfile, setRawProfile] = useState<any>(null)
  const hasBootstrappedRef = React.useRef(false)

  // 1. Fetch Data Only (Stable dependencies)
  const fetchProfileData = useCallback(async () => {
    if (!isAuthenticated) return
    const authUser = useAuthStore.getState().user as any
    const fallbackAvatar = authUser?.avatar || authUser?.avatar_url || authUser?.avatarUrl || ''

    try {
      // 1. Fetch Profile + notification summary in parallel
      let payload: any = null
      const [profileSettled, notificationsSettled] = await Promise.allSettled([
        profileService.getProfile(),
        notificationsService.listNotifications({ limit: 1 }),
      ])

      if (notificationsSettled.status === 'fulfilled') {
        const unread = (notificationsSettled.value as any)?.data?.unread_count
        if (typeof unread === 'number') {
          setUnreadCount(unread)
        }
      }

      if (profileSettled.status === 'fulfilled') {
        payload = (profileSettled.value as any)?.data ?? profileSettled.value
      } else {
        const err: any = profileSettled.reason
        console.warn('Profile load failed (expected for new users):', err)
        const status = err?.status || err?.response?.status
        if (status === 404) {
          setShowEditSheet(true)
        }
        setVm(null)
        setRawProfile(null) // Clear raw

        const prefill: MateCardProps = {
          ...emptyProfile,
          name: authUser?.name || '',
          avatar: fallbackAvatar,
        }
        setDraftProfile(prefill)
        setIsProfileLoaded(true)
        return
      }

      // 2. Process Onboarding & Sync User
      if (payload) {
        const data = payload.user || payload
        setRawProfile(payload)

        const completedAt = data.onboarding_completed_at

        if (completedAt) {
          setShowProfileRequiredSheet(false)
        } else {
          setShowProfileRequiredSheet(true)
        }

        // Sync to AuthStore
        const { user: authUser, token, setAuthData } = useAuthStore.getState()
        if (authUser && token) {
          const newName = data.display_name || authUser.name
          const newAvatar = data.avatar_url || authUser.avatar
          const newLocation = data.city_key || authUser.location
          const newGender = data.gender || authUser.gender
          const newBio = data.bio || authUser.bio

          const isChanged =
            authUser.name !== newName ||
            authUser.avatar !== newAvatar ||
            authUser.location !== newLocation ||
            authUser.gender !== newGender ||
            authUser.bio !== newBio ||
            authUser.onboarding_completed_at !== data.onboarding_completed_at

          if (isChanged) {
            setAuthData(
              {
                ...authUser,
                name: newName,
                avatar: newAvatar,
                location: newLocation,
                gender: newGender,
                bio: newBio,
                onboarding_completed_at:
                  data.onboarding_completed_at || authUser.onboarding_completed_at,
              },
              token
            )
          }
        }

        // 3. STOP if Onboarding
        // 3. STOP if Onboarding
        if (!completedAt) {
          setIsProfileLoaded(true)
          return
        }
      }

      // Preferences API removed.
    } catch (err) {
      console.error('Core profile load failed', err)
      setVm(null)
      const prefill: MateCardProps = {
        ...emptyProfile,
        name: authUser?.name || '',
        avatar: fallbackAvatar,
      }
      setDraftProfile(prefill)
    } finally {
      setIsProfileLoaded(true)
    }
  }, [isAuthenticated])

  // 2. Map Data to VM (Reactive to dictionary changes)
  useEffect(() => {
    if (!rawProfile) return

    const payload = rawProfile
    const data = payload.user ? payload.user : payload
    const sportsRows = payload.sports || []

    // Fallback: if data has favorite_sports array (direct format) use it, else use sportsRows
    const favoriteKeys =
      payload.favorite_sports ||
      data.favorite_sports ||
      sportsRows.filter((s: any) => s.kind === 'FAVORITE').map((s: any) => s.sport_key)
    const tryingKeys =
      payload.trying_sports ||
      data.trying_sports ||
      sportsRows.filter((s: any) => s.kind === 'TRYING').map((s: any) => s.sport_key)

    const vibeKey = data.vibe_key || null
    const vibeUnion = vibeKey
      ? vibeKeyToUnion.get(vibeKey) ||
        vibeKeyToUnion.get(vibeKey.toLowerCase()) ||
        vibeKeyToUnionFallback(vibeKey)
      : null

    const mapped: MateCardProps = {
      name:
        data.display_name ||
        (isUuid(data.username) ? '' : data.username) ||
        (user as any)?.name ||
        '',
      location: data.city_label || data.city || '',
      cityKey: data.city_key || '',
      vibe: vibeUnion,
      vibeKey,
      sports: (favoriteKeys || []).map(labelForSport),
      trying: (tryingKeys || []).map(labelForSport),
      blurb: data.bio || '',
      avatar: data.avatar_url || userAvatar || '',
      friendCount: data.teammate_count || 0,
      joinedCount: data.joined_count || 0,
      hostedCount: data.hosted_count || 0,
      gender: data.gender || null,
      ageRangeKey: data.age_range_key || null,
    }
    const rawUsername = data.username || (user as any)?.username || ''
    const nextUsername = isUuid(rawUsername) ? '' : rawUsername

    setVm({
      username: nextUsername,
      usernameUpdatedCount: data.username_updated_count || 0,
      card: mapped,
      favoriteSportKeys: favoriteKeys || [],
      tryingSportKeys: tryingKeys || [],
    })

    // Only update draft if not editing to avoid overwriting user input
    setDraftProfile((prev) => {
      // Simple heuristic: if names match, assume sync.
      // Better: maybe only on initial load? But we want to react to dictionary labels.
      // We just update it. The fetchProfileData logic previously did this violently.
      // We'll update it but we rely on showEditSheet state or similar?
      // Actually, previous logic ALWAYS overwrote draftProfile. We maintain that behavior for now but it's reactive.
      // To be safe, we just set it.
      return mapped
    })
    setDraftUsername(nextUsername)
  }, [rawProfile, labelForSport, vibeKeyToUnion, user, userAvatar])

  useEffect(() => {
    if (!isAuthenticated) {
      hasBootstrappedRef.current = false
      return
    }
    if (hasBootstrappedRef.current) return
    hasBootstrappedRef.current = true
    fetchProfileData()
  }, [isAuthenticated, fetchProfileData])

  // 1.5 Handle deep link from ProfileRequiredSheet (navigation from other pages)
  useEffect(() => {
    if (location.state?.openEdit) {
      setShowEditSheet(true)
      // Clear state so it doesn't re-trigger
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Monitor first-time onboarding completion via global state
  const prevOnboardedRef = React.useRef(!!(user as any)?.onboarding_completed_at)
  useEffect(() => {
    const isNowOnboarded = !!(user as any)?.onboarding_completed_at
    if (!prevOnboardedRef.current && isNowOnboarded) {
      // Immediate trigger for overlap effect
      setShowEditSheet(false)
      setShowCompletionSheet(true)
      setShowProfileRequiredSheet(false)
    }
    prevOnboardedRef.current = isNowOnboarded
  }, [(user as any)?.onboarding_completed_at])

  const handleOpenGoal = () => {
    const baseGoal = goal ?? {
      sessionsPerWeek: '',
      timeOfDay: draftPreferredTime || 'Morning',
      days: [],
    }
    setDraftGoal(baseGoal)
    setDraftDaySlots(goalDaySlots)
    setDraftPreferredTime(baseGoal.timeOfDay || 'Morning')
    setShowGoalSheet(true)
  }

  const handleSaveGoal = async () => {
    if (isSavingGoal) return
    setIsSavingGoal(true)
    try {
      setGoal({ ...draftGoal, timeOfDay: draftPreferredTime })
      setGoalDaySlots(draftDaySlots)
      setShowGoalSheet(false)
    } catch (err) {
      console.error('Failed to save preferences', err)
    } finally {
      setIsSavingGoal(false)
    }
  }

  const handleShare = async () => {
    const shareUsername = username || draftUsername
    if (!shareUsername) return

    const url = `${window.location.origin}/mate/${shareUsername}`
    const shareData = {
      title: 'SportsMatch Activity Card',
      text: `Check out ${draftProfile.name} activity profile`,
      url,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        setShowShareSheet(true)
      }
    } catch (err: any) {
      console.error('Share failed', err)
    }
  }

  const handleShareToLine = () => {
    const shareUsername = username || draftUsername
    const url = `${window.location.origin}/mate/${shareUsername}`
    const text = `Check out ${draftProfile.name} activity profile\n${url}`
    window.location.href = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`
    setShowShareSheet(false)
  }

  const handleCopyLink = async () => {
    const shareUsername = username || draftUsername
    const url = `${window.location.origin}/mate/${shareUsername}`
    const text = `Check out ${draftProfile.name} activity profile\n${url}`

    try {
      await navigator.clipboard.writeText(text)
      setAlertDialog({
        open: true,
        title: 'Copied',
        description: 'Link and text copied to clipboard',
        type: 'success',
      })
    } catch (err) {
      window.prompt('Copy this link', text)
    } finally {
      setShowShareSheet(false)
    }
  }

  const handleOpenProfileEdit = () => {
    setDraftProfile(resolvedProfile ?? emptyProfile)
    setDraftUsername(vm?.username || '')
    setShowEditSheet(true)
  }

  const openFieldSheet = (field: typeof activeField, value: string, rawKey?: string) => {
    let nextValue = rawKey ?? value
    if (field === 'vibe') {
      const vibe = value as NonNullable<MateCardProps['vibe']>
      nextValue = rawKey || (vibe ? vibeUnionToKey.get(vibe) : undefined) || value
    }
    setFieldError(null)
    setActiveField(field)
    setFieldValue(nextValue)
  }

  const handleSaveField = async () => {
    if (!activeField) return
    const value = fieldValue.trim()
    const next = { ...draftProfile }

    switch (activeField) {
      case 'name':
        next.name = value
        break
      case 'username':
        if (!value) {
          setFieldError('Please enter a username')
          return
        }
        if (!/^[a-zA-Z0-9_.]+$/.test(value)) {
          setFieldError('Username can only include letters, numbers, underscores, and periods')
          return
        }
        if (value.length < 3 || value.length > 10) {
          setFieldError('Username length must be between 3 and 10 characters')
          return
        }
        {
          const currentUsername = ((vm?.username || (user as any)?.username || '') as string).trim()
          const isSameUsername = value.toLowerCase() === currentUsername.toLowerCase()
          if (!isSameUsername) {
            setIsSavingProfile(true)
            try {
              // 200 => already exists, 404 => available
              await profileService.getProfileByUsername(value)
              setFieldError('Username already exists, please choose another one')
              return
            } catch (err: any) {
              const status = err?.status || err?.response?.status
              if (status !== 404) {
                setFieldError('Unable to verify username right now, please try again later')
                return
              }
            } finally {
              setIsSavingProfile(false)
            }
          }
        }
        setDraftUsername(value)
        break
      case 'location':
        next.location = labelForCity(value) || value
        next.cityKey = value
        break
      case 'vibe':
        next.vibe = vibeKeyToUnion.get(value) || (value as MateCardProps['vibe'])
        next.vibeKey = value
        break
      case 'bio':
        next.blurb = value
        break
      case 'gender':
        next.gender = value
        break
      default:
        break
    }
    setDraftProfile(next)
    setActiveField(null)
  }

  const saveSports = () => {
    // Sports selections are local draft only; final save happens on "Done".
    setShowSportsSheet(false)
    setShowTryingSheet(false)
  }

  const handleSaveProfile = async () => {
    if (isSavingProfile) return
    setIsSavingProfile(true)
    try {
      const favoriteKeys = Array.from(
        new Set((draftProfile.sports || []).filter(Boolean).map((label) => keyForLabel(label)))
      )
      const tryingKeys = Array.from(
        new Set((draftProfile.trying || []).filter(Boolean).map((label) => keyForLabel(label)))
      )

      const payload: any = {
        display_name: draftProfile.name,
        bio: draftProfile.blurb,
        vibe_key:
          (draftProfile as any).vibeKey ||
          vibeUnionToKey.get(draftProfile.vibe as string) ||
          undefined,
        city_key: draftProfile.cityKey || undefined,
        gender: draftProfile.gender || undefined,
        age_range_key: draftProfile.ageRangeKey || undefined,
        favorite_sports: favoriteKeys,
        trying_sports: tryingKeys,
        avatar_url: draftProfile.avatar || undefined,
      }
      if (draftUsername && !isUuid(draftUsername)) {
        payload.username = draftUsername
      }

      const res = await profileService.saveProfile(payload)
      const responseData = (res as any).data || res
      const savedUser = responseData.user || responseData

      // If we got a valid updated count from backend, use it. Otherwise estimate.
      const newCount =
        typeof savedUser?.username_updated_count === 'number'
          ? savedUser.username_updated_count
          : (vm?.usernameUpdatedCount || 0) + (payload.username ? 1 : 0)

      const updated = {
        ...draftProfile,
        sports: draftProfile.sports.filter(Boolean),
        trying: draftProfile.trying.filter(Boolean),
      }
      setVm({
        username: draftUsername || vm?.username || '',
        usernameUpdatedCount: newCount,
        card: updated,
        favoriteSportKeys: favoriteKeys,
        tryingSportKeys: tryingKeys,
      })
      // Update AuthStore immediately
      const { user: authUser, token, setAuthData } = useAuthStore.getState()
      if (authUser && token) {
        // savedUser from response has DB fields
        const updatedUser = {
          ...authUser,
          name: savedUser.display_name || authUser.name,
          avatar: savedUser.avatar_url || authUser.avatar,
          gender: savedUser.gender || authUser.gender,
          bio: savedUser.bio || authUser.bio,
          location: savedUser.city_key || authUser.location,
          onboarding_completed_at:
            savedUser.onboarding_completed_at || authUser.onboarding_completed_at,
        }
        setAuthData(updatedUser, token)
      }

      setShowEditSheet(false)
      setRawProfile(responseData)
    } catch (err: any) {
      // keep sheet open for retry
      console.error('Failed to save profile', err)
      const status = err?.status || err?.response?.status
      const errorData = err?.response?.data?.error || {}
      const constraint = errorData.details?.constraint || ''

      if (status === 409) {
        if (constraint.includes('username')) {
          alert('Username already exists, please choose another one')
        } else {
          alert('Save failed: data conflict, please check your input')
        }
      } else {
        alert('Save failed, please try again later')
      }
    } finally {
      setIsSavingProfile(false)
    }
  }

  if (isLoading || !isProfileLoaded) {
    return <PageLoading />
  }
  if (!isAuthenticated) return null

  const pageContent = (
    <div className="min-h-screen overflow-y-auto pb-[120px]">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative flex items-center justify-between bg-white px-4 py-4">
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Add game"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-800 hover:bg-slate-50 active:bg-slate-100"
              onClick={() => {
                const isProfileComplete = !!(user as any)?.onboarding_completed_at

                if (!isProfileComplete) {
                  setShowProfileRequiredSheet(true)
                } else {
                  navigate('/create-event')
                }
              }}
            >
              <PlusSquare className="h-6 w-6" />
            </button>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 w-[60%] -translate-x-1/2 -translate-y-1/2 px-2 text-center">
            <span className="block truncate text-xl font-bold text-slate-900">{username}</span>
          </div>

          <div className="flex items-center gap-1">
            <Link
              to="/notifications"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-800 hover:bg-slate-50 active:bg-slate-100"
            >
              <div className="relative">
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute right-0 top-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </div>
            </Link>
            <Link
              to="/settings"
              aria-label="Menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
            >
              <Menu className="h-6 w-6" />
            </Link>
          </div>
        </div>

        <HeroCard
          onShare={handleShare}
          profile={
            resolvedProfile ?? {
              ...emptyProfile,
              name: (user as any)?.name || '',
              avatar: userAvatar || '',
            }
          }
          onEdit={handleOpenProfileEdit}
          avatarFallback={userAvatar || ''}
          actionLabel="Edit"
          actionClassName=""
          onHostedClick={() => navigate('/profile/hosted-events')}
          onJoinedClick={() => navigate('/profile/joined-events')}
          onTeammatesClick={() => navigate('/circle')}
        />
        <div className="mt-4 space-y-4 px-3">
          <h3 className="px-1 text-xl font-semibold text-slate-700">Recent Activities</h3>
          <ProfileEventsPanel mode="all" showTimeTabs={false} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      {pageContent}
      <AvatarCropSheet
        open={showAvatarCropper}
        onClose={() => setShowAvatarCropper(false)}
        userId={userId}
        defaultAvatar={draftProfile.avatar || userAvatar || ''}
        onAvatarUpdated={(url) => {
          // 1. Update local UI state immediately
          setDraftProfile((prev) => ({ ...prev, avatar: url }))
          setVm((prev) => (prev ? { ...prev, card: { ...prev.card, avatar: url } } : prev))

          // 2. Update Auth Store immediately so other components (like Header) update
          const { user: authUser, token, setAuthData: setAuth } = useAuthStore.getState()
          if (authUser && token) {
            setAuth({ ...authUser, avatar: url }, token)
          }

          // 3. Persist to Backend in background
          profileService
            .saveProfile({ avatar_url: url })
            .then((res) => {
              // Update rawProfile to match, so useEffect doesn't revert it
              const data = (res as any)?.data ?? res
              // Keep latest avatar url with cache-busting params if present
              if (data && data.user) {
                data.user.avatar_url = url
              } else if (data) {
                data.avatar_url = url
              }
              setRawProfile(data)
            })
            .catch((err) => {
              console.error('Failed to save avatar URL to DB', err)
            })
        }}
      />

      {/* Profile Required Bottom Sheet */}
      <ProfileRequiredSheet
        open={showProfileRequiredSheet}
        dismissible={true}
        onClose={() => {
          setShowProfileRequiredSheet(false)
        }}
        onConfirm={() => {
          setShowProfileRequiredSheet(false)
          setShowEditSheet(true)
        }}
      />

      <AlertDialog
        open={alertDialog.open}
        onClose={() => setAlertDialog((prev) => ({ ...prev, open: false }))}
        title={alertDialog.title}
        description={alertDialog.description}
        type={alertDialog.type}
      />

      {/* Custom Share Sheet for non-native environments */}
      <BottomSheet open={showShareSheet} onClose={() => setShowShareSheet(false)}>
        <div className="px-4 pb-8 pt-4">
          <h3 className="mb-6 text-center text-lg font-bold text-slate-900">Share Activity Card</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleShareToLine}
              className="flex flex-col items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 py-4 active:bg-slate-100"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#06C755] text-white shadow-sm">
                <MessageCircle className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-slate-700">LINE</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 py-4 active:bg-slate-100"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600 shadow-sm">
                <Copy className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-slate-700">Copy Link</span>
            </button>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet
        open={showEditSheet}
        onClose={() => {
          if (isSavingProfile) return
          setShowEditSheet(false)
        }}
        showHandle={false}
        disableContainer
      >
        <SheetLayout
          onClose={() => {
            if (isSavingProfile) return
            setShowEditSheet(false)
          }}
          title="My Sport Card"
          subtitle="Keep your activity status up to date"
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 min-h-0 overflow-y-auto px-5 pb-24 pt-4 space-y-4"
          primaryButton={{
            label: 'Done',
            onClick: handleSaveProfile,
            disabled: isSavingProfile,
            isLoading: isSavingProfile,
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={draftProfile.avatar || userAvatar || ''}
                alt="Avatar"
                className="h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-white"
              />
              <button
                type="button"
                onClick={() => setShowAvatarCropper(true)}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-md"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Basic Info</p>
            <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {[
                { key: 'name', label: 'Name', value: draftProfile.name },
                {
                  key: 'username',
                  label: 'Username',
                  value: draftUsername ?? '',
                },
                {
                  key: 'location',
                  label: 'Current Location',
                  value: labelForCity(draftProfile.cityKey) || draftProfile.location,
                  valueKey: draftProfile.cityKey || '',
                },
                {
                  key: 'gender',
                  label: 'Gender',
                  value:
                    draftProfile.gender === 'male'
                      ? 'Male'
                      : draftProfile.gender === 'female'
                        ? 'Female'
                        : 'Not set',
                  valueKey: draftProfile.gender || '',
                },
              ].map((row) => {
                const isUsernameField = row.key === 'username'
                const isReadOnly = isUsernameField && !!vm?.username
                const Component = isReadOnly ? 'div' : 'button'
                return (
                  <Component
                    key={row.key}
                    type={isReadOnly ? undefined : 'button'}
                    onClick={
                      isReadOnly
                        ? undefined
                        : () => openFieldSheet(row.key as any, row.value, (row as any).valueKey)
                    }
                    className={clsx(
                      'flex w-full items-center justify-between px-4 py-4 text-left',
                      isReadOnly ? 'bg-slate-100' : ''
                    )}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-700">{row.label}</p>
                      <p className="text-base font-semibold text-slate-900">
                        {row.value || 'Not set'}
                      </p>
                    </div>
                    {!isReadOnly && <span className="text-slate-400">›</span>}
                  </Component>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Sports</p>
            <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() =>
                  openFieldSheet(
                    'vibe',
                    draftProfile.vibe || '',
                    (draftProfile as any).vibeKey ||
                      vibeUnionToKey.get(draftProfile.vibe as string) ||
                      ''
                  )
                }
                className="flex w-full items-center justify-between px-4 py-4 text-left"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">Workout Vibe</p>
                  <p className="text-base font-semibold text-slate-900">
                    {labelForVibe(
                      (draftProfile as any).vibeKey ||
                        vibeUnionToKey.get(draftProfile.vibe as string) ||
                        (draftProfile.vibe as string)
                    ) || 'Not set'}
                  </p>
                </div>
                <span className="text-slate-400">›</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSportsSheet(true)}
                className="flex w-full items-center justify-between px-4 py-4 text-left"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">My Favorites</p>
                  <p className="text-base font-semibold text-slate-900">
                    {draftProfile.sports.length ? draftProfile.sports.join(', ') : 'Not set'}
                  </p>
                </div>
                <span className="text-slate-400">›</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTryingSheet(true)}
                className="flex w-full items-center justify-between px-4 py-4 text-left"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">Want to Try</p>
                  <p className="text-base font-semibold text-slate-900">
                    {draftProfile.trying.length ? draftProfile.trying.join(', ') : 'Not set'}
                  </p>
                </div>
                <span className="text-slate-400">›</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">About Me</p>
            <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => openFieldSheet('bio', draftProfile.blurb || '')}
                className="flex w-full items-center justify-between px-4 py-4 text-left"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">Bio</p>
                  <p className="line-clamp-1 text-base font-semibold text-slate-900">
                    {draftProfile.blurb || 'Not set'}
                  </p>
                </div>
                <span className="text-slate-400">›</span>
              </button>
            </div>
          </div>
        </SheetLayout>
      </BottomSheet>
      <BottomSheet
        open={!!activeField}
        onClose={() => setActiveField(null)}
        showHandle={false}
        disableContainer
      >
        {(() => {
          const titleMap: Record<string, string> = {
            name: 'Name',
            username: 'Username',
            location: 'Current City',
            vibe: 'Workout Vibe',
            bio: 'Bio',
            gender: 'Gender',
          }
          const subtitleMap: Record<string, string> = {
            name: 'Enter the name shown on your card.',
            username: 'Your handle that others can use to find you.',
            location: 'Enter the city where you currently live.',
            vibe: 'Choose the activity vibe that best matches your current rhythm.',
            bio: 'Share your activity updates and goals.',
            gender: 'Select your biological sex for gender-specific events.',
          }
          const fieldKey = activeField ?? ''
          return (
            <SheetLayout
              onClose={() => setActiveField(null)}
              title={titleMap[fieldKey] || ''}
              subtitle={subtitleMap[fieldKey] || ''}
              height={fieldKey === 'vibe' ? 'tall' : 'medium'}
              className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
              contentClassName="flex-1 overflow-y-auto px-5 py-4 space-y-3"
              primaryButton={{
                label: 'Save',
                onClick: handleSaveField,
                disabled: isSavingProfile,
              }}
              showHandle={false}
            >
              {activeField === 'vibe' ? (
                <div className="flex flex-col gap-3">
                  {vibesCatalog.map((v) => {
                    const active =
                      v.key === fieldValue ||
                      vibeUnionToKey.get(fieldValue) === v.key ||
                      vibeUnionToKey.get(fieldValue)?.toLowerCase?.() === v.key.toLowerCase()

                    // Try to map dictionary key to Vibe enum key to get colors
                    // Dictionary keys might be upper case like 'GROWTH', tokens are 'Growth'
                    // We need a reliable mapping or try to match case-insensitively
                    const tokenKey = Object.keys(vibeTokens).find(
                      (k) => k.toUpperCase() === v.key.toUpperCase()
                    ) as Vibe | undefined
                    const tokens = tokenKey ? vibeTokens[tokenKey] : undefined

                    return (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => setFieldValue(v.key)}
                        className={clsx(
                          'flex flex-col items-start rounded-2xl border px-4 py-4 text-left shadow-sm transition',
                          !active && 'border-slate-200 bg-white text-slate-900'
                        )}
                        style={
                          active && tokens
                            ? {
                                background: tokens.bg,
                                color: tokens.text,
                                borderColor: 'transparent',
                              }
                            : active
                              ? {
                                  // Fallback if no token found
                                  borderColor: '#3B82F6',
                                  backgroundColor: '#EFF6FF',
                                  color: '#1E40AF',
                                }
                              : undefined
                        }
                      >
                        <p className="text-lg font-bold">{v.label}</p>
                        {v.subtitle && <p className="mt-1 text-sm opacity-80">{v.subtitle}</p>}
                      </button>
                    )
                  })}
                </div>
              ) : activeField === 'location' ? (
                <select
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Please select a city</option>
                  {citiesCatalog.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              ) : activeField === 'bio' ? (
                <div className="space-y-2">
                  <textarea
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    maxLength={120}
                    rows={10}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Share a short line about yourself."
                  />
                  <div className="text-right text-sm text-slate-500">
                    {120 - (fieldValue?.length || 0)} characters remaining
                  </div>
                </div>
              ) : activeField === 'gender' ? (
                <div className="flex flex-col gap-3">
                  {[
                    { key: 'male', label: 'Male' },
                    { key: 'female', label: 'Female' },
                  ].map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => setFieldValue(g.key)}
                      className={clsx(
                        'flex items-center justify-between rounded-2xl border px-4 py-4 text-left font-semibold shadow-sm transition',
                        fieldValue === g.key
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-800'
                      )}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="w-full">
                  <input
                    type="text"
                    value={fieldValue}
                    onChange={(e) => {
                      setFieldValue(e.target.value)
                      setFieldError(null)
                    }}
                    className={clsx(
                      'w-full rounded-xl border px-4 py-3 text-base text-slate-900 shadow-sm focus:outline-none',
                      fieldError
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:border-blue-500'
                    )}
                    placeholder="Please enter"
                  />
                  {fieldError && <p className="mt-2 text-sm text-red-500">{fieldError}</p>}
                </div>
              )}
            </SheetLayout>
          )
        })()}
      </BottomSheet>
      <BottomSheet
        open={showSportsSheet}
        onClose={() => setShowSportsSheet(false)}
        showHandle={false}
        disableContainer
      >
        <SheetLayout
          onClose={() => setShowSportsSheet(false)}
          title="Choose Favorite Sports"
          subtitle="Sports you enjoy and feel confident playing."
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          primaryButton={{
            label: 'Save',
            onClick: saveSports,
            disabled: isSavingProfile,
          }}
          showHandle={false}
        >
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              Selected {draftProfile.sports.length}/3
            </p>
            <div className="flex flex-wrap gap-2">
              {draftProfile.sports.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-800"
                >
                  {s}
                  <button
                    type="button"
                    aria-label="Remove"
                    className="text-slate-400"
                    onClick={() =>
                      setDraftProfile((prev) => ({
                        ...prev,
                        sports: prev.sports.filter((x) => x !== s),
                      }))
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <input
            value={sportsSearch}
            onChange={(e) => setSportsSearch(e.target.value)}
            placeholder="Search sports"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none"
          />

          <div className="space-y-2">
            {sportsCatalog
              .filter((sport) => sport.label.toLowerCase().includes(sportsSearch.toLowerCase()))
              .map((sport) => {
                const selected = draftProfile.sports.includes(sport.label)
                const disabled = !selected && draftProfile.sports.length >= 3
                return (
                  <label
                    key={sport.key}
                    className={clsx(
                      'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-base font-semibold shadow-sm transition',
                      selected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-800',
                      disabled && !selected && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {sport.icon && <span className="text-xl">{sport.icon}</span>}
                      <span>{sport.label}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={disabled}
                      onChange={() => {
                        setDraftProfile((prev) => {
                          const next = selected
                            ? prev.sports.filter((s) => s !== sport.label)
                            : [...prev.sports, sport.label]
                          return { ...prev, sports: next }
                        })
                      }}
                      className="h-5 w-5 accent-blue-600"
                    />
                  </label>
                )
              })}
          </div>
        </SheetLayout>
      </BottomSheet>
      <BottomSheet
        open={showTryingSheet}
        onClose={() => setShowTryingSheet(false)}
        showHandle={false}
        disableContainer
      >
        <SheetLayout
          onClose={() => setShowTryingSheet(false)}
          title="Sports to Try"
          subtitle="Pick new challenges you are interested in (up to 2)"
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          primaryButton={{
            label: 'Save',
            onClick: saveSports,
            disabled: isSavingProfile,
          }}
          showHandle={false}
        >
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              Selected {draftProfile.trying.length}/2
            </p>
            <div className="flex flex-wrap gap-2">
              {draftProfile.trying.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-800"
                >
                  {s}
                  <button
                    type="button"
                    aria-label="Remove"
                    className="text-slate-400"
                    onClick={() =>
                      setDraftProfile((prev) => ({
                        ...prev,
                        trying: prev.trying.filter((x) => x !== s),
                      }))
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <input
            value={tryingSearch}
            onChange={(e) => setTryingSearch(e.target.value)}
            placeholder="Search sports"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none"
          />

          <div className="space-y-2">
            {sportsCatalog
              .filter((sport) => sport.label.toLowerCase().includes(tryingSearch.toLowerCase()))
              .map((sport) => {
                const selected = draftProfile.trying.includes(sport.label)
                const disabled = !selected && draftProfile.trying.length >= 2
                return (
                  <label
                    key={sport.key}
                    className={clsx(
                      'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-base font-semibold shadow-sm transition',
                      selected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-800',
                      disabled && !selected && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {sport.icon && <span className="text-xl">{sport.icon}</span>}
                      <span>{sport.label}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={disabled}
                      onChange={() => {
                        setDraftProfile((prev) => {
                          const next = selected
                            ? prev.trying.filter((s) => s !== sport.label)
                            : [...prev.trying, sport.label]
                          return { ...prev, trying: next }
                        })
                      }}
                      className="h-5 w-5 accent-blue-600"
                    />
                  </label>
                )
              })}
          </div>
        </SheetLayout>
      </BottomSheet>
      <BottomSheet
        open={showGoalSheet}
        onClose={() => setShowGoalSheet(false)}
        showHandle={false}
        sheetClassName="rounded-t-[32px] border border-white/50 bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
        contentClassName="px-5 pb-8 pt-8 text-slate-900"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Set your weekly rhythm</p>
              <p className="text-xl font-bold text-slate-900">We will recommend mates and events based on this</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              className="rounded-full px-3 py-1 text-sm font-semibold text-slate-500"
              onClick={() => setShowGoalSheet(false)}
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Weekly target sessions</label>
            <input
              type="number"
              min={1}
              max={14}
              value={draftGoal.sessionsPerWeek}
              onChange={(e) =>
                setDraftGoal((prev) => ({
                  ...prev,
                  sessionsPerWeek: e.target.value || '1',
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">What time do you usually prefer to work out?</p>
            <div className="flex flex-wrap gap-2">
              {['Morning', 'Afternoon', 'Evening'].map((slot) => {
                const active = draftPreferredTime === slot
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setDraftPreferredTime(slot)
                      setDraftDaySlots((prev) => {
                        const next: Record<string, string[]> = {}
                        Object.keys(prev).forEach((day) => {
                          next[day] = [slot]
                        })
                        return next
                      })
                    }}
                    className={clsx(
                      'rounded-full border px-4 py-2 text-sm font-semibold',
                      active
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700'
                    )}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>

            <details className="space-y-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                Fine-tune by day (optional)
              </summary>
              <div className="space-y-3 pt-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                  (day) => (
                    <div key={day} className="space-y-2">
                      <p className="text-base font-semibold text-slate-800">
                        {dayLabels[day] ?? day}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Morning', 'Afternoon', 'Evening'].map((slot) => {
                          const active = draftDaySlots[day]?.includes(slot)
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() =>
                                setDraftDaySlots((prev) => {
                                  const next = {
                                    ...prev,
                                    [day]: [...(prev[day] ?? [])],
                                  }
                                  if (next[day].includes(slot)) {
                                    next[day] = next[day].filter((s) => s !== slot)
                                  } else {
                                    next[day].push(slot)
                                  }
                                  return next
                                })
                              }
                              className={clsx(
                                'min-w-[96px] rounded-full border px-4 py-2 text-sm font-semibold',
                                active
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-slate-200 bg-white text-slate-700'
                              )}
                            >
                              {slot}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                )}
              </div>
            </details>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            We will help you find events and mates that match your rhythm.
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowGoalSheet(false)}
              className="w-1/2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveGoal}
              disabled={isSavingGoal}
              className="w-1/2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSavingGoal ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Profile Completion Bottom Sheet */}
      <ProfileCompletionSheet
        open={showCompletionSheet}
        onClose={() => setShowCompletionSheet(false)}
      />
    </div>
  )
}
