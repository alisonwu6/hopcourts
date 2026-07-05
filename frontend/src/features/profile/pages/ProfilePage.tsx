import clsx from 'clsx'
import logo from '@/assets/main-logo.png'
import { Menu, Copy, MessageCircle, Bell, Building2, ChevronRight, ChevronDown, Bookmark, Smile, X, List, CalendarDays } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { type MateCardProps } from '@/features/mates/components/MateCard'
import { BottomSheet } from '@/components/BottomSheet'
import { SheetLayout } from '@/components/SheetLayout'
import { AlertDialog } from '@/components'
import { useAuthStore } from '@/hooks'
import { useProfileStore, type ProfileVM } from '@/stores/profile.store'
import { profileService } from '@/features/profile/services/profileService'
import { useProfileQuery } from '@/features/profile/hooks/useProfileQuery'
import { useNotificationsUnreadQuery } from '@/features/notifications/hooks/useNotificationsUnreadQuery'
import { useCountries, useCities, useSports, useVibeUtils } from '@/features/dictionaries/hooks'
import { HeroCard } from '@/features/profile/components/HeroCard'
import { HeroCardSkeleton } from '@/features/profile/components/HeroCardSkeleton'
import { AvatarCropSheet } from '@/features/profile/components/AvatarCropSheet'
import { GuestProfileView } from '@/features/profile/components/GuestProfileView'
import { supabase } from '@/lib/supabase'
import { ProfileRequiredSheet } from '@/features/profile/components/ProfileRequiredSheet'
import { ProfileCompletionSheet } from '@/features/profile/components/ProfileCompletionSheet'
import { ProfileEventsPanel } from '@/features/profile/components/ProfileEventsPanel'
import { createDaySlots, dayLabels } from '@/features/profile/constants'
import type { GoalState } from '@/features/profile/types'
import { PageLoading } from '@/components/PageLoading'
import { vibeTokens, type Vibe } from '@/constants/vibeTokens'
import { getFlagEmoji } from '@/utils/flags'

type ProfileRequiredField = 'name' | 'username' | 'vibe' | 'gender' | 'sports' | 'trying' | 'bio'

const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

const FIRST_MARKET_COUNTRY_KEY = 'AU'
const FIRST_MARKET_COUNTRY_LABEL = 'Australia'
const FIRST_MARKET_CITY_KEY = 'BRISBANE'
const FIRST_MARKET_CITY_LABEL = 'Brisbane'

