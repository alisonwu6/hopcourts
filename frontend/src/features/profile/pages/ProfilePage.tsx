import clsx from 'clsx'
import { Menu, PlusSquare, Lock } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { type MateCardProps } from '@/features/mates/components/MateCard'
type ProfileVM = {
  username: string
  card: MateCardProps
  favoriteSportKeys: string[]
  tryingSportKeys: string[]
}
import { BottomSheet } from '@/components/BottomSheet'
import { SheetLayout } from '@/components/SheetLayout'
import { useAuthStore } from '@/hooks'
import { onboardingService } from '@/features/onboarding/onboarding.service'
import { useSports } from '@/features/sports/hooks/useSports'
import { useCountries, useCities, useVibes } from '@/features/dictionaries/hooks'
import { HeroCard } from '@/features/profile/components/HeroCard'
import { ProfileContent } from '@/features/profile/components/ProfileContent'
import { AvatarCropSheet } from '@/features/profile/components/AvatarCropSheet'
import { createDaySlots, dayLabels } from '@/features/profile/constants'
import type { GoalState } from '@/features/profile/types'
import type { ApiResponse } from '@/api/types'
import { ProfileOnboardingIntro } from '@/features/profile/components/ProfileOnboardingIntro'

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i])

// Convert ISO country code (e.g., TW) to emoji flag
const countryCodeToFlag = (code?: string) => {
  if (!code || code.length < 2) return ''
  const upper = code.slice(0, 2).toUpperCase()
  const chars = [...upper].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0))
  return String.fromCodePoint(...chars)
}

const emptyProfile: MateCardProps = {
  name: '',
  location: '',
  cityKey: '',
  flag: '',
  countryKey: '',
  vibe: null,
  vibeKey: null,
  sports: [],
  trying: [],
  blurb: '',
  avatar: '',
}

const SAMPLE_AVATAR =
  'https://lh3.googleusercontent.com/a/ACg8ocIpaF9eUIgYqF2yYRiKxzfoEjDdH20a4pyh6QfJuxxz=s200'

