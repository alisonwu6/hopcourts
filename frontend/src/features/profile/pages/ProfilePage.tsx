import clsx from 'clsx'
import { Goal, Menu, PlusSquare, Lock, Calendar, MapPin, Users, Wallet } from 'lucide-react'
import { forwardRef, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MateCard, type MateCardProps } from '@/features/mates/components/MateCard'
import { BottomSheet } from '@/components/BottomSheet'
import { useAuthStore } from '@/hooks'
import { onboardingService } from '@/features/onboarding/onboarding.service'
import { useSports } from '@/features/sports/hooks/useSports'

const mockProfile: MateCardProps = {
  name: 'Alison Wu',
  location: '台北',
  flag: '🇹🇼',
  vibe: 'Chill',
  sports: ['籃球', '慢跑', '健身房'],
  trying: ['匹克球', '抱石'],
  blurb: '「找同頻的夥伴，輕鬆聊、輕鬆動，下班也能一起放鬆。」',
  avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=320&q=80',
}

type GoalState = { sessionsPerWeek: string; timeOfDay: string; days: string[] }

function EmptyBlock({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/80 px-5 py-8 text-center shadow-sm">
      <p className="text-lg font-extrabold text-slate-900">{title}</p>
      <p className="mt-2 text-sm font-medium text-slate-600">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 w-full max-w-[220px] rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
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
  const defaultGoal: GoalState = { sessionsPerWeek: '2', timeOfDay: '晚上', days: ['Mon', 'Wed'] }
  const [goal, setGoal] = useState<GoalState | null>(defaultGoal)
  const [draftGoal, setDraftGoal] = useState<GoalState>(defaultGoal)
  const [goalDaySlots, setGoalDaySlots] = useState<Record<string, string[]>>(createDaySlots())
  const [draftDaySlots, setDraftDaySlots] = useState<Record<string, string[]>>(createDaySlots())
  const [draftPreferredTime, setDraftPreferredTime] = useState(goal?.timeOfDay || '早上')
  const { user, onboardingStatus, isAuthenticated, isLoading, profileCache, setProfileCache } =
    useAuthStore()
  const [profile, setProfile] = useState<MateCardProps | null>(profileCache ?? null)
  const [draftProfile, setDraftProfile] = useState<MateCardProps>(profileCache ?? mockProfile)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const { sports: sportsCatalog } = useSports('zh')
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
          const vibeMap: Record<string, MateCardProps['vibe']> = {
            CHILL: 'Chill',
            SOCIAL: 'Social',
            FLOW: 'Flow',
            EXPLORER: 'Explorer',
            GROWTH: 'Growth',
            COMPETITIVE: 'Competitive',
            SUPPORTIVE: 'Supportive',
          }
          const mapped: MateCardProps = {
            name: data.display_name || data.username || mockProfile.name,
            username: data.username || data.display_name || mockProfile.name,
            location: data.city_label || data.city || mockProfile.location,
            flag: data.flag || mockProfile.flag,
            vibe: vibeMap[data.vibe_key] || mockProfile.vibe,
            sportsKeys: favoriteKeys || [],
            tryingKeys: tryingKeys || [],
            sports: (favoriteKeys || []).map(labelForSport),
            trying: (tryingKeys || []).map(labelForSport),
            blurb: data.bio || '',
            avatar: data.avatar_url || mockProfile.avatar,
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
          const mergedSlots: Record<string, string[]> = { ...createDaySlots(), ...daySlots }
          setGoalDaySlots(mergedSlots)
          setDraftDaySlots(mergedSlots)
          if (preferredTime) setDraftPreferredTime(preferredTime)
        }
      } catch {
        if (!cancelled) {
          setProfile(null)
          setDraftProfile(mockProfile)
        }
      }
    }
    fetchProfile()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const handleOpenGoal = () => {
    const baseGoal = goal ?? { sessionsPerWeek: '', timeOfDay: draftPreferredTime || '早上', days: [] }
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
    if (!hasCompletedCard) {
      navigate('/onboarding')
      return
    }
    setDraftProfile(profile ?? mockProfile)
    setShowEditSheet(true)
  }

  const handleSaveProfile = () => {
    setProfile({
      ...draftProfile,
      sports: draftProfile.sports.filter(Boolean),
      trying: draftProfile.trying.filter(Boolean),
    })
    setShowEditSheet(false)
  }

  const updateDraftProfile = (key: keyof MateCardProps, value: any) => {
    setDraftProfile((prev) => ({ ...prev, [key]: value }))
  }

  const toggleDay = (day: string) => {
    setDraftGoal((prev) => {
      const hasDay = prev.days.includes(day)
      const days = hasDay ? prev.days.filter((d) => d !== day) : [...prev.days, day]
      return { ...prev, days }
    })
  }

  if (isLoading) return null
  if (!isAuthenticated) return null
  const displayProfile = profile
  const displayGoal = goal

  return (
    <div className="min-h-screen pb-[120px]">
        <div className="mx-auto w-full max-w-4xl pb-6">
        <div className="flex items-center justify-between px-4 py-4 bg-white">
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
        <HeroCard profile={displayProfile} onEdit={handleOpenProfileEdit} />
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
        sheetClassName="rounded-t-[32px] border border-white/50 bg-white shadow-[0_-30px_80px_rgba(15,41,77,0.3)]"
        contentClassName="px-5 pb-8 pt-8 text-slate-900"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">編輯運動卡</p>
              <p className="text-xl font-bold text-slate-900">保持你的氛圍最新</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              className="rounded-full px-3 py-1 text-sm font-semibold text-slate-500 hover:text-slate-700"
              onClick={() => setShowEditSheet(false)}
            >
              ×
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">名稱</label>
            <input
              value={draftProfile.name}
              onChange={(e) => updateDraftProfile('name', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">地點</label>
            <input
              value={draftProfile.location}
              onChange={(e) => updateDraftProfile('location', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Flag</label>
              <input
              value={draftProfile.flag}
              onChange={(e) => updateDraftProfile('flag', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Vibe</label>
            <select
              value={draftProfile.vibe}
              onChange={(e) => updateDraftProfile('vibe', e.target.value as MateCardProps['vibe'])}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              {['Chill', 'Social', 'Flow', 'Competitive'].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">常打的運動</label>
            <input
              value={draftProfile.sports.join(', ')}
              onChange={(e) => updateDraftProfile('sports', e.target.value.split(',').map((s) => s.trim()))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              placeholder="Basketball, Running"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">想嘗試</label>
            <input
              value={draftProfile.trying.join(', ')}
              onChange={(e) => updateDraftProfile('trying', e.target.value.split(',').map((s) => s.trim()))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              placeholder="Pickleball, Bouldering"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">關於你</label>
            <textarea
              value={draftProfile.blurb}
              onChange={(e) => updateDraftProfile('blurb', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">大頭貼網址</label>
            <input
              value={draftProfile.avatar}
              onChange={(e) => updateDraftProfile('avatar', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowEditSheet(false)}
              className="w-1/2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              className="w-1/2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              儲存卡片
            </button>
          </div>
        </div>
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
              onChange={(e) => setDraftGoal((prev) => ({ ...prev, sessionsPerWeek: e.target.value || '1' }))}
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
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="space-y-2">
                    <p className="text-base font-semibold text-slate-800">{dayLabels[day] ?? day}</p>
                    <div className="flex flex-wrap gap-2">
                      {['早上', '下午', '晚上'].map((slot) => {
                        const active = draftDaySlots[day]?.includes(slot)
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() =>
                              setDraftDaySlots((prev) => {
                                const next = { ...prev, [day]: [...(prev[day] ?? [])] }
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
                ))}
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
  const preferredTimes = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => ({
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
          <p className="text-base font-semibold text-emerald-600">
            你出現過一次 — 傳奇。
          </p>
        </div>
        <div className="space-y-2 border-t border-blue-100 bg-white/60 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            你的偏好時段
          </p>
          <p className="text-sm font-semibold text-slate-700">
            常用時段：{goal?.timeOfDay && goal.timeOfDay.trim() ? goal.timeOfDay : '尚未設定'}
          </p>
          <div className="space-y-1">
            {preferredTimes.map(({ dayLabel, slots }) => (
              <div
                key={dayLabel}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
              >
                <span>{dayLabel}</span>
                <span className="text-slate-500 font-medium">{slots}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MatchesContent() {
  const navigate = useNavigate()
  const upcoming: Array<any> = []

  const completed: Array<any> = []
  const [active, setActive] = useState<'upcoming' | 'completed'>('upcoming')

  return (
    <div className="space-y-5 px-3">
      <div className="space-y-3">
        <div className="flex border-b border-slate-200">
          {[
            { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
            { key: 'completed', label: 'History' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key as typeof active)}
              className={clsx(
                'relative flex-1 py-2 text-center text-sm font-semibold',
                active === tab.key ? 'text-blue-600' : 'text-slate-500'
              )}
            >
              {tab.label}
              {active === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 mx-auto block h-0.5 w-1/2 rounded-full bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {active === 'upcoming' && (
        <section className="space-y-3">
          {upcoming.length === 0 ? (
            <EmptyBlock
              title="還沒有即將到來的活動"
              description="建立或報名一場活動，就能在這裡看到行程。"
              actionLabel="去逛活動"
              onAction={() => navigate('/events')}
            />
          ) : (
            upcoming.map((item) => (
              <div
                key={item.title}
                className="space-y-4 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_20px_45px_rgba(15,41,77,0.08)]"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/event/${item.id}`)}
                  className="w-full text-left"
                >
                  <div className="space-y-3 px-5 pt-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {item.pace}
                      </span>
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <span>{item.title}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      {item.time}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      {item.location}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="h-4 w-4 text-slate-500" />
                      {item.joined}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <Wallet className="h-4 w-4 text-slate-500" />
                      {item.price}
                    </p>
                  </div>
                </button>

                {item.checkIn && !item.checkIn.status && (
                  <div className="space-y-3 px-5 pb-5">
                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {item.checkIn.label}
                          </p>
                          <p className="text-xs text-slate-600">
                            {item.checkIn.instructions}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-700">
                        <span>Check-in available:</span>
                        <span className="font-semibold">
                          {item.checkIn.window}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-700">
                        <span>You’re good as long as you’re within:</span>
                        <span className="font-semibold">
                          {item.checkIn.radius}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-blue-500 hover:to-blue-500"
                    >
                      📍 I’m here — check me in
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      )}

      {active === 'completed' && (
        <section className="space-y-3">
          {completed.length === 0 ? (
            <EmptyBlock
              title="還沒有歷史紀錄"
              description="完成一場活動後，會在這裡看到你的紀錄。"
              actionLabel="去逛活動"
              onAction={() => navigate('/events')}
            />
          ) : (
            completed.map((item) => (
              <div
                key={item.title}
                className="space-y-4 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_12px_30px_rgba(15,41,77,0.06)]"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/event/${item.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/event/${item.id}`)
                  }
                }}
              >
                <div className="flex items-start justify-between px-5 pt-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.pace && (
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {item.pace}
                        </span>
                      )}
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xl font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      {item.time}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      {item.location}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="h-4 w-4 text-slate-500" />
                      {item.joined}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <Wallet className="h-4 w-4 text-slate-500" />
                      {item.price}
                    </p>
                  </div>
                </div>
                <div className="">
                  <div className="space-y-2 bg-slate-200 px-5 py-3 text-sm text-slate-700">
                    {item.checkIn?.time && (
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Time</span>
                        <span className="font-semibold">{item.checkIn.time}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Check-in</p>
                      {item.checkIn && (
                        <span
                          className={clsx(
                            'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                            item.checkIn.status === 'on-time'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.checkIn.status === 'late'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {item.checkIn.status === 'on-time'
                            ? 'On time'
                            : item.checkIn.status === 'late'
                            ? 'Good on ya, you made it'
                            : 'No show'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  )
}

export function PeopleContent() {
  const navigate = useNavigate()
  const [subTab, setSubTab] = useState<'connected' | 'playmates'>('connected')
  const connected: Array<any> = []
  const playmates: Array<any> = []
  const goToMate = (mate: { name: string; vibe: string; username?: string }) => {
    const handle = mate.username || mate.name
    navigate(`/${encodeURIComponent(handle)}`, { state: { mate } })
  }

  return (
    <div className="space-y-3 ">
      <div className="sticky top-0 z-10 flex justify-center">
        <div className="flex w-full max-w-sm items-center rounded-full bg-slate-100 p-1">
          {[
            { key: 'connected', label: '夥伴圈' },
            { key: 'playmates', label: '交手夥伴' },
          ].map((tab) => {
            const active = subTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSubTab(tab.key as typeof subTab)}
                className={clsx(
                  'flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition',
                  active
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {subTab === 'connected' && (
        <div className="space-y-4 px-3 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            我的夥伴
          </p>
          {connected.length === 0 ? (
            <EmptyBlock
              title="還沒有夥伴"
              description="加入或建立活動，累積互動後會顯示你的夥伴圈。"
              actionLabel="去逛活動"
              onAction={() => navigate('/events')}
            />
          ) : (
            <div className="space-y-3">
              {connected.map((person) => (
                <button
                  key={person.name}
                  type="button"
                  onClick={() => goToMate({ name: person.name, vibe: 'Chill' })}
                  className="flex w-full items-center gap-4 rounded-2xl border border-slate-200/70 px-4 py-4 text-left shadow-sm transition hover:shadow-md focus:outline-none"
                >
                  <div
                    className={clsx(
                      'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-sm',
                      person.colors
                    )}
                  >
                    {person.name.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-base font-semibold text-slate-900">
                      {person.name}
                    </p>
                    <p className="text-sm text-slate-600">{person.detail}</p>
                    <p className="text-sm text-slate-500">{person.meta}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'playmates' && (
        <div className="space-y-4 px-3 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            交手夥伴
          </p>
          {playmates.length === 0 ? (
            <EmptyBlock
              title="還沒有交手夥伴"
              description="完成活動或互動後，這裡會顯示你圈選的交手夥伴。"
              actionLabel="去逛活動"
              onAction={() => navigate('/events')}
            />
          ) : (
            <div className="space-y-3">
              {playmates.map((mate) => {
                const isAdded = mate.status === 'Added'
                return (
                  <div
                    key={mate.name}
                    className="flex w-full items-center gap-4 rounded-2xl border border-slate-200/70 px-4 py-4 shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => goToMate({ name: mate.name, vibe: 'Chill' })}
                      className="flex items-center gap-4 text-left focus:outline-none"
                    >
                      <div
                        className={clsx(
                          'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-sm',
                          mate.colors
                        )}
                      >
                        {mate.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-base font-semibold text-slate-900">
                            {mate.name}
                          </p>
                        </div>
                        <p className="text-sm text-slate-600">{mate.meta}</p>
                      </div>
                    </button>
                    <div className="ml-auto">
                      <button
                        type="button"
                        className={clsx(
                          'min-w-[64px] rounded-xl px-4 py-2 text-sm font-semibold shadow-sm',
                          isAdded
                            ? 'bg-slate-100 text-slate-500'
                            : 'border border-slate-300 text-slate-900 hover:bg-slate-50'
                        )}
                      >
                        {mate.status}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function HeroCard({ profile, onEdit }: { profile: MateCardProps | null; onEdit: () => void }) {
  if (!profile) {
    return (
      <div className="bg-gradient-to-b from-[#e3ebff] to-[#d5e2ff] px-4 py-8">
        <EmptyBlock
          title="還沒有運動卡資料"
          description="建立或編輯你的運動卡，讓夥伴更快找到你。"
          actionLabel="建立我的運動卡"
          onAction={onEdit}
        />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-[#e3ebff] to-[#d5e2ff]">
      <MateCard
        {...profile}
        accentClassName="w-full max-w-none min-w-0 shadow-none bg-transparent px-0 rounded-none"
      />
      <div className="py-3 flex justify-center">
        <button
          type="button"
          onClick={onEdit}
          className="w-100 max-w-xs rounded-lg bg-slate-100 px-4 py-1 text-slate-400 text-sm"
        >
          編輯運動卡
        </button>
      </div>
    </div>
  )
}

const TabsBar = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="flex justify-between border-b border-slate-200 px-6">
    <div className="relative flex h-12 flex-1 flex-col items-center justify-center text-slate-600">
      <Goal className="h-6 w-6" />
      <span className="text-[11px] font-semibold">Activity</span>
      <span className="absolute -bottom-[1px] left-0 right-0 mx-auto h-1 w-12 rounded-full bg-[#1e63f4]" />
    </div>
  </div>
))
