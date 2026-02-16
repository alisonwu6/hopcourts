import clsx from 'clsx'
import { MySessions } from '@/features/events/components/MySessions'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { Menu, PlusSquare, Lock, Copy, MessageCircle, Bell } from 'lucide-react'
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
import { createDaySlots, dayLabels } from '@/features/profile/constants'
import type { GoalState } from '@/features/profile/types'
import type { ApiResponse } from '@/api/types'
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

  useEffect(() => {
    notificationsService
      .listNotifications({ limit: 1 })
      .then((res) => {
        if (res.ok) {
          setUnreadCount(res.data.unread_count)
        }
      })
      .catch(console.error)
  }, [])

  const [showGoalSheet, setShowGoalSheet] = useState(false)
  const [showShareSheet, setShowShareSheet] = useState(false)
  const [goal, setGoal] = useState<GoalState | null>(null)
  const [draftGoal, setDraftGoal] = useState<GoalState>({
    sessionsPerWeek: '',
    timeOfDay: '早上',
    days: [],
  })
  const [goalDaySlots, setGoalDaySlots] = useState<Record<string, string[]>>(createDaySlots())
  const [draftDaySlots, setDraftDaySlots] = useState<Record<string, string[]>>(createDaySlots())
  const [draftPreferredTime, setDraftPreferredTime] = useState('早上')
  const [showAvatarCropper, setShowAvatarCropper] = useState(false)
  const { user, isAuthenticated, isLoading, profileCache, setProfileCache } = useAuthStore()
  const userAvatar = (user as any)?.avatar || (user as any)?.avatar_url || (user as any)?.avatarUrl
  const userId = (user as any)?.id
  const [vm, setVm] = useState<ProfileVM | null>(
    profileCache
      ? {
          username: (() => {
            const candidate = (profileCache as any)?.username || (user as any)?.username || ''
            return isUuid(candidate) ? '' : candidate
          })(),
          usernameUpdatedCount: (profileCache as any)?.username_updated_count || 0,
          card: profileCache,
          favoriteSportKeys: [],
          tryingSportKeys: [],
        }
      : null
  )
  const [draftProfile, setDraftProfile] = useState<MateCardProps>(profileCache ?? emptyProfile)
  const [draftUsername, setDraftUsername] = useState<string>(
    (profileCache as any)?.username ||
      (user as any)?.username ||
      (profileCache as any)?.display_name ||
      ''
  )
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
  const { items: sportsCatalog, isLoading: isSportsLoading } = useSports('zh')
  const { items: vibesCatalog, isLoading: isVibesLoading } = useVibes('zh')
  const { items: citiesCatalog, isLoading: isCitiesLoading } = useCities(undefined, 'zh')
  const fetchMyEvents = useEventsStore((state) => state.fetchMyEvents)
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

  // 1. Fetch Data Only (Stable dependencies)
  const fetchProfileData = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      // 1. Fetch Profile
      let payload: any = null
      try {
        const profileRes = await profileService.getProfile()
        payload = (profileRes as any)?.data ?? profileRes
      } catch (err: any) {
        console.warn('Profile load failed (expected for new users):', err)
        const status = err?.status || err?.response?.status
        if (status === 404) {
          setShowEditSheet(true)
        }
        setVm(null)
        setRawProfile(null) // Clear raw

        const prefill: MateCardProps = {
          ...emptyProfile,
          name: (user as any)?.name || '',
          avatar: userAvatar || '',
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

      // 4. Fetch Rest
      const [preferencesRes] = await Promise.allSettled([
        profileService.getPreferences(),
        fetchMyEvents(),
      ])

      if (preferencesRes.status === 'fulfilled') {
        const preferencesPayload: any =
          (preferencesRes.value as any)?.data ?? preferencesRes.value ?? {}
        const sessionsPerWeek = preferencesPayload.sessions_per_week
        const preferredTime = preferencesPayload.preferred_time
        const daySlots = preferencesPayload.day_slots || {}
        setGoal({
          sessionsPerWeek: sessionsPerWeek ? String(sessionsPerWeek) : '',
          timeOfDay: preferredTime || '早上',
          days: [],
        })
        const mergedSlots: Record<string, string[]> = { ...createDaySlots(), ...daySlots }
        setGoalDaySlots(mergedSlots)
        setDraftDaySlots(mergedSlots)
        if (preferredTime) setDraftPreferredTime(preferredTime)
      }
    } catch (err) {
      console.error('Core profile load failed', err)
      setVm(null)
      const prefill: MateCardProps = {
        ...emptyProfile,
        name: (user as any)?.name || '',
        avatar: userAvatar || '',
      }
      setDraftProfile(prefill)
    } finally {
      setIsProfileLoaded(true)
    }
  }, [isAuthenticated, fetchMyEvents])

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
    setProfileCache(mapped)
  }, [rawProfile, labelForSport, vibeKeyToUnion, user, userAvatar, setProfileCache])

  useEffect(() => {
    fetchProfileData()
  }, [])

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
      timeOfDay: draftPreferredTime || '早上',
      days: [],
    }
    setDraftGoal(baseGoal)
    setDraftDaySlots(goalDaySlots)
    setDraftPreferredTime(baseGoal.timeOfDay || '早上')
    setShowGoalSheet(true)
  }

  const handleSaveGoal = async () => {
    if (isSavingGoal) return
    setIsSavingGoal(true)
    try {
      const sessions = draftGoal.sessionsPerWeek
        ? Number(draftGoal.sessionsPerWeek)
        : draftGoal.sessionsPerWeek
      await profileService.savePreferences({
        sessions_per_week: sessions || null,
        preferred_time: draftPreferredTime || null,
        day_slots: draftDaySlots,
      })

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
      title: 'SportsMatch 運動卡',
      text: `看看 ${draftProfile.name} 的運動檔案`,
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
    const text = `看看 ${draftProfile.name} 的運動檔案\n${url}`
    window.location.href = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`
    setShowShareSheet(false)
  }

  const handleCopyLink = async () => {
    const shareUsername = username || draftUsername
    const url = `${window.location.origin}/mate/${shareUsername}`
    const text = `看看 ${draftProfile.name} 的運動檔案\n${url}`

    try {
      await navigator.clipboard.writeText(text)
      setAlertDialog({
        open: true,
        title: '已複製',
        description: '連結與文字已複製到剪貼簿',
        type: 'success',
      })
    } catch (err) {
      window.prompt('請複製連結', text)
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
    setActiveField(field)
    setFieldValue(nextValue)
  }

  const handleSaveField = async () => {
    if (!activeField) return
    const value = fieldValue.trim()
    const next = { ...draftProfile }
    const payload: Record<string, any> = {
      avatar_url: next.avatar,
    }

    switch (activeField) {
      case 'name':
        next.name = value
        payload.display_name = value
        break
      case 'username':
        if (!value) {
          setFieldError('請輸入使用者名稱')
          return
        }
        if (!/^[a-zA-Z0-9_.]+$/.test(value)) {
          setFieldError('帳號只能包含英文、數字、底線與句號')
          return
        }
        if (value.length < 3 || value.length > 10) {
          setFieldError('帳號長度需介於 3 至 10 個字')
          return
        }
        setDraftUsername(value)
        payload.username = value
        break
      case 'location':
        next.location = labelForCity(value) || value
        next.cityKey = value
        payload.city_key = value
        break
      case 'vibe':
        next.vibe = vibeKeyToUnion.get(value) || (value as MateCardProps['vibe'])
        next.vibeKey = value
        payload.vibe_key = value
        break
      case 'bio':
        next.blurb = value
        payload.bio = value
        break
      case 'gender':
        next.gender = value
        payload.gender = value
        break
      default:
        break
    }
    setDraftProfile(next)

    // Only patch immediately if profile exists.
    // New users (vm=null) will save all at once via handleSaveProfile.
    // For new users (vm=null), we still want to save fields immediately to DB.
    // But we perform client-side username validation first if applicable.
    if (!vm) {
      if (activeField === 'username' && fieldValue) {
        try {
          // Check availability (returns 200 if taken, 404 if available)
          await profileService.getProfileByUsername(fieldValue)
          setFieldError('使用者名稱已存在，請選擇其他名稱')
          return // Keep sheet open
        } catch (err: any) {
          const status = err?.status || err?.response?.status
          if (status !== 404) {
            console.error('Failed to validate username', err)
          }
        }
      }
      // Proceed to save API call below...
    }

    let shouldCloseFieldSheet = false
    try {
      const res = await profileService.saveProfile(payload)
      const data = (res as any)?.data ?? res
      setRawProfile((prev: any) => ({ ...prev, ...data }))

      // Update AuthStore immediately without full hydrate (GET)
      const { user: authUser, token, setAuthData } = useAuthStore.getState()
      if (authUser && token) {
        const savedUser = data.user || data
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
      shouldCloseFieldSheet = true
    } catch (err: any) {
      const status = err?.status || err?.response?.status
      if (status === 409) {
        setFieldError('使用者名稱已存在，請選擇其他名稱')
      } else {
        setFieldError('儲存失敗，請稍後再試')
        console.error('Failed to patch profile field', err)
      }
    } finally {
      if (shouldCloseFieldSheet) {
        setActiveField(null)
      }
    }
  }

  const saveSports = async () => {
    setIsSavingProfile(true)
    try {
      const favSports = (draftProfile.sports || []).filter(Boolean)
      const trySports = (draftProfile.trying || []).filter(Boolean)

      const favoriteKeys = Array.from(new Set(favSports.map((label) => keyForLabel(label))))
      const tryingKeys = Array.from(new Set(trySports.map((label) => keyForLabel(label))))
      const res = await profileService.saveProfile({
        favorite_sports: favoriteKeys,
        trying_sports: tryingKeys,
      })
      const data = (res as any)?.data ?? res
      setRawProfile((prev: any) => ({ ...prev, ...data }))

      // Update AuthStore immediately without full hydrate (GET)
      const { user: authUser, token, setAuthData } = useAuthStore.getState()
      if (authUser && token) {
        const savedUser = data.user || data
        setAuthData(
          {
            ...authUser,
            onboarding_completed_at:
              savedUser.onboarding_completed_at || authUser.onboarding_completed_at,
          },
          token
        )
      }
      setShowSportsSheet(false)
      setShowTryingSheet(false)
    } catch (err) {
      console.error('Failed to save sports', err)
    } finally {
      setIsSavingProfile(false)
    }
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

      // If updating existing (vm exists) AND onboarding is complete, just close.
      // Auto-save handles fields.
      if ((user as any)?.onboarding_completed_at) {
        setShowEditSheet(false)
        setIsSavingProfile(false)
        return
      }

      // If creating new profile (vm null) or incomplete onboarding, send creation payload.
      let payload: any = {}

      if (!(user as any)?.onboarding_completed_at) {
        // For first-time users, we still send the full creation payload
        payload = {
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
      setProfileCache(updated)

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
      setRawProfile((prev: any) => ({ ...prev, ...responseData }))
    } catch (err: any) {
      // keep sheet open for retry
      console.error('Failed to save profile', err)
      const status = err?.status || err?.response?.status
      const errorData = err?.response?.data?.error || {}
      const constraint = errorData.details?.constraint || ''

      if (status === 409) {
        if (constraint.includes('username')) {
          alert('使用者名稱已存在，請選擇其他名稱')
        } else {
          alert('儲存失敗：資料衝突，請檢查輸入內容')
        }
      } else {
        alert('儲存失敗，請稍後再試')
      }
    } finally {
      setIsSavingProfile(false)
    }
  }

  const isCriticalDataLoading = isSportsLoading || isVibesLoading || isCitiesLoading

  if (isLoading || !isProfileLoaded || isCriticalDataLoading) {
    return <PageLoading />
  }
  if (!isAuthenticated) return null

  const pageContent = (
    <div className="min-h-screen overflow-y-auto pb-[120px]">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative flex items-center justify-between bg-white px-4 py-4">
          <div className="flex items-center">
            <Link
              to="/settings"
              aria-label="Menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
            >
              <Menu className="h-6 w-6" />
            </Link>
          </div>

          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
            {username && (
              <>
                <Lock className="h-4 w-4 text-slate-700" aria-hidden="true" />
                <span className="text-xl font-bold text-slate-900">{username}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
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
          actionLabel="編輯運動卡"
          actionClassName=""
          onTeammatesClick={() => navigate('/circle')}
        />
        <div className="mt-4 space-y-4 px-3">
          <MySessions />
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

          // 3. Update cache
          const base = (resolvedProfile ?? draftProfile) as MateCardProps
          setProfileCache({ ...base, avatar: url })

          // 4. Persist to Backend in background
          profileService
            .saveProfile({ avatar_url: url })
            .then((res) => {
              // Update rawProfile to match, so useEffect doesn't revert it
              const data = (res as any)?.data ?? res
              // Force keep our URL with params, even if backend returns clean URL
              if (data && data.user) {
                data.user.avatar_url = url
              } else if (data) {
                data.avatar_url = url
              }
              setRawProfile((prev: any) => ({ ...prev, ...data }))
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
          <h3 className="mb-6 text-center text-lg font-bold text-slate-900">分享運動卡</h3>
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
              <span className="text-sm font-medium text-slate-700">複製連結</span>
            </button>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet
        open={showEditSheet}
        onClose={() => {
          setShowEditSheet(false)
          fetchProfileData()
        }}
        showHandle={false}
        disableContainer
      >
        <SheetLayout
          onClose={() => {
            setShowEditSheet(false)
            fetchProfileData()
          }}
          title="我的運動卡"
          subtitle="保持最新運動狀態"
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 min-h-0 overflow-y-auto px-5 pb-24 pt-4 space-y-4"
          primaryButton={{
            label: '完成',
            onClick: handleSaveProfile,
            disabled: isSavingProfile,
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
                編輯
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">基本資料</p>
            <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {[
                { key: 'name', label: '名稱', value: draftProfile.name },
                {
                  key: 'username',
                  label: '使用者名稱',
                  value: draftUsername ?? '',
                },
                {
                  key: 'location',
                  label: '現居地點',
                  value: labelForCity(draftProfile.cityKey) || draftProfile.location,
                  valueKey: draftProfile.cityKey || '',
                },
                {
                  key: 'gender',
                  label: '性別',
                  value:
                    draftProfile.gender === 'male'
                      ? '男生'
                      : draftProfile.gender === 'female'
                        ? '女生'
                        : '未設定',
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
                        {row.value || '未設定'}
                      </p>
                    </div>
                    {!isReadOnly && <span className="text-slate-400">›</span>}
                  </Component>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">運動</p>
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
                  <p className="text-sm font-semibold text-slate-700">運動氛圍</p>
                  <p className="text-base font-semibold text-slate-900">
                    {labelForVibe(
                      (draftProfile as any).vibeKey ||
                        vibeUnionToKey.get(draftProfile.vibe as string) ||
                        (draftProfile.vibe as string)
                    ) || '未設定'}
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
                  <p className="text-sm font-semibold text-slate-700">我的最愛</p>
                  <p className="text-base font-semibold text-slate-900">
                    {draftProfile.sports.length ? draftProfile.sports.join('、') : '未設定'}
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
                  <p className="text-sm font-semibold text-slate-700">想嘗試</p>
                  <p className="text-base font-semibold text-slate-900">
                    {draftProfile.trying.length ? draftProfile.trying.join('、') : '未設定'}
                  </p>
                </div>
                <span className="text-slate-400">›</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">關於我</p>
            <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => openFieldSheet('bio', draftProfile.blurb || '')}
                className="flex w-full items-center justify-between px-4 py-4 text-left"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">自我介紹</p>
                  <p className="line-clamp-1 text-base font-semibold text-slate-900">
                    {draftProfile.blurb || '未設定'}
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
            name: '名稱',
            username: '使用者名稱',
            location: '現居城市',
            vibe: '運動氛圍',
            bio: '自我介紹',
            gender: '性別',
          }
          const subtitleMap: Record<string, string> = {
            name: '請輸入卡片上要顯示的名稱。',
            username: '你的帳號，夥伴可以用這個找到你。',
            location: '填寫你目前所在的城市。',
            vibe: '選擇最貼近你現況的運動狀態，並保持你的節奏。',
            bio: '和大家分享你的運動的動態與目標吧！',
            gender: '因應性別專場，請選擇你的生理性別。',
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
                label: '儲存',
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
                  <option value="">請選擇城市</option>
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
                    placeholder="和大家分享你想說的一句話。"
                  />
                  <div className="text-right text-sm text-slate-500">
                    還可以輸入 {120 - (fieldValue?.length || 0)} 個字
                  </div>
                </div>
              ) : activeField === 'gender' ? (
                <div className="flex flex-col gap-3">
                  {[
                    { key: 'male', label: '男生' },
                    { key: 'female', label: '女生' },
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
                    placeholder="請輸入"
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
          title="選擇最愛運動"
          subtitle="那些你能自在接受挑戰，且熱在其中的運動。"
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          primaryButton={{
            label: '儲存',
            onClick: saveSports,
            disabled: isSavingProfile,
          }}
          showHandle={false}
        >
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              已選 {draftProfile.sports.length}/3
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
                    aria-label="移除"
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
            placeholder="搜尋運動"
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
          title="想嘗試的運動"
          subtitle="挑你感興趣的新挑戰（最多選 2 項）"
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          primaryButton={{
            label: '儲存',
            onClick: saveSports,
            disabled: isSavingProfile,
          }}
          showHandle={false}
        >
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              已選 {draftProfile.trying.length}/2
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
                    aria-label="移除"
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
            placeholder="搜尋運動"
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
              <p className="text-sm font-semibold text-slate-500">設定你的每週節奏</p>
              <p className="text-xl font-bold text-slate-900">我們會依此幫你推薦夥伴與活動</p>
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
            <label className="text-sm font-semibold text-slate-700">每週目標次數</label>
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
            <p className="text-sm font-semibold text-slate-700">通常想在什麼時段運動？</p>
            <div className="flex flex-wrap gap-2">
              {['早上', '下午', '晚上'].map((slot) => {
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
                按天微調（可選）
              </summary>
              <div className="space-y-3 pt-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                  (day) => (
                    <div key={day} className="space-y-2">
                      <p className="text-base font-semibold text-slate-800">
                        {dayLabels[day] ?? day}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['早上', '下午', '晚上'].map((slot) => {
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
            我們會幫你找到符合節奏的活動與夥伴。
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowGoalSheet(false)}
              className="w-1/2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveGoal}
              disabled={isSavingGoal}
              className="w-1/2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSavingGoal ? '儲存中...' : '儲存'}
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
