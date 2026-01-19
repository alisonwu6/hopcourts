import clsx from 'clsx'
import { Menu, PlusSquare, Lock } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MateCard, type MateCardProps } from '@/features/mates/components/MateCard'
import { BottomSheet } from '@/components/BottomSheet'
import { SheetLayout } from '@/components/SheetLayout'
import { useAuthStore } from '@/hooks'
import { onboardingService } from '@/features/onboarding/onboarding.service'
import { useSports } from '@/features/sports/hooks/useSports'
import { useVibes } from '@/features/dictionaries/hooks'
import { useCountries, useCities } from '@/features/dictionaries/hooks'
import { supabase } from '@/lib/supabase'
import Cropper from 'react-easy-crop'

const emptyProfile: MateCardProps = {
  name: '',
  username: '',
  location: '',
  cityKey: '',
  flag: '',
  countryKey: '',
  vibe: '',
  vibeKey: null,
  sports: [],
  trying: [],
  blurb: '',
  avatar: '',
}

type GoalState = { sessionsPerWeek: string; timeOfDay: string; days: string[] }
const SAMPLE_AVATAR =
  'https://lh3.googleusercontent.com/a/ACg8ocIpaF9eUIgYqF2yYRiKxzfoEjDdH20a4pyh6QfJuxxz=s200'

async function createImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', (error) => reject(error))
    img.setAttribute('crossOrigin', 'anonymous')
    img.src = url
  })
}

async function getCroppedImg(imageSrc: string, croppedAreaPixels: any, rotation = 0) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  const { width, height, x, y } = croppedAreaPixels
  const safeArea = Math.max(image.width, image.height) * 2
  canvas.width = width
  canvas.height = height

  ctx.translate(width / 2, height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-width / 2, -height / 2)
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((file) => {
      if (!file) {
        reject(new Error('Failed to crop image'))
        return
      }
      resolve(file)
    }, 'image/jpeg')
  })
}

