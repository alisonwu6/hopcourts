import clsx from 'clsx'
import { MySessions } from '@/features/events/components/MySessions'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { Menu, PlusSquare, Lock } from 'lucide-react'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { type MateCardProps } from '@/features/mates/components/MateCard'
type ProfileVM = {
  username: string
  usernameUpdatedCount: number
  card: MateCardProps
  favoriteSportKeys: string[]
  tryingSportKeys: string[]
}
import { BottomSheet } from '@/components/BottomSheet'
import { SheetLayout } from '@/components/SheetLayout'
import { useAuthStore } from '@/hooks'
import { profileService } from '@/features/profile/profile.service'
import { useSports } from '@/features/dictionaries/hooks'
import { useCities, useVibes } from '@/features/dictionaries/hooks'
import { HeroCard } from '@/features/profile/components/HeroCard'
import { AvatarCropSheet } from '@/features/profile/components/AvatarCropSheet'
import { createDaySlots, dayLabels } from '@/features/profile/constants'
import type { GoalState } from '@/features/profile/types'
import type { ApiResponse } from '@/api/types'
import { PageLoading } from '@/components/PageLoading'
import { vibeTokens, type Vibe } from '@/constants/vibeTokens'

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i])

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
  const { user, isAuthenticated, isLoading, profileCache, setProfileCache } =
    useAuthStore()
  const userAvatar = (user as any)?.avatar || (user as any)?.avatar_url || (user as any)?.avatarUrl
  const userId = (user as any)?.id
  const [stats, setStats] = useState<ApiResponse<any>['data'] | null>(null)
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
    usernameFromVm ||
    usernameFromUser ||
    draftUsername ||
    (resolvedProfile as any)?.username ||
    ''

  const loadProfileData = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const [profileRes, preferencesRes, statsRes] = await Promise.allSettled([
        profileService.getProfile(),
        profileService.getPreferences(),
        profileService.getStats(),
        fetchMyEvents(),
      ])

      if (profileRes.status === 'fulfilled') {
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
            name: data.display_name || (isUuid(data.username) ? '' : data.username) || (user as any)?.name || '',
            location: data.city_label || data.city || '',
            cityKey: data.city_key || '',
            vibe: vibeUnion,
            vibeKey,
            sports: (favoriteKeys || []).map(labelForSport),
            trying: (tryingKeys || []).map(labelForSport),
            blurb: data.bio || '',
            avatar: data.avatar_url || userAvatar || '',
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
          setDraftProfile(mapped)
          setDraftUsername(nextUsername)
          setProfileCache(mapped)
        }
      } else if (profileRes.status === 'rejected') {
        const err: any = profileRes.reason
        const status = err?.status || err?.response?.status
        if (status === 404) {
          setShowEditSheet(true)
        }
        setVm(null)
        const prefill: MateCardProps = {
          ...emptyProfile,
          name: (user as any)?.name || '',
          avatar: userAvatar || '',
        }
        setDraftProfile(prefill)
      }

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
        const mergedSlots: Record<string, string[]> = {
          ...createDaySlots(),
          ...daySlots,
        }
        setGoalDaySlots(mergedSlots)
        setDraftDaySlots(mergedSlots)
        if (preferredTime) setDraftPreferredTime(preferredTime)
      }

      if (statsRes.status === 'fulfilled') {
        const statsPayload: any = (statsRes.value as any)?.data ?? statsRes.value ?? null
        setStats(statsPayload)
      }
    } catch (err) {
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
  }, [isAuthenticated, labelForSport, vibeKeyToUnion, fetchMyEvents, setProfileCache, userAvatar, user])

  useEffect(() => {
    loadProfileData()
  }, [loadProfileData])

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
    const payload: Record<string, any> = {}
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
        if (value.length < 3 || value.length > 20) {
           setFieldError('帳號長度需介於 3 至 20 個字')
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
      setFieldError(null)
      setActiveField(null)
      return
    }

    try {
      await profileService.saveProfile(payload)
    } catch (err: any) {
      const status = err?.status || err?.response?.status
      if (status === 409) {
        alert('使用者名稱已存在，請選擇其他名稱')
        // Revert username if needed, but for now just alert allows user to fix
      } else {
        console.error('Failed to patch profile field', err)
      }
    } finally {
      setActiveField(null)
    }
  }

  const handleSaveProfile = async () => {
    if (isSavingProfile) return
    setIsSavingProfile(true)
    try {
      const favoriteKeys = Array.from(new Set(
        (draftProfile.sports || [])
          .filter(Boolean)
          .map((label) => keyForLabel(label))
      ))
      const tryingKeys = Array.from(new Set(
        (draftProfile.trying || [])
          .filter(Boolean)
          .map((label) => keyForLabel(label))
      ))

      // If creating new profile (vm null), send EVERYTHING.
      // If updating existing (vm exists), only send fields that aren't auto-saved (Sports, Avatar).
      // Note: Other fields (Name, Bio, etc.) are saved immediately in handleSaveField.
      
      let payload: any = {}
      
      if (!vm) {
        // Validate required fields for new user creation
        const { name, cityKey, vibe, gender } = draftProfile
        const hasVibe = vibe || (draftProfile as any).vibeKey
        const hasSports = favoriteKeys.length > 0
        
        if (!name || !draftUsername || !cityKey || !hasVibe || !gender || !hasSports) {
          alert('請填寫完整個人資料')
          setIsSavingProfile(false)
          return
        }

        // Full create payload
        payload = {
          display_name: draftProfile.name,
          bio: draftProfile.blurb,
          vibe_key:
            (draftProfile as any).vibeKey || vibeUnionToKey.get(draftProfile.vibe as string) || undefined,
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
      } else {
        // Update payload: only Sports and Avatar (and sync any potentially desynced fields if we want to be safe, but user asked for minimal)
        // Let's just send Sports and Avatar as they are the ones not immediately calling saveProfile() in their handlers.
        payload = {
          favorite_sports: favoriteKeys,
          trying_sports: tryingKeys,
          avatar_url: draftProfile.avatar || undefined,
          // We can optionally include others if we suspect drift, but per request, minimize.
        }
      }

      const res = await profileService.saveProfile(payload)
      const responseData = (res as any).data || res
      const savedUser = responseData.user || responseData
      
      // If we got a valid updated count from backend, use it. Otherwise estimate.
      const newCount = typeof savedUser?.username_updated_count === 'number' 
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
      setShowEditSheet(false)
      loadProfileData()
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

  const isCriticalDataLoading = 
    isSportsLoading || 
    isVibesLoading || 
    isCitiesLoading

  if (isLoading || !isProfileLoaded || isCriticalDataLoading) {
    return <PageLoading />
  }
  if (!isAuthenticated) return null



  const pageContent = (
    <div className="min-h-screen overflow-y-auto pb-[120px]">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-center justify-between bg-white px-4 py-4">
          <div className="flex items-center gap-2">
            {username && (
              <>
                <Lock className="h-5 w-5 text-slate-700" aria-hidden="true" />
                <span className="text-2xl font-bold text-slate-900">{username}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Add game"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-800"
              onClick={() => {
                const isProfileComplete = 
                  vm?.card.name && 
                  vm?.username && 
                  vm?.card.cityKey && 
                  (vm?.card.vibe || vm?.card.vibeKey) && 
                  vm?.card.gender && 
                  (vm?.card.sports && vm.card.sports.length > 0)

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
              to="/settings"
              aria-label="Menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700"
            >
              <Menu className="h-6 w-6" />
            </Link>
          </div>
        </div>

        <HeroCard
          profile={resolvedProfile ?? {
            ...emptyProfile,
            name: (user as any)?.name || '',
            avatar: userAvatar || '',
          }}
          onEdit={handleOpenProfileEdit}
          avatarFallback={userAvatar || ''}
          actionLabel="編輯運動卡"
          actionClassName=""
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
        defaultAvatar={draftProfile.avatar || userAvatar || SAMPLE_AVATAR}
        onAvatarUpdated={(url) => {
          setDraftProfile((prev) => ({ ...prev, avatar: url }))
          setVm((prev) => (prev ? { ...prev, card: { ...prev.card, avatar: url } } : prev))
          const base = (resolvedProfile ?? draftProfile) as MateCardProps
          setProfileCache({ ...base, avatar: url })
        }}
      />

      {/* Profile Required Bottom Sheet */}
      <BottomSheet
        open={showProfileRequiredSheet}
        onClose={() => setShowProfileRequiredSheet(false)}
        showHandle
        sheetClassName="rounded-t-[32px] border border-white/40 bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.35)]"
        contentClassName="px-6 pb-10 pt-6"
        maxWidthClassName="max-w-lg"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Lock className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">請先建立運動卡</h3>
          <p className="mt-2 text-sm text-slate-500">
            在發佈活動前，我們需要先認識你。<br />
            請先填寫基本資料，讓其他夥伴更信任你。
          </p>
          <button
            type="button"
            onClick={() => {
              setShowProfileRequiredSheet(false)
              setShowEditSheet(true)
            }}
            className="mt-8 w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98]"
          >
            立即建立
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        showHandle={false}
        disableContainer
      >
        <SheetLayout
          onClose={() => setShowEditSheet(false)}
          title="我的運動卡"
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
                  key: 'gender',
                  label: '性別',
                  value: draftProfile.gender === 'male' ? '男生' : draftProfile.gender === 'female' ? '女生' : draftProfile.gender === 'other' ? '其他' : '未設定',
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
                className="flex w-full items-center justify-between px-4 py-4 text-left "
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
                className="flex w-full items-center justify-between px-4 py-4 text-left "
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
                className="flex w-full items-center justify-between px-4 py-4 text-left "
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
                className="flex w-full items-center justify-between px-4 py-4 text-left "
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
            gender: '讓我們更了解你，提供更合適的活動推薦。',
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
                      "w-full rounded-xl border px-4 py-3 text-base text-slate-900 shadow-sm focus:outline-none",
                      fieldError 
                        ? "border-red-500 focus:border-red-500" 
                        : "border-slate-200 focus:border-blue-500"
                    )}
                    placeholder="請輸入"
                  />
                  {fieldError && (
                    <p className="mt-2 text-sm text-red-500">{fieldError}</p>
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
          title="選擇最愛運動"
          subtitle="那些你能自在接受挑戰，且熱在其中的運動。（最多選 3 項)"
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
                    className="text-slate-400 "
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
                    className="text-slate-400 "
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
              className="rounded-full px-3 py-1 text-sm font-semibold text-slate-500 "
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
              className="w-1/2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 "
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveGoal}
              disabled={isSavingGoal}
              className="w-1/2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition  disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSavingGoal ? '儲存中...' : '儲存'}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
