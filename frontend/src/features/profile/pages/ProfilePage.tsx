import clsx from 'clsx'
import { Goal, Menu, PlusSquare, Lock, Calendar, MapPin, Users, Wallet } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MateCard, type MateCardProps } from '@/features/mates/components/MateCard'
import { BottomSheet } from '@/components/BottomSheet'
import { useAuthStore } from '@/hooks'

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
  const [goal, setGoal] = useState({ sessionsPerWeek: '2', timeOfDay: '晚上', days: ['Mon', 'Wed'] })
  const [draftGoal, setDraftGoal] = useState(goal)
  const [goalDaySlots, setGoalDaySlots] = useState<Record<string, string[]>>(createDaySlots())
  const [draftDaySlots, setDraftDaySlots] = useState<Record<string, string[]>>(createDaySlots())
  const [draftPreferredTime, setDraftPreferredTime] = useState(goal.timeOfDay || '早上')
  const [profile, setProfile] = useState<MateCardProps>(mockProfile)
  const [draftProfile, setDraftProfile] = useState<MateCardProps>(mockProfile)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const username = (user as any)?.username || 'wuchialin6'

  const handleOpenGoal = () => {
    setDraftGoal(goal)
    setDraftDaySlots(goalDaySlots)
    setDraftPreferredTime(goal.timeOfDay || 'Mornings')
    setShowGoalSheet(true)
  }

  const handleSaveGoal = () => {
    setGoal({ ...draftGoal, timeOfDay: draftPreferredTime })
    setGoalDaySlots(draftDaySlots)
    setShowGoalSheet(false)
  }

  const handleOpenProfileEdit = () => {
    setDraftProfile(profile)
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

  return (
    <div className="min-h-screen pb-[120px]">
      <div className="mx-auto w-full max-w-4xl pb-6">
        <div className="flex items-center justify-between px-4 py-4 bg-white">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-slate-700" aria-hidden="true" />
            <span className="text-2xl font-bold text-slate-900">{username}</span>
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
              to="/profile/settings"
              aria-label="Menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700"
            >
              <Menu className="h-6 w-6" />
            </Link>
          </div>
        </div>
        <HeroCard profile={profile} onEdit={() => setShowEditSheet(true)} />
        <div className="mt-4 space-y-4">
          <StatsContent goal={goal} goalDaySlots={goalDaySlots} onOpenGoalSheet={handleOpenGoal} />
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
  goal: { sessionsPerWeek: string; timeOfDay: string; days: string[] }
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
            本週節奏：{goal.sessionsPerWeek} 次
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
  const upcoming = [
    {
      id: 'city-basketball',
      title: 'City basketball',
      time: 'Today 18:00 – 19:30',
      location: 'Central Park Court, 500m away',
      tag: 'Basketball',
      pace: 'Intermediate pace',
      joined: '0/12 joined',
      price: 'Free to join',
      checkIn: {
        label: 'GPS check-in zone',
        instructions: 'Check in when you arrive — we’ll mark you as here',
        window: '17:45 – 18:15',
        radius: '100m',
      },
    },
  ]

  const completed = [
    {
      id: 'gym-session',
      title: 'Easy gym session',
      time: 'Sun · 45 min',
      location: 'Community Gym · 2km away',
      tag: 'Gym',
      pace: 'Steady pace',
      joined: '0/12 joined',
      price: 'Free to join',
      checkIn: { time: 'Sun 5:05 PM', status: 'on-time', note: 'On time' },
    },
    {
      id: 'social-volleyball',
      title: 'Social volleyball',
      time: 'Sat · 1h',
      location: 'Beach Courts · 1.2km away',
      tag: 'Volleyball',
      pace: 'Social pace',
      joined: '8/16 joined',
      price: '$5 court split',
      checkIn: { time: 'Sat 6:12 PM', status: 'late', note: 'Late at 6:12 PM' },
    },
    {
      id: 'run-club',
      title: 'Morning run club',
      time: 'Fri · 30 min',
      location: 'River Loop · 800m away',
      tag: 'Running',
      pace: 'Light pace',
      joined: '12/25 joined',
      price: 'Free to join',
      checkIn: { status: 'no-show', note: 'No show' },
    },
  ]
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
          {upcoming.map((item) => (
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
          ))}
        </section>
      )}

      {active === 'completed' && (
        <section className="space-y-3">
          {completed.map((item) => (
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
          ))}
        </section>
      )}
    </div>
  )
}

export function PeopleContent() {
  const navigate = useNavigate()
  const [subTab, setSubTab] = useState<'connected' | 'playmates'>('connected')
  const connected = [
    { name: 'Jamie', detail: '每週二、四晚上動起來', meta: 'High five：12 次', colors: 'from-indigo-500 to-purple-500' },
    { name: 'Alex', detail: '早上去跑步', meta: '激勵你 3 次', colors: 'from-pink-400 to-orange-400' },
    { name: 'Sam', detail: '週末健身房', meta: 'High five：8 次', colors: 'from-sky-400 to-blue-500' },
  ]
  const playmates = [
    { name: 'Jordan', meta: '一起參加過 2 次', status: '圈夥伴', colors: 'from-emerald-400 to-teal-400' },
    { name: 'Casey', meta: '上週見面', status: '圈夥伴', colors: 'from-pink-400 to-orange-300' },
    { name: 'Morgan', meta: '一起參加過 3 次', status: '圈夥伴', colors: 'from-indigo-500 to-purple-500' },
    { name: 'Taylor', meta: '上個月見面', status: '已圈', colors: 'from-pink-400 to-fuchsia-500' },
  ]
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
        </div>
      )}

      {subTab === 'playmates' && (
        <div className="space-y-4 px-3 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            交手夥伴
          </p>
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
        </div>
      )}
    </div>
  )
}

function HeroCard({ profile, onEdit }: { profile: MateCardProps; onEdit: () => void }) {
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