export function ProfilePage() {
  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const dayLabels: Record<string, string> = {
    Monday: '週一',
    Tuesday: '週二',
    Wednesday: '週三',
    Thursday: '週四',
    Friday: '週五',
    Saturday: '週六',
    Sunday: '週日',
  }
  const createDaySlots = () =>
    daysList.reduce<Record<string, string[]>>((acc, day) => {
      acc[day] = []
      return acc
    }, {})
  const [showGoalSheet, setShowGoalSheet] = useState(false)
  const defaultGoal: GoalState = {
    sessionsPerWeek: '2',
    timeOfDay: '晚上',
    days: ['Mon', 'Wed'],
  }
  const [goal, setGoal] = useState<GoalState | null>(defaultGoal)
  const [draftGoal, setDraftGoal] = useState<GoalState>(defaultGoal)
  const [goalDaySlots, setGoalDaySlots] = useState<Record<string, string[]>>(createDaySlots())
  const [draftDaySlots, setDraftDaySlots] = useState<Record<string, string[]>>(createDaySlots())
  const [draftPreferredTime, setDraftPreferredTime] = useState(goal?.timeOfDay || '早上')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [showAvatarCropper, setShowAvatarCropper] = useState(false)
  const [avatarImageSrc, setAvatarImageSrc] = useState<string>('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const { user, onboardingStatus, isAuthenticated, isLoading, profileCache, setProfileCache } =
    useAuthStore()
  const userAvatar = (user as any)?.avatar || (user as any)?.avatar_url || (user as any)?.avatarUrl
  const userId = (user as any)?.id
  const [profile, setProfile] = useState<MateCardProps | null>(profileCache ?? null)
  const [draftProfile, setDraftProfile] = useState<MateCardProps>(profileCache ?? emptyProfile)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
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
  const username = (user as any)?.username || (profile as any)?.username || 'undefined'
  const labelForSport = useMemo(() => {
    const map = new Map(sportsCatalog.map((s) => [s.key, s.label]))
    const fallback: Record<string, string> = {
      BASKETBALL: '籃球',
      RUNNING: '慢跑',
      CYCLING: '自行車',
      PICKLEBALL: '匹克球',
      SKATEBOARD: '滑板',
    }
    return (key: string) => map.get(key) || fallback[key] || key
  }, [sportsCatalog])

  const keyForLabel = useMemo(() => {
    const map = new Map<string, string>()
    sportsCatalog.forEach((s) => {
      map.set(s.label, s.key)
      map.set(s.key, s.key)
    })
    const fallback: Record<string, string> = {
      籃球: 'BASKETBALL',
      慢跑: 'RUNNING',
      自行車: 'CYCLING',
      匹克球: 'PICKLEBALL',
      滑板: 'SKATEBOARD',
    }
    return (label: string) => map.get(label) || fallback[label] || label
  }, [sportsCatalog])

  const labelForVibe = useMemo(() => {
    const map = new Map(vibesCatalog.map((v) => [v.key, v.label]))
    return (key: string) => map.get(key) || key
  }, [vibesCatalog])

  const vibeKeyToUnion = useMemo(() => {
    const map = new Map<string, MateCardProps['vibe']>()
    vibesCatalog.forEach((v) => {
      const union = (v.key.charAt(0) + v.key.slice(1).toLowerCase()) as MateCardProps['vibe']
      map.set(v.key, union)
    })
    return map
  }, [vibesCatalog])

  const vibeUnionToKey = useMemo(() => {
    const map = new Map<string, string>()
    vibesCatalog.forEach((v) => {
      const union = (v.key.charAt(0) + v.key.slice(1).toLowerCase()) as MateCardProps['vibe']
      map.set(union, v.key)
    })
    return map
  }, [vibesCatalog])
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null)

  const labelForCountry = useMemo(() => {
    const map = new Map(countriesCatalog.map((c) => [c.key, c.label]))
    return (key?: string) => (key ? map.get(key) || key : '')
  }, [countriesCatalog])

  const labelForCity = useMemo(() => {
    const map = new Map(citiesCatalog.map((c) => [c.key, c.label]))
    return (key?: string) => (key ? map.get(key) || key : '')
  }, [citiesCatalog])

  // Remap labels when dictionary updates
  useEffect(() => {
    setProfile((prev) => {
      if (!prev) return prev
      const sportsKeys = (prev as any).sportsKeys as string[] | undefined
      const tryingKeys = (prev as any).tryingKeys as string[] | undefined
      if (!sportsKeys && !tryingKeys) return prev
      return {
        ...prev,
        sports: (sportsKeys || prev.sports || []).map(labelForSport),
        trying: (tryingKeys || prev.trying || []).map(labelForSport),
      }
    })
  }, [labelForSport])

  // Sync vibe union when字典載入
  useEffect(() => {
    if (!vibesCatalog.length) return
    setProfile((prev) => {
      if (!prev) return prev
      if (prev.vibe) return prev
      const key = (prev as any).vibeKey
      if (!key) return prev
      const union = vibeKeyToUnion.get(key)
      if (!union) return prev
      return { ...prev, vibe: union }
    })
    setDraftProfile((prev) => {
      if (!prev) return prev
      if (prev.vibe) return prev
      const key = (prev as any).vibeKey
      if (!key) return prev
      const union = vibeKeyToUnion.get(key)
      if (!union) return prev
      return { ...prev, vibe: union }
    })
  }, [vibesCatalog, vibeKeyToUnion])

  // Sync label fields (vibe/location/flag) once dictionaries載入完成
  useEffect(() => {
    if (!profile) return
    setProfile((prev) => {
      if (!prev) return prev
      const next = { ...prev }
      if (prev.cityKey) {
        const label = labelForCity(prev.cityKey)
        if (label && label !== prev.location) next.location = label
      }
      if (prev.countryKey) {
        const label = labelForCountry(prev.countryKey)
        if (label && label !== prev.flag) next.flag = label
      }
      if (next.location === prev.location && next.flag === prev.flag) return prev
      return next
    })
    setDraftProfile((prev) => {
      if (!prev) return prev
      const next = { ...prev }
      if (prev.cityKey) {
        const label = labelForCity(prev.cityKey)
        if (label && label !== prev.location) next.location = label
      }
      if (prev.countryKey) {
        const label = labelForCountry(prev.countryKey)
        if (label && label !== prev.flag) next.flag = label
      }
      if (next.location === prev.location && next.flag === prev.flag) return prev
      return next
    })
  }, [citiesCatalog, countriesCatalog, labelForCity, labelForCountry, profile])
  const hasCompletedCard = onboardingStatus?.isComplete ?? false

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    const fetchProfile = async () => {
      try {
        const [profileRes, prefsRes] = await Promise.all([
          onboardingService.getProfile(),
          onboardingService.getPreferences(),
        ])

        const payload: any = (profileRes as any)?.data ?? profileRes
        if (payload) {
          const data = payload.user ? payload.user : payload
          const sportsRows = payload.sports || []
          const favoriteKeys =
            payload.favorite_sports ||
            sportsRows.filter((s: any) => s.kind === 'FAVORITE').map((s: any) => s.sport_key)
          const tryingKeys =
            payload.trying_sports ||
            sportsRows.filter((s: any) => s.kind === 'TRYING').map((s: any) => s.sport_key)
          const vibeUnion = data.vibe_key ? vibeKeyToUnion.get(data.vibe_key) || '' : ''
          const mapped: MateCardProps = {
            name: data.display_name || data.username || '',
            username: data.username || data.display_name || '',
            location: data.city_label || data.city || '',
            cityKey: data.city_key || '',
            flag: labelForCountry(data.country_key) || '',
            countryKey: data.country_key || '',
            vibe: vibeUnion || '',
            vibeKey: data.vibe_key || null,
            sportsKeys: favoriteKeys || [],
            tryingKeys: tryingKeys || [],
            sports: (favoriteKeys || []).map(labelForSport),
            trying: (tryingKeys || []).map(labelForSport),
            blurb: data.bio || '',
            avatar: data.avatar_url || userAvatar || '',
          }
          if (!cancelled) {
            setProfile(mapped)
            setDraftProfile(mapped)
            setProfileCache(mapped)
          }
        }

        const prefsPayload: any = (prefsRes as any)?.data ?? prefsRes
        if (prefsPayload && !cancelled) {
          const sessionsPerWeek = prefsPayload.sessions_per_week
          const preferredTime = prefsPayload.preferred_time
          const daySlots = prefsPayload.day_slots || {}
          setGoal({
            sessionsPerWeek: sessionsPerWeek ? String(sessionsPerWeek) : '',
            timeOfDay: preferredTime || '尚未設定',
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
      } catch {
        if (!cancelled) {
          setProfile(null)
          setDraftProfile(emptyProfile)
        }
      }
    }
    fetchProfile()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

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

  const handleSaveGoal = () => {
    setGoal({ ...draftGoal, timeOfDay: draftPreferredTime })
    setGoalDaySlots(draftDaySlots)
    setShowGoalSheet(false)
  }

  const handleOpenProfileEdit = () => {
    setDraftProfile(profile ?? emptyProfile)
    setShowEditSheet(true)
  }

  const handleAvatarFile = (file: File | null) => {
    if (!file) return
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarImageSrc(reader.result as string)
      setShowAvatarCropper(true)
    }
    reader.readAsDataURL(file)
  }

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleAvatarCropSave = async () => {
    if (!avatarImageSrc || !croppedAreaPixels) {
      setShowAvatarCropper(false)
      return
    }
    if (!supabase || !userId) {
      alert('尚未設定 Supabase 或未登入，請改貼上圖片網址。')
      setShowAvatarCropper(false)
      return
    }
    setAvatarUploading(true)
    try {
      const croppedBlob = await getCroppedImg(avatarImageSrc, croppedAreaPixels, rotation)
      const fileExt = 'jpg'
      const path = `avatars/${userId}-${Date.now()}.${fileExt}`
      const { error } = await supabase.storage.from('avatars').upload(path, croppedBlob, {
        upsert: true,
        contentType: 'image/jpeg',
      })
      if (error) throw error
      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(path)
      if (publicData?.publicUrl) {
        const publicUrl = publicData.publicUrl
        setDraftProfile((prev) => ({ ...prev, avatar: publicUrl }))
        setProfile((prev) => (prev ? { ...prev, avatar: publicUrl } : prev))
        setProfileCache((prev) => (prev ? { ...prev, avatar: publicUrl } : prev))
        await onboardingService.saveProfile({ avatar_url: publicUrl })
      }
    } catch (err) {
      console.error('avatar crop/upload failed', err)
      alert('上傳失敗，請再試一次或改貼上圖片網址。')
    } finally {
      setAvatarUploading(false)
      setShowAvatarCropper(false)
      setAvatarImageSrc('')
      setCroppedAreaPixels(null)
      setZoom(1)
      setCrop({ x: 0, y: 0 })
      setRotation(0)
    }
  }

  const openFieldSheet = (field: typeof activeField, value: string, rawKey?: string) => {
    let nextValue = rawKey ?? value
    if (field === 'vibe') {
      nextValue = rawKey || vibeUnionToKey.get(value as MateCardProps['vibe']) || value
    }
    setActiveField(field)
    setFieldValue(nextValue)
  }

  const triggerAvatarSelect = () => {
    avatarFileInputRef.current?.click()
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
        next.username = value
        payload.username = value
        break
      case 'location':
        next.location = labelForCity(value) || value
        next.cityKey = value
        payload.city_key = value
        break
      case 'flag':
        next.flag = labelForCountry(value) || value
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
        username: draftProfile.username || draftProfile.name,
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
        sportsKeys: favoriteKeys,
        tryingKeys: tryingKeys,
      }
      setProfile(updated)
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
  const displayProfile = profile
  const displayGoal = goal

  return (
    <div className="min-h-screen pb-[120px]">
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleAvatarFile(e.target.files?.[0] || null)}
      />
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
          profile={displayProfile}
          onEdit={handleOpenProfileEdit}
          avatarFallback={userAvatar || ''}
        />
        <div className="mt-4 space-y-4">
          <StatsContent
            goal={displayGoal}
            goalDaySlots={goalDaySlots}
            onOpenGoalSheet={handleOpenGoal}
            showEdit={hasCompletedCard}
          />
        </div>
      </div>
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
                onClick={triggerAvatarSelect}
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
                  value: draftProfile.username ?? '',
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
        open={showAvatarCropper}
        onClose={() => setShowAvatarCropper(false)}
        showHandle={false}
        disableContainer
      >
        <SheetLayout
          onClose={() => setShowAvatarCropper(false)}
          title="調整大頭貼"
          subtitle="拖曳與縮放，讓頭像置中，保存後上傳。"
          height="tall"
          className="w-full rounded-t-[32px] bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
          contentClassName="flex-1 overflow-y-auto px-5 py-4 space-y-4"
          primaryButton={{
            label: avatarUploading ? '上傳中...' : '套用',
            onClick: handleAvatarCropSave,
            disabled: avatarUploading,
          }}
          showHandle={false}
        >
          {avatarImageSrc ? (
            <div className="space-y-4">
              <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-slate-900/5">
                <Cropper
                  image={avatarImageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  rotation={rotation}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                  cropShape="round"
                  showGrid={false}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">縮放</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-slate-600">尚未選擇圖片</p>
          )}
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
              className="w-1/2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              儲存
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

export function StatsContent({
  goal,
  goalDaySlots,
  onOpenGoalSheet,
  showEdit = true,
}: {
  goal: GoalState | null
  goalDaySlots: Record<string, string[]>
  onOpenGoalSheet: () => void
  showEdit?: boolean
}) {
  const dayLabels: Record<string, string> = {
    Monday: '週一',
    Tuesday: '週二',
    Wednesday: '週三',
    Thursday: '週四',
    Friday: '週五',
    Saturday: '週六',
    Sunday: '週日',
  }
  const preferredTimes = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ].map((day) => ({
    dayLabel: dayLabels[day] ?? day,
    slots: goalDaySlots[day]?.length ? goalDaySlots[day].join(', ') : '尚未設定',
  }))

  const hasDaySlots = Object.values(goalDaySlots).some((slots) => (slots || []).length > 0)
  const hasPrefs =
    !!goal &&
    ((goal.sessionsPerWeek && goal.sessionsPerWeek.trim() !== '') ||
      (goal.timeOfDay && goal.timeOfDay.trim() !== '') ||
      hasDaySlots)

  if (!hasPrefs) {
    return (
      <div className="px-3">
        <EmptyBlock
          title="尚未設定每週節奏"
          description="設定你的每週目標次數與時段，幫你配對到適合的活動與夥伴。"
          actionLabel={showEdit ? '設定每週節奏' : undefined}
          onAction={showEdit ? onOpenGoalSheet : undefined}
        />
      </div>
    )
  }

  return (
    <div className="px-3">
      <div className="space-y-4 overflow-hidden rounded-3xl border border-blue-100 bg-blue-50 shadow-sm">
        <div className="flex items-start justify-between px-5 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            我的每週節奏
          </p>
          {showEdit && (
            <button
              type="button"
              onClick={onOpenGoalSheet}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              編輯
            </button>
          )}
        </div>
        <div className="space-y-3 px-5">
          <p className="text-xl font-bold text-slate-900">
            本週節奏：{goal?.sessionsPerWeek ? `${goal.sessionsPerWeek} 次` : '未設定'}
          </p>
          <p className="text-sm font-semibold text-slate-700">本週完成度 20% — 穩穩前進。</p>
          <div className="h-3 overflow-hidden rounded-full bg-blue-100">
            <div className="h-full w-1/2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-base font-semibold text-emerald-600">你出現過一次 — 傳奇。</p>
        </div>
        <div className="space-y-2 border-t border-blue-100 bg-white/60 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            你的偏好時段
          </p>
          <p className="text-sm font-semibold text-slate-700">
            常用時段：
            {goal?.timeOfDay && goal.timeOfDay.trim() ? goal.timeOfDay : '尚未設定'}
          </p>
          <div className="space-y-1">
            {preferredTimes.map(({ dayLabel, slots }) => (
              <div
                key={dayLabel}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
              >
                <span>{dayLabel}</span>
                <span className="font-medium text-slate-500">{slots}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroCard({
  profile,
  onEdit,
  avatarFallback = '',
}: {
  profile: MateCardProps | null
  onEdit: () => void
  avatarFallback?: string
}) {
  const safeProfile: MateCardProps = profile ?? {
    name: '',
    username: '',
    location: '',
    flag: '',
    vibe: '',
    sports: [],
    trying: [],
    blurb: '',
    avatar: avatarFallback,
  }

  return (
    <div
      className="cursor-pointer bg-gradient-to-b from-[#e3ebff] to-[#d5e2ff]"
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onEdit()
      }}
    >
      <MateCard
        {...safeProfile}
        accentClassName="w-full max-w-none min-w-0 shadow-none bg-transparent px-0 rounded-none"
      />
      <div className="flex justify-center py-3">
        <button
          type="button"
          onClick={onEdit}
          className="w-100 max-w-xs rounded-lg bg-slate-100 px-4 py-1 text-sm text-slate-400"
        >
          編輯運動卡
        </button>
      </div>
    </div>
  )
}