const emptyProfile: MateCardProps = {
  name: '',
  location: FIRST_MARKET_CITY_LABEL,
  cityKey: FIRST_MARKET_CITY_KEY,
  countryKey: '',
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
    type: 'success' | 'error' | 'info' | 'warning' | 'feature'
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
  const [vm, setVm] = useState<ProfileVM | null>(() => useProfileStore.getState().vm)
  const [draftProfile, setDraftProfile] = useState<MateCardProps>(emptyProfile)
  const [draftUsername, setDraftUsername] = useState<string>((user as any)?.username || '')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingGoal, setIsSavingGoal] = useState(false)
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false)
  const [isProfileLoaded, setIsProfileLoaded] = useState(() => {
    const s = useProfileStore.getState()
    return s.isLoaded && !!s.rawProfile && !!s.vm
  })
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showProfileRequiredSheet, setShowProfileRequiredSheet] = useState(false)
  const [showSportsSheet, setShowSportsSheet] = useState(false)
  const [showTryingSheet, setShowTryingSheet] = useState(false)
  const [showCompletionSheet, setShowCompletionSheet] = useState(false)
  const [activityViewMode, setActivityViewMode] = useState<'list' | 'calendar'>('list')

  const [fieldError, setFieldError] = useState<string | null>(null)
  const [activeField, setActiveField] = useState<
    null | 'name' | 'username' | 'location' | 'nationality' | 'vibe' | 'bio' | 'gender'
  >(null)
  const [fieldValue, setFieldValue] = useState('')
  const [locationSheetCountry, setLocationSheetCountry] = useState('')
  const [sportsSearch, setSportsSearch] = useState('')
  const [tryingSearch, setTryingSearch] = useState('')
  const [invalidProfileFields, setInvalidProfileFields] = useState<ProfileRequiredField[]>([])
  const { items: sportsCatalog } = useSports('en')
  const { vibesCatalog, vibeKeyToUnion, labelForVibe, vibeUnionToKey } = useVibeUtils('en')
  const { items: citiesCatalog } = useCities(undefined, 'en')
  const { items: countriesCatalog } = useCountries('en')
  const availableCountries = useMemo(
    () =>
      countriesCatalog.length
        ? countriesCatalog
        : [{ key: FIRST_MARKET_COUNTRY_KEY, label: FIRST_MARKET_COUNTRY_LABEL }],
    [countriesCatalog]
  )
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

  const labelForCity = useMemo(() => {
    const map = new Map(citiesCatalog.map((c) => [c.key, c.label]))
    return (key?: string) => (key ? map.get(key) || key : '')
  }, [citiesCatalog])

  const labelForCountry = useMemo(() => {
    const map = new Map(availableCountries.map((c) => [c.key, c.label]))
    return (key?: string | null) => (key ? map.get(key) || key : '')
  }, [availableCountries])

  const countryKeyForCity = useMemo(() => {
    const map = new Map(citiesCatalog.map((c) => [c.key, c.country_key]))
    return (cityKey?: string) => (cityKey ? map.get(cityKey) || '' : '')
  }, [citiesCatalog])

  const livingLocationText = useMemo(() => {
    const cityLabel = labelForCity(FIRST_MARKET_CITY_KEY) || draftProfile.location || FIRST_MARKET_CITY_LABEL
    const countryLabel = labelForCountry(FIRST_MARKET_COUNTRY_KEY) || FIRST_MARKET_COUNTRY_LABEL
    if (cityLabel && countryLabel) return `${cityLabel}, ${countryLabel}`
    return cityLabel || countryLabel || ''
  }, [draftProfile.location, labelForCity, labelForCountry])

  // Memo: derive resolvedProfile (display-ready, labels filled, union vibe)
  const resolvedProfile = useMemo<MateCardProps | null>(() => {
    if (!vm?.card) return null
    const favoriteLabels = (vm.favoriteSportKeys.length ? vm.favoriteSportKeys : vm.card.sports || []).map(
      labelForSport
    )
    const tryingLabels = (vm.tryingSportKeys.length ? vm.tryingSportKeys : vm.card.trying || []).map(labelForSport)
    const locationLabel = vm.card.cityKey ? labelForCity(vm.card.cityKey) || vm.card.location : vm.card.location
    let vibeUnion: MateCardProps['vibe'] = null
    if (vm.card.vibe) {
      vibeUnion = vm.card.vibe
    } else if (vm.card.vibeKey) {
      vibeUnion = vibeKeyToUnion(vm.card.vibeKey) as MateCardProps['vibe']
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
      vibeUnion = vibeKeyToUnion(draftVibeKey) as MateCardProps['vibe']
    }
    return {
      ...draftProfile,
      location: locationLabel,
      vibe: vibeUnion,
    }
  }, [draftProfile, labelForCity, vibeKeyToUnion])

  const usernameFromVm = vm?.username
  const usernameFromUser = (user as any)?.username
  const username = usernameFromVm || usernameFromUser || draftUsername || (resolvedProfile as any)?.username || ''
  const headerFlag = getFlagEmoji((resolvedProfile?.countryKey || draftProfile.countryKey || '').toString())

  const [rawProfile, setRawProfile] = useState<any>(() => useProfileStore.getState().rawProfile)
  const hasVenueAccess = (rawProfile?.user?.role ?? []).includes('venue')
  // 1. Fetch profile + unread count via React Query (automatic dedup & caching)
  const profileQuery = useProfileQuery(isAuthenticated)
  const notificationsQuery = useNotificationsUnreadQuery(isAuthenticated)

  // 1a. Side effects when profile data arrives or errors
  useEffect(() => {
    const authUser = useAuthStore.getState().user as any
    const fallbackAvatar = authUser?.avatar || authUser?.avatar_url || authUser?.avatarUrl || ''

    if (profileQuery.isError) {
      const err: any = profileQuery.error
      console.warn('Profile load failed (expected for new users):', err)
      const status = err?.status ?? err?.response?.status
      if (status === 404) setShowEditSheet(true)
      setVm(null)
      setRawProfile(null)
      setDraftProfile({ ...emptyProfile, name: authUser?.name || '', avatar: fallbackAvatar })
      setIsProfileLoaded(true)
      return
    }

    if (!profileQuery.data) return

    const payload: any = (profileQuery.data as any)?.data ?? profileQuery.data
    const data = payload.user || payload

    setRawProfile(payload)
    useProfileStore.getState().setRawProfile(payload)

    const completedAt = data.onboarding_completed_at
    const dismissed = localStorage.getItem('profile_setup_dismissed') === '1'
    setShowProfileRequiredSheet(!completedAt && !dismissed)

    // Sync to AuthStore
    const { user: currentAuthUser, token, setAuthData } = useAuthStore.getState()
    if (currentAuthUser && token) {
      const newName = data.display_name || currentAuthUser.name
      const newAvatar = data.avatar_url || currentAuthUser.avatar
      const newLocation = data.city_key || currentAuthUser.location
      const newGender = data.gender || currentAuthUser.gender
      const newBio = data.bio || currentAuthUser.bio
      const isChanged =
        currentAuthUser.name !== newName ||
        currentAuthUser.avatar !== newAvatar ||
        currentAuthUser.location !== newLocation ||
        currentAuthUser.gender !== newGender ||
        currentAuthUser.bio !== newBio ||
        currentAuthUser.onboarding_completed_at !== data.onboarding_completed_at
      if (isChanged) {
        setAuthData(
          {
            ...currentAuthUser,
            name: newName,
            avatar: newAvatar,
            location: newLocation,
            gender: newGender,
            bio: newBio,
            onboarding_completed_at: data.onboarding_completed_at || currentAuthUser.onboarding_completed_at,
          },
          token
        )
      }
    }

  }, [profileQuery.data, profileQuery.isError, profileQuery.error])

  // 1b. Sync unread count from query into store
  useEffect(() => {
    const unread = (notificationsQuery.data as any)?.data?.unread_count
    if (typeof unread === 'number') {
      setUnreadCount(unread)
      useProfileStore.getState().setUnreadCount(unread)
    }
  }, [notificationsQuery.data])

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
    const vibeUnion = vibeKey ? (vibeKeyToUnion(vibeKey) as MateCardProps['vibe']) : null

    const mapped: MateCardProps = {
      name: data.display_name || (isUuid(data.username) ? '' : data.username) || (user as any)?.name || '',
      location: FIRST_MARKET_CITY_LABEL,
      cityKey: FIRST_MARKET_CITY_KEY,
      countryKey: data.nationality_key || '',
      vibe: vibeUnion,
      vibeKey,
      vibeLabel: vibeKey ? labelForVibe(vibeKey) : undefined,
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

    const nextVm: ProfileVM = {
      username: nextUsername,
      usernameUpdatedCount: data.username_updated_count || 0,
      card: mapped,
      favoriteSportKeys: favoriteKeys || [],
      tryingSportKeys: tryingKeys || [],
    }
    setVm(nextVm)
    useProfileStore.getState().setVm(nextVm)

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
    setIsProfileLoaded(true)
  }, [rawProfile, labelForSport, vibeKeyToUnion, user, userAvatar])

  // Seed local state from store on mount if already loaded (avoids flicker on re-navigation)
  useEffect(() => {
    const stored = useProfileStore.getState()
    if (stored.isLoaded && stored.rawProfile) {
      setRawProfile(stored.rawProfile)
      setUnreadCount(stored.unreadCount)
      // isProfileLoaded is set in Effect 2 once vm/draftProfile are also ready
    }
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
  const prevOnboardedRef = useRef(!!(user as any)?.onboarding_completed_at)
  useEffect(() => {
    const isNowOnboarded = !!(user as any)?.onboarding_completed_at
    if (!prevOnboardedRef.current && isNowOnboarded) {
      localStorage.removeItem('profile_setup_dismissed')
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
    const text = `Check out ${draftProfile.name || shareUsername} on HopCourts`
    const shareData = {
      title: 'HopCourts',
      text,
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
    const text = `Check out ${draftProfile.name || shareUsername} on HopCourts\n${url}`
    window.location.href = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`
    setShowShareSheet(false)
  }

  const handleCopyLink = async () => {
    const shareUsername = username || draftUsername
    const url = `${window.location.origin}/mate/${shareUsername}`
    const text = `Check out ${draftProfile.name || shareUsername} on HopCourts\n${url}`

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

  const handleRemoveAvatar = async () => {
    if (!userId || !supabase || isRemovingAvatar) return
    setIsRemovingAvatar(true)
    try {
      // Storage delete is best-effort; file may not exist
      await supabase.storage.from('avatars').remove([`${userId}/avatar.webp`])
    } catch {
      // continue — DB clear is what matters
    }
    try {
      const res = await profileService.saveProfile({ avatar_url: null })
      // Only clear UI after the DB confirms the change
      setDraftProfile((prev) => ({ ...prev, avatar: '' }))
      setVm((prev) => (prev ? { ...prev, card: { ...prev.card, avatar: '' } } : prev))
      const { user: authUser, token, setAuthData: setAuth } = useAuthStore.getState()
      if (authUser && token) setAuth({ ...authUser, avatar: null, avatar_url: null, avatarUrl: null } as any, token)
      // Patch rawProfile so useEffect doesn't re-hydrate the old URL
      const data = (res as any)?.data ?? res
      if (data?.user) data.user.avatar_url = null
      else if (data) data.avatar_url = null
      setRawProfile(data)
    } catch (err) {
      console.error('Failed to clear avatar in DB', err)
    } finally {
      setIsRemovingAvatar(false)
    }
  }

  const hasProfileFieldError = (field: ProfileRequiredField) => invalidProfileFields.includes(field)

  const clearProfileFieldError = (field: ProfileRequiredField) => {
    setInvalidProfileFields((prev) => prev.filter((item) => item !== field))
  }

  useEffect(() => {
    if (!invalidProfileFields.length) return

    const currentVibeKey = (draftProfile as any).vibeKey || vibeUnionToKey(draftProfile.vibe as string) || undefined

    setInvalidProfileFields((prev) =>
      prev.filter((field) => {
        switch (field) {
          case 'name':
            return !draftProfile.name?.trim()
          case 'username':
            return !vm?.username && !draftUsername.trim()
          case 'vibe':
            return !currentVibeKey
          case 'gender':
            return !draftProfile.gender
          case 'sports':
            return !draftProfile.sports?.length
          case 'trying':
            return !draftProfile.trying?.length
          case 'bio':
            return !draftProfile.blurb?.trim()
          default:
            return false
        }
      })
    )
  }, [draftProfile, draftUsername, invalidProfileFields.length, vm?.username, vibeUnionToKey])

  const openFieldSheet = (field: typeof activeField, value: string, rawKey?: string) => {
    let nextValue = rawKey ?? value
    if (field === 'vibe') {
      const vibe = value as NonNullable<MateCardProps['vibe']>
      nextValue = rawKey || (vibe ? vibeUnionToKey(vibe) : undefined) || value
    }
    setFieldError(null)
    setActiveField(field)
    if (field === 'location') {
      setLocationSheetCountry(FIRST_MARKET_COUNTRY_KEY)
      setFieldValue(FIRST_MARKET_CITY_KEY)
    } else {
      setLocationSheetCountry('')
      setFieldValue(nextValue)
    }
  }

  const handleSaveField = async () => {
    if (!activeField) return
    const value = fieldValue.trim()
    const next = { ...draftProfile }

    switch (activeField) {
      case 'name':
        next.name = value
        clearProfileFieldError('name')
        break
      case 'username':
        if (!value) {
          setFieldError('Enter a username')
          return
        }
        if (!/^[a-zA-Z0-9_.]+$/.test(value)) {
          setFieldError('Username can only include letters, numbers, underscores, and periods')
          return
        }
        if (value.length < 3 || value.length > 20) {
          setFieldError('Username must be 3 to 20 characters')
          return
        }
        {
          const normalizedValue = value.toLowerCase()
          const currentUsername = ((vm?.username || (user as any)?.username || '') as string).trim()
          const isSameUsername = normalizedValue === currentUsername.toLowerCase()
          if (!isSameUsername) {
            setIsSavingProfile(true)
            try {
              // 200 => already exists, 404 => available
              await profileService.getProfileByUsername(normalizedValue)
              setFieldError('Username taken. Try another.')
              return
            } catch (err: any) {
              const status = err?.status || err?.response?.status
              if (status !== 404) {
                setFieldError("Couldn't verify username. Please try again.")
                return
              }
            } finally {
              setIsSavingProfile(false)
            }
          }
          setDraftUsername(normalizedValue)
        }
        clearProfileFieldError('username')
        break
      case 'location':
        next.location = labelForCity(value) || value
        next.cityKey = value
        break
      case 'vibe':
        next.vibe = (vibeKeyToUnion(value) ?? value) as MateCardProps['vibe']
        next.vibeKey = value
        clearProfileFieldError('vibe')
        break
      case 'nationality':
        next.countryKey = value
        break
      case 'bio':
        next.blurb = value
        clearProfileFieldError('bio')
        break
      case 'gender':
        next.gender = value
        clearProfileFieldError('gender')
        break
      default:
        break
    }
    setDraftProfile(next)
    setActiveField(null)
  }

  const saveSports = () => {
    // Sports selections are local draft only; final save happens on "Done".
    if (draftProfile.sports.length > 0) {
      clearProfileFieldError('sports')
    }
    if (draftProfile.trying.length > 0) {
      clearProfileFieldError('trying')
    }
    setShowSportsSheet(false)
    setShowTryingSheet(false)
  }

  const handleSaveProfile = async () => {
    if (isSavingProfile) return

    const currentVibeKey = (draftProfile as any).vibeKey || vibeUnionToKey(draftProfile.vibe as string) || undefined

    const missingFields: ProfileRequiredField[] = []
    if (!draftProfile.name?.trim()) missingFields.push('name')
    if (!vm?.username && !draftUsername.trim()) missingFields.push('username')
    if (!currentVibeKey) missingFields.push('vibe')
    if (!draftProfile.gender) missingFields.push('gender')
    if (!draftProfile.sports?.length) missingFields.push('sports')
    if (!draftProfile.trying?.length) missingFields.push('trying')
    if (!draftProfile.blurb?.trim()) missingFields.push('bio')

    if (missingFields.length > 0) {
      setInvalidProfileFields(missingFields)
      return
    }

    setInvalidProfileFields([])
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
        vibe_key: (draftProfile as any).vibeKey || vibeUnionToKey(draftProfile.vibe as string) || undefined,
        city_key: FIRST_MARKET_CITY_KEY,
        nationality_key: draftProfile.countryKey || null,
        gender: draftProfile.gender || undefined,
        age_range_key: draftProfile.ageRangeKey || undefined,
        favorite_sports: favoriteKeys,
        trying_sports: tryingKeys,
        avatar_url: draftProfile.avatar || undefined,
      }
      const normalizedUsername = draftUsername.trim().toLowerCase()
      if (normalizedUsername && !isUuid(normalizedUsername)) {
        payload.username = normalizedUsername
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
        username: normalizedUsername || vm?.username || '',
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
          onboarding_completed_at: savedUser.onboarding_completed_at || authUser.onboarding_completed_at,
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
        setAlertDialog({
          open: true,
          title: 'Save failed',
          description: constraint.includes('username')
            ? 'Username already taken. Please choose another.'
            : "Couldn't save. Check your details and try again.",
          type: 'error',
        })
      } else {
        setAlertDialog({
          open: true,
          title: 'Save failed',
          description: 'Something went wrong. Please try again.',
          type: 'error',
        })
      }
    } finally {
      setIsSavingProfile(false)
    }
  }

  if (isLoading) {
    return <PageLoading />
  }
  if (!isAuthenticated || (user as any)?.is_anonymous) {
    return <GuestProfileView />
  }
  const pageContent = (
    <div className="min-h-[100dvh] overflow-y-auto pb-[120px]">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative flex items-center justify-between bg-white px-2 py-4">
          <div className="flex items-center">
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
              to="/profile/saved-events"
              aria-label="Saved events"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-800 hover:bg-slate-50 active:bg-slate-100"
            >
              <Bookmark className="h-6 w-6" />
            </Link>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 w-[60%] -translate-x-1/2 -translate-y-1/2 px-2 text-center">
            {!isProfileLoaded ? (
              <div className="mx-auto h-5 w-28 animate-pulse rounded bg-slate-200" />
            ) : username ? (
              <span className="block truncate text-xl font-bold text-slate-900">{username}</span>
            ) : null}
          </div>

          <div className="flex items-center">
            <Link
              to="/settings"
              aria-label="Menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
            >
              <Menu className="h-6 w-6" />
            </Link>
          </div>
        </div>

        {!isProfileLoaded ? (
          <HeroCardSkeleton />
        ) : (
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
            onTeammatesClick={() =>
              setAlertDialog({
                open: true,
                title: 'Mates — Coming Soon',
                description: "See everyone you've played with, in one place.",
                type: 'feature',
              })
            }
          />
        )}
        {hasVenueAccess && (
          <div className="mt-2 px-3">
            <div
              onClick={() => navigate('/admin')}
              className="flex cursor-pointer items-center justify-between rounded-2xl border-2 border-slate-100 bg-white p-3.5 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-tight text-slate-900">Venue Portal</dt>
                  <dd className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    Manage courts & schedule
                  </dd>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </div>
          </div>
        )}

        <div className="mt-4 space-y-4 px-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-semibold text-slate-700">Recent Activity</h3>
            <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActivityViewMode('list')}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition ${activityViewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setActivityViewMode('calendar')}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition ${activityViewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                <CalendarDays className="h-4 w-4" />
              </button>
            </div>
          </div>
          <ProfileEventsPanel
            mode="all"
            showTimeTabs={false}
            viewMode={activityViewMode}
            onExplore={() => navigate('/events')}
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-[100dvh]">
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
      <BottomSheet
        open={showShareSheet}
        onClose={() => setShowShareSheet(false)}
      >
        <div className="px-4 pb-8 pt-4">
          <h3 className="mb-6 text-center text-lg font-bold text-slate-900">Share your activity card</h3>
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
          title="Profile"
          subtitle="Keep your profile up to date"
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
              <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-slate-200 shadow-lg ring-4 ring-white">
                {draftProfile.avatar || userAvatar ? (
                  <img
                    src={draftProfile.avatar || userAvatar || ''}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Smile className="h-14 w-14 text-slate-400" />
                )}
                {isRemovingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                    <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
                <button
                  type="button"
                  onClick={() => setShowAvatarCropper(true)}
                  disabled={isRemovingAvatar}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-400 shadow-md hover:text-slate-500 disabled:opacity-50"
                >
                  Edit
                </button>
                {(draftProfile.avatar || userAvatar) && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isRemovingAvatar}
                    className="flex items-center justify-center rounded-full bg-white p-2 text-slate-300 shadow-md hover:text-slate-500 disabled:opacity-50"
                    aria-label="Remove avatar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Basic Info</p>
            <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => openFieldSheet('name', draftProfile.name)}
                className={clsx(
                  'flex w-full items-center justify-between px-4 py-4 text-left',
                  hasProfileFieldError('name') && 'bg-red-50'
                )}
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Name
                    {hasProfileFieldError('name') && <span className="ml-1 text-red-500">*</span>}
                  </p>
                  <p className={`text-base font-semibold ${draftProfile.name ? 'text-slate-900' : 'text-slate-400'}`}>{draftProfile.name || 'Your name'}</p>
                </div>
                <span className="text-slate-400">›</span>
              </button>

              {vm?.username ? (
                <div
                  className={clsx(
                    'flex w-full items-center justify-between px-4 py-4 text-left',
                    hasProfileFieldError('username') ? 'bg-red-50' : 'bg-slate-100'
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-700">
                      Username
                      {hasProfileFieldError('username') && <span className="ml-1 text-red-500">*</span>}
                    </p>
                    <p className={`text-base font-semibold ${draftUsername ? 'text-slate-900' : 'text-slate-400'}`}>{draftUsername || 'Your username'}</p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openFieldSheet('username', draftUsername ?? '')}
                  className={clsx(
                    'flex w-full items-center justify-between px-4 py-4 text-left',
                    hasProfileFieldError('username') && 'bg-red-50'
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-700">
                      Username
                      {hasProfileFieldError('username') && <span className="ml-1 text-red-500">*</span>}
                    </p>
                    <p className={`text-base font-semibold ${draftUsername ? 'text-slate-900' : 'text-slate-400'}`}>{draftUsername || 'Your username'}</p>
                  </div>
                  <span className="text-slate-400">›</span>
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  openFieldSheet(
                    'nationality',
                    labelForCountry(draftProfile.countryKey) || '',
                    draftProfile.countryKey || ''
                  )
                }
                className="flex w-full items-center justify-between px-4 py-4 text-left"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">Nationality (Optional)</p>
                  <p className={`text-base font-semibold ${draftProfile.countryKey ? 'text-slate-900' : 'text-slate-400'}`}>
                    {labelForCountry(draftProfile.countryKey) || 'Your home country'}
                  </p>
                </div>
                <span className="text-slate-400">›</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  openFieldSheet(
                    'location',
                    labelForCity(FIRST_MARKET_CITY_KEY) || FIRST_MARKET_CITY_LABEL,
                    FIRST_MARKET_CITY_KEY
                  )
                }
                className="flex w-full items-center justify-between px-4 py-4 text-left"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">Current City</p>
                  <p className="text-base font-semibold text-slate-900">{livingLocationText}</p>
                </div>
                <span className="text-slate-400">›</span>
              </button>

              <button
                type="button"
                onClick={() => openFieldSheet('gender', draftProfile.gender || '', draftProfile.gender || '')}
                className={clsx(
                  'flex w-full items-center justify-between px-4 py-4 text-left',
                  hasProfileFieldError('gender') && 'bg-red-50'
                )}
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Gender
                    {hasProfileFieldError('gender') && <span className="ml-1 text-red-500">*</span>}
                  </p>
                  <p className={`text-base font-semibold ${draftProfile.gender ? 'text-slate-900' : 'text-slate-400'}`}>
                    {draftProfile.gender === 'male'
                      ? 'Male'
                      : draftProfile.gender === 'female'
                        ? 'Female'
                        : draftProfile.gender === 'non_binary'
                          ? 'Non-binary'
                          : draftProfile.gender === 'prefer_not_to_say'
                            ? 'Prefer not to say'
                            : 'Required'}
                  </p>
                </div>
                <span className="text-slate-400">›</span>
              </button>
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
                    (draftProfile as any).vibeKey || vibeUnionToKey(draftProfile.vibe as string) || ''
                  )
                }
                className={clsx(
                  'flex w-full items-center justify-between px-4 py-4 text-left',
                  hasProfileFieldError('vibe') && 'bg-red-50'
                )}
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Workout Vibe
                    {hasProfileFieldError('vibe') && <span className="ml-1 text-red-500">*</span>}
                  </p>
                  <p className={`text-base font-semibold ${(draftProfile as any).vibeKey || draftProfile.vibe ? 'text-slate-900' : 'text-slate-400'}`}>
                    {labelForVibe(
                      (draftProfile as any).vibeKey ||
                        vibeUnionToKey(draftProfile.vibe as string) ||
                        (draftProfile.vibe as string)
                    ) || 'Required'}
                  </p>
                </div>
                <span className="text-slate-400">›</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSportsSheet(true)}
                className={clsx(
                  'flex w-full items-center justify-between px-4 py-4 text-left',
                  hasProfileFieldError('sports') && 'bg-red-50'
                )}
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">
                    My Favourites
                    {hasProfileFieldError('sports') && <span className="ml-1 text-red-500">*</span>}
                  </p>
                  <p className={`text-base font-semibold ${draftProfile.sports.length ? 'text-slate-900' : 'text-slate-400'}`}>
                    {draftProfile.sports.length ? draftProfile.sports.join(', ') : 'Required'}
                  </p>
                </div>
                <span className="text-slate-400">›</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTryingSheet(true)}
                className={clsx(
                  'flex w-full items-center justify-between px-4 py-4 text-left',
                  hasProfileFieldError('trying') && 'bg-red-50'
                )}
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Want to Try
                    {hasProfileFieldError('trying') && <span className="ml-1 text-red-500">*</span>}
                  </p>
                  <p className={`text-base font-semibold ${draftProfile.trying.length ? 'text-slate-900' : 'text-slate-400'}`}>
                    {draftProfile.trying.length ? draftProfile.trying.join(', ') : 'Required'}
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
                className={clsx(
                  'flex w-full items-center justify-between px-4 py-4 text-left',
                  hasProfileFieldError('bio') && 'bg-red-50'
                )}
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Bio{hasProfileFieldError('bio') && <span className="ml-1 text-red-500">*</span>}
                  </p>
                  <p className={`line-clamp-1 text-base font-semibold ${draftProfile.blurb ? 'text-slate-900' : 'text-slate-400'}`}>
                    {draftProfile.blurb || 'Required'}
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
            nationality: 'Nationality',
            vibe: 'Workout Vibe',
            bio: 'Bio',
            gender: 'Gender',
          }
          const subtitleMap: Record<string, string> = {
            name: 'Enter your full name.',
            username: 'A unique handle for mates to find you.',
            location: 'Select your home city.',
            nationality: "Sport has no borders — show where you’re from.",
            vibe: 'Choose the activity vibe that fits you best.',
            bio: 'Share your activity updates and goals.',
            gender: "Some sessions are gender-specific — this helps us match you in.",
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
                      vibeUnionToKey(fieldValue) === v.key ||
                      vibeUnionToKey(fieldValue).toLowerCase() === v.key.toLowerCase()

                    // Try to map dictionary key to Vibe enum key to get colors
                    // Dictionary keys might be upper case like 'GROWTH', tokens are 'Growth'
                    // We need a reliable mapping or try to match case-insensitively
                    const tokenKey = Object.keys(vibeTokens).find((k) => k.toUpperCase() === v.key.toUpperCase()) as
                      | Vibe
                      | undefined
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
              ) : activeField === 'nationality' ? (
                <div className="relative">
                  <select
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 pr-16 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Please select a nationality</option>
                    {availableCountries.map((c) => (
                      <option
                        key={c.key}
                        value={c.key}
                      >
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                  {fieldValue && (
                    <button
                      type="button"
                      onClick={() => setFieldValue('')}
                      className="absolute inset-y-0 right-8 flex items-center px-1 text-slate-400 hover:text-slate-600"
                      aria-label="Clear"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : activeField === 'location' ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Country</label>
                    <div className="relative">
                      <select
                        value={locationSheetCountry}
                        onChange={(e) => {
                          const nextCountry = e.target.value
                          setLocationSheetCountry(nextCountry)
                          if (fieldValue && nextCountry !== FIRST_MARKET_COUNTRY_KEY) {
                            setFieldValue('')
                          }
                        }}
                        className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 pr-10 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value={FIRST_MARKET_COUNTRY_KEY}>{FIRST_MARKET_COUNTRY_LABEL}</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">City</label>
                    <div className="relative">
                      <select
                        value={fieldValue}
                        onChange={(e) => setFieldValue(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 pr-10 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value={FIRST_MARKET_CITY_KEY}>{FIRST_MARKET_CITY_LABEL}</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
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
                    { key: 'non_binary', label: 'Non-binary' },
                    { key: 'prefer_not_to_say', label: 'Prefer not to say' },
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
                      fieldError ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                    )}
                    placeholder="Type here"
                  />
                  {fieldError && <p className="mt-2 text-sm text-red-500">{fieldError}</p>}
                  {activeField === 'username' && (
                    <p className="mt-2 text-xs text-slate-500">
                      Usernames are saved in lowercase.
                      {fieldValue.trim() ? (
                        <>
                          {' '}
                          Will save as{' '}
                          <span className="font-semibold text-slate-700">{fieldValue.trim().toLowerCase()}</span>
                        </>
                      ) : null}
                    </p>
                  )}
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
          title="Favourite Sports"
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
            <p className="text-sm font-semibold text-slate-700">Selected {draftProfile.sports.length}/3</p>
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
          subtitle="Sports you'd like to try (up to 2)."
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
            <p className="text-sm font-semibold text-slate-700">Selected {draftProfile.trying.length}/2</p>
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
              <p className="text-xl font-bold text-slate-900">We'll recommend mates and events based on this.</p>
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
            <label className="text-sm font-semibold text-slate-700">Weekly target</label>
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
                      active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700'
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
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div
                    key={day}
                    className="space-y-2"
                  >
                    <p className="text-base font-semibold text-slate-800">{dayLabels[day] ?? day}</p>
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
                ))}
              </div>
            </details>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            We'll help you find events and mates that match your rhythm.
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
        onExplore={() => {
          setShowCompletionSheet(false)
          navigate('/events')
        }}
      />
    </div>
  )
}