export function ProfilePage() {
  const [showGoalSheet, setShowGoalSheet] = useState(false)
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
  const { user, onboardingStatus, isAuthenticated, isLoading, profileCache, setProfileCache } =
    useAuthStore()
  const userAvatar = (user as any)?.avatar || (user as any)?.avatar_url || (user as any)?.avatarUrl
  const userId = (user as any)?.id
  const [stats, setStats] = useState<ApiResponse<any>['data'] | null>(null)
  const [vm, setVm] = useState<ProfileVM | null>(
    profileCache
      ? {
          username:
            (profileCache as any)?.username ||
            (user as any)?.username ||
            (profileCache as any)?.display_name ||
            '',
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
  const [profileNotFound, setProfileNotFound] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingGoal, setIsSavingGoal] = useState(false)
  const [isProfileLoaded, setIsProfileLoaded] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showSportsSheet, setShowSportsSheet] = useState(false)
  const [showTryingSheet, setShowTryingSheet] = useState(false)
  const [activeField, setActiveField] = useState<
    null | 'name' | 'username' | 'location' | 'flag' | 'vibe' | 'bio'
  >(null)
  const [fieldValue, setFieldValue] = useState('')
  const [sportsSearch, setSportsSearch] = useState('')
  const [tryingSearch, setTryingSearch] = useState('')
  const { sports: sportsCatalog } = useSports('zh')
  const { items: vibesCatalog } = useVibes('zh')
  const { items: countriesCatalog } = useCountries('zh')
  const { items: citiesCatalog } = useCities(undefined, 'zh')
  const navigate = useNavigate()
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
      map.set(union, v.key)
      map.set(union.toLowerCase(), v.key)
    })
    return map
  }, [vibesCatalog])

  const labelForCountry = useMemo(() => {
    const map = new Map(countriesCatalog.map((c) => [c.key, c.label]))
    return (key?: string) => (key ? map.get(key) || key : '')
  }, [countriesCatalog])

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
    const flagLabel = vm.card.countryKey
      ? countryCodeToFlag(vm.card.countryKey) || labelForCountry(vm.card.countryKey) || vm.card.flag
      : vm.card.flag
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
      flag: flagLabel,
      vibe: vibeUnion,
    }
  }, [vm, labelForSport, labelForCity, labelForCountry, vibeKeyToUnion])

  // Memo: derive resolvedDraftProfile (for HeroCard, always label fields, union vibe)
  const resolvedDraftProfile = useMemo<MateCardProps>(() => {
    const locationLabel = draftProfile.cityKey
      ? labelForCity(draftProfile.cityKey) || draftProfile.location
      : draftProfile.location
    const flagLabel = draftProfile.countryKey
      ? countryCodeToFlag(draftProfile.countryKey) ||
        labelForCountry(draftProfile.countryKey) ||
        draftProfile.flag
      : draftProfile.flag
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
      flag: flagLabel,
      vibe: vibeUnion,
    }
  }, [draftProfile, labelForCity, labelForCountry, vibeKeyToUnion])

  const usernameFromVm = vm?.username
  const usernameFromUser = (user as any)?.username
  const username =
    usernameFromVm ||
    usernameFromUser ||
    draftUsername ||
    (resolvedProfile as any)?.username ||
    (resolvedProfile as any)?.name ||
    ''
  const hasCompletedCard = onboardingStatus?.isComplete ?? false

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    const fetchProfile = async () => {
      setProfileNotFound(false)
      try {
        const [profileRes, preferencesRes, statsRes] = await Promise.allSettled([
          onboardingService.getProfile(),
          onboardingService.getPreferences(),
          onboardingService.getStats(),
        ])

        if (!cancelled && profileRes.status === 'fulfilled') {
          const payload: any = (profileRes.value as any)?.data ?? profileRes.value
          if (payload) {
            const data = payload.user ? payload.user : payload
            const sportsRows = payload.sports || []
            const favoriteKeys =
              payload.favorite_sports ||
              sportsRows.filter((s: any) => s.kind === 'FAVORITE').map((s: any) => s.sport_key)
            const tryingKeys =
              payload.trying_sports ||
              sportsRows.filter((s: any) => s.kind === 'TRYING').map((s: any) => s.sport_key)
            const vibeKey = data.vibe_key || null
            const vibeUnion = vibeKey
              ? vibeKeyToUnion.get(vibeKey) ||
                vibeKeyToUnion.get(vibeKey.toLowerCase()) ||
                vibeKeyToUnionFallback(vibeKey)
              : null

            const mapped: MateCardProps = {
              name: data.display_name || data.username || '',
              location: data.city_label || data.city || '',
              cityKey: data.city_key || '',
              flag: labelForCountry(data.country_key) || '',
              countryKey: data.country_key || '',
              vibe: vibeUnion,
              vibeKey,
              sports: (favoriteKeys || []).map(labelForSport),
              trying: (tryingKeys || []).map(labelForSport),
              blurb: data.bio || '',
              avatar: data.avatar_url || userAvatar || '',
            }
            const nextUsername = data.username || data.display_name || (user as any)?.username || ''
            setVm({
              username: nextUsername,
              card: mapped,
              favoriteSportKeys: favoriteKeys || [],
              tryingSportKeys: tryingKeys || [],
            })
            setDraftProfile(mapped)
            setDraftUsername(nextUsername)
            setProfileCache(mapped)
          }
        } else if (!cancelled && profileRes.status === 'rejected') {
          const err: any = profileRes.reason
          const status = err?.status || err?.response?.status
          if (status === 404) {
            setProfileNotFound(true)
          }
          setVm(null)
          setDraftProfile(emptyProfile)
        }

        if (!cancelled && preferencesRes.status === 'fulfilled') {
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
          const mergedSlots: Record<string, string[]> = {
            ...createDaySlots(),
            ...daySlots,
          }
          setGoalDaySlots(mergedSlots)
          setDraftDaySlots(mergedSlots)
          if (preferredTime) setDraftPreferredTime(preferredTime)
        }

        if (!cancelled && statsRes.status === 'fulfilled') {
          const statsPayload: any = (statsRes.value as any)?.data ?? statsRes.value ?? null
          setStats(statsPayload)
        }
      } catch (err) {
        if (!cancelled) {
          setVm(null)
          setDraftProfile(emptyProfile)
        }
      } finally {
        if (!cancelled) setIsProfileLoaded(true)
      }
    }
    fetchProfile()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, labelForCountry, labelForSport, vibeKeyToUnion])

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
      await onboardingService.savePreferences({
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

  const handleOpenProfileEdit = () => {
    setDraftProfile(resolvedProfile ?? emptyProfile)
    setDraftUsername(vm?.username || '')
    setShowEditSheet(true)
  }

  const openFieldSheet = (field: typeof activeField, value: string, rawKey?: string) => {
    let nextValue = rawKey ?? value
    if (field === 'vibe') {
      nextValue = rawKey || vibeUnionToKey.get(value as MateCardProps['vibe']) || value
    }
    setActiveField(field)
    setFieldValue(nextValue)
  }

  const handleSaveField = async () => {
    if (!activeField) return
    const value = fieldValue.trim()
    const next = { ...draftProfile }
    const payload: Record<string, any> = {}
    switch (activeField) {
      case 'name':
        next.name = value
        payload.display_name = value
        break
      case 'username':
        setDraftUsername(value)
        payload.username = value
        break
      case 'location':
        next.location = labelForCity(value) || value
        next.cityKey = value
        payload.city_key = value
        break
      case 'flag':
        next.flag = countryCodeToFlag(value) || labelForCountry(value) || value
        next.countryKey = value
        payload.country_key = value
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
      default:
        break
    }
    setDraftProfile(next)
    try {
      await onboardingService.saveProfile(payload)
    } catch (err) {
      console.error('Failed to patch profile field', err)
    } finally {
      setActiveField(null)
    }
  }

  const handleSaveProfile = async () => {
    if (isSavingProfile) return
    setIsSavingProfile(true)
    try {
      const favoriteKeys = (draftProfile.sports || [])
        .filter(Boolean)
        .map((label) => keyForLabel(label))
      const tryingKeys = (draftProfile.trying || [])
        .filter(Boolean)
        .map((label) => keyForLabel(label))

      await onboardingService.saveProfile({
        username: draftUsername || draftProfile.name,
        display_name: draftProfile.name,
        bio: draftProfile.blurb,
        vibe_key:
          (draftProfile as any).vibeKey || vibeUnionToKey.get(draftProfile.vibe as string) || null,
        favorite_sports: favoriteKeys,
        trying_sports: tryingKeys,
        avatar_url: draftProfile.avatar || null,
      })

      const updated = {
        ...draftProfile,
        sports: draftProfile.sports.filter(Boolean),
        trying: draftProfile.trying.filter(Boolean),
      }
      setVm((prev) => ({
        username: draftUsername || prev?.username || '',
        card: updated,
        favoriteSportKeys: favoriteKeys,
        tryingSportKeys: tryingKeys,
      }))
      setDraftProfile(updated)
      setProfileCache(updated)
      setShowEditSheet(false)
    } catch (err) {
      // keep sheet open for retry
      console.error('Failed to save profile', err)
    } finally {
      setIsSavingProfile(false)
    }
  }

  if (isLoading) return null
  if (!isAuthenticated) return null

  const isOnboardingIncomplete = isAuthenticated && !(onboardingStatus?.isComplete ?? false)
  const showOnboardingIntro =
    (isOnboardingIncomplete || profileNotFound) && isProfileLoaded && !resolvedProfile
  if (isOnboardingIncomplete && !isProfileLoaded) return null

  const displayProfile = resolvedProfile
  const displayGoal = goal
  const allowGoalEdit = true
  const sessionsCompleted = Math.max(0, Number((stats as any)?.sessions_completed ?? 0))
  const sessionsTarget = Math.max(0, Number(displayGoal?.sessionsPerWeek ?? 0))
  const completion =
    sessionsTarget > 0 ? Math.min(100, Math.round((sessionsCompleted / sessionsTarget) * 100)) : 0

  const pageContent = showOnboardingIntro ? (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white pb-24">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-center justify-end bg-white px-4 py-4">
          <Link
            to="/settings"
            aria-label="Menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700"
          >
            <Menu className="h-6 w-6" />
          </Link>
        </div>
      </div>
      <ProfileOnboardingIntro onStart={() => navigate('/onboarding')} />
    </div>
  ) : (
    <div className="min-h-screen overflow-y-auto pb-[120px]">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-center justify-between bg-white px-4 py-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-slate-700" aria-hidden="true" />
            {username && <span className="text-2xl font-bold text-slate-900">{username}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Add game"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-800"
              onClick={() => navigate('/create-event')}
            >
              <PlusSquare className="h-6 w-6" />
            </button>
            <Link
              to="/settings"
              aria-label="Menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700"
            >
              <Menu className="h-6 w-6" />
            </Link>
          </div>
        </div>
        <HeroCard
          profile={resolvedProfile}
          onEdit={handleOpenProfileEdit}
          avatarFallback={userAvatar || ''}
        />
        <div className="mt-4 space-y-4">
          <ProfileContent
            goal={displayGoal}
            goalDaySlots={goalDaySlots}
            completion={completion}
            sessionsCompleted={sessionsCompleted}
            onOpenGoalSheet={handleOpenGoal}
            showEdit={allowGoalEdit || hasCompletedCard}
          />
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
        defaultAvatar={draftProfile.avatar || userAvatar || SAMPLE_AVATAR}
        onAvatarUpdated={(url) => {
          setDraftProfile((prev) => ({ ...prev, avatar: url }))
          setVm((prev) => (prev ? { ...prev, card: { ...prev.card, avatar: url } } : prev))
          // Keep cache shape consistent: cache stores MateCardProps (no username)
          // Avoid functional-updater style here because setProfileCache is a store action.
          const base = (resolvedProfile ?? draftProfile) as MateCardProps
          setProfileCache({ ...base, avatar: url })
        }}
      />
      <BottomSheet
        open={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        showHandle={false}
        disableContainer
      >
        <SheetLayout
          onClose={() => setShowEditSheet(false)}
          title="編輯運動卡"
          subtitle="保持最新運動狀態"
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 min-h-0 overflow-y-auto px-5 pb-24 pt-4 space-y-4"
          primaryButton={{
            label: isSavingProfile ? '儲存中...' : '儲存卡片',
            onClick: handleSaveProfile,
            disabled: isSavingProfile,
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={draftProfile.avatar || userAvatar || SAMPLE_AVATAR}
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
                  key: 'flag',
                  label: '國籍',
                  value: labelForCountry(draftProfile.countryKey) || draftProfile.flag,
                  valueKey: draftProfile.countryKey || '',
                },
                {
                  key: 'vibe',
                  label: '運動氛圍',
                  value: draftProfile.vibe || '',
                  valueKey:
                    vibeUnionToKey.get(draftProfile.vibe as string) ||
                    (draftProfile as any).vibeKey ||
                    '',
                },
              ].map((row) => (
                <button
                  key={row.key}
                  type="button"
                  onClick={() => openFieldSheet(row.key as any, row.value, (row as any).valueKey)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-slate-50"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-700">{row.label}</p>
                    <p className="text-base font-semibold text-slate-900">
                      {row.key === 'vibe'
                        ? labelForVibe(
                            (row as any).valueKey ||
                              vibeUnionToKey.get(row.value as string) ||
                              (row.value as string)
                          ) || '未設定'
                        : row.value || '未設定'}
                    </p>
                  </div>
                  <span className="text-slate-400">›</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">運動</p>
            <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setShowSportsSheet(true)}
                className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-slate-50"
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
                className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-slate-50"
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
                className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-slate-50"
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
            location: '現居',
            flag: '國籍',
            vibe: '運動氛圍',
            bio: '自我介紹',
          }
          const subtitleMap: Record<string, string> = {
            name: '請輸入卡片上要顯示的名稱。',
            username: '你的帳號，夥伴可以用這個找到你。',
            location: '填寫目前所在的城市，方便配對附近的活動。',
            flag: '選擇你的國籍，展現身份。',
            vibe: '描述現在最貼近你的運動氛圍。',
            bio: '和大家分享你的運動的動態與目標吧！',
          }
          const fieldKey = activeField ?? ''
          return (
            <SheetLayout
              onClose={() => setActiveField(null)}
              title={titleMap[fieldKey] || ''}
              subtitle={subtitleMap[fieldKey] || ''}
              height="medium"
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
                <div className="grid gap-3 sm:grid-cols-2">
                  {vibesCatalog.map((v) => {
                    const active =
                      v.key === fieldValue ||
                      vibeUnionToKey.get(fieldValue) === v.key ||
                      vibeUnionToKey.get(fieldValue)?.toLowerCase?.() === v.key.toLowerCase()
                    return (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => setFieldValue(v.key)}
                        className={clsx(
                          'flex flex-col items-start rounded-2xl border px-4 py-4 text-left shadow-sm transition',
                          active
                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                            : 'border-slate-200 bg-white text-slate-900 hover:border-blue-300'
                        )}
                      >
                        <p className="text-lg font-bold">{v.label}</p>
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
              ) : activeField === 'flag' ? (
                <select
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">請選擇國籍</option>
                  {countriesCatalog.map((c) => (
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
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                    placeholder="和大家分享你想說的一句話。"
                  />
                  <div className="text-right text-sm text-slate-500">
                    還可以輸入 {120 - (fieldValue?.length || 0)} 個字
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
                  placeholder="請輸入"
                />
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
          title="選擇常做運動"
          subtitle="最多選 3 項，依照你常說「好，走！」的運動，幫你排程與配對。"
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          primaryButton={{
            label: '儲存',
            onClick: () => setShowSportsSheet(false),
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
                    className="text-slate-400 hover:text-slate-600"
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
                        : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300',
                      disabled && !selected && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <span>{sport.label}</span>
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
          subtitle="最多選 2 項，挑你感興趣的新挑戰，我們會幫你找帶路人。"
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          primaryButton={{
            label: '儲存',
            onClick: () => setShowTryingSheet(false),
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
                    className="text-slate-400 hover:text-slate-600"
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
                        : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300',
                      disabled && !selected && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <span>{sport.label}</span>
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
              className="rounded-full px-3 py-1 text-sm font-semibold text-slate-500 hover:text-slate-700"
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
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
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
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
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
              className="w-1/2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveGoal}
              disabled={isSavingGoal}
              className="w-1/2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSavingGoal ? '儲存中...' : '儲存'}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
