import clsx from 'clsx'
import { Goal, Gamepad, Menu, PlusSquare, UsersRound, Lock } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MateCard, type MateCardProps } from '@/features/mates/components/MateCard'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { BottomSheet } from '@/components/BottomSheet'
import { useAuthStore } from '@/hooks'

const mockProfile: MateCardProps = {
  name: 'Alison Wu',
  location: 'Brisbane CBD',
  flag: '🇹🇼',
  vibe: 'Chill',
  sports: ['Basketball', 'Running', 'Gym'],
  trying: ['Pickleball', 'Bouldering'],
  blurb: 'Here for good banter, easy pace, and a crew to play with after work.',
  avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=320&q=80',
}

export function ProfilePage() {
  type TabKey = 'stats' | 'calendar' | 'mates'
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as TabKey) ?? 'stats'
  const [showGoalSheet, setShowGoalSheet] = useState(false)
  const [goal, setGoal] = useState({ sessionsPerWeek: '2', timeOfDay: 'Evenings', days: ['Mon', 'Wed'] })
  const [draftGoal, setDraftGoal] = useState(goal)
  const [profile, setProfile] = useState<MateCardProps>(mockProfile)
  const [draftProfile, setDraftProfile] = useState<MateCardProps>(mockProfile)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const username = (user as any)?.username || 'wuchialin6'

  const handleOpenGoal = () => {
    setDraftGoal(goal)
    setShowGoalSheet(true)
  }

  const handleSaveGoal = () => {
    setGoal(draftGoal)
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

  const handleTabChange = (tab: TabKey) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.set('tab', tab)
      return params
    })
  }

  return (
    <div className="min-h-screen bg-[#f7f8fb] pb-[120px]">
      <div className="mx-auto w-full max-w-4xl pb-6">
        <ActionToolbar
          showBack={false}
          contentClassName="px-3"
          borderBottom
          leftContent={(
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-slate-700" aria-hidden="true" />
              <button
                type="button"
                className="flex items-center gap-1 text-xl font-bold text-slate-900"
                aria-label="Profile username"
              >
                {username}
              </button>
            </div>
          )}
          rightContent={
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
          }
        />
        <HeroCard profile={profile} onEdit={() => setShowEditSheet(true)} />
        <TabsBar
          active={activeTab}
          onChange={handleTabChange}
        />
        <div className="mt-4 space-y-4">
          {activeTab === 'stats' && (
            <StatsContent goal={goal} onOpenGoalSheet={handleOpenGoal} />
          )}
          {activeTab === 'calendar' && (
            <MatchesContent />
          )}
          {activeTab === 'mates' && (
            <PeopleContent />
          )}
          {/* {activeTab === 'energy' && (
            <CoachContent />
          )} */}
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
              <p className="text-sm font-semibold text-slate-500">Edit mate card</p>
              <p className="text-xl font-bold text-slate-900">Keep your vibe accurate</p>
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
            <label className="text-sm font-semibold text-slate-700">Name</label>
            <input
              value={draftProfile.name}
              onChange={(e) => updateDraftProfile('name', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Location</label>
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
            <label className="text-sm font-semibold text-slate-700">Sports</label>
            <input
              value={draftProfile.sports.join(', ')}
              onChange={(e) => updateDraftProfile('sports', e.target.value.split(',').map((s) => s.trim()))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              placeholder="Basketball, Running"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Trying out</label>
            <input
              value={draftProfile.trying.join(', ')}
              onChange={(e) => updateDraftProfile('trying', e.target.value.split(',').map((s) => s.trim()))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              placeholder="Pickleball, Bouldering"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">About you</label>
            <textarea
              value={draftProfile.blurb}
              onChange={(e) => updateDraftProfile('blurb', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Avatar URL</label>
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
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              className="w-1/2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              Save card
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
              <p className="text-sm font-semibold text-slate-500">Set your weekly goal</p>
              <p className="text-xl font-bold text-slate-900">We’ll tailor matches to this</p>
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
            <label className="text-sm font-semibold text-slate-700">Sessions per week</label>
            <input
              type="number"
              min={1}
              max={14}
              value={draftGoal.sessionsPerWeek}
              onChange={(e) => setDraftGoal((prev) => ({ ...prev, sessionsPerWeek: e.target.value || '1' }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Days you usually play</p>
            <div className="grid grid-cols-4 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                const active = draftGoal.days.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={clsx(
                      'rounded-lg border px-3 py-2 text-sm font-semibold',
                      active
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Preferred time of day</p>
            <div className="flex flex-wrap gap-2">
              {['Mornings', 'Afternoons', 'Evenings', 'Flexible'].map((slot) => {
                const active = draftGoal.timeOfDay === slot
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setDraftGoal((prev) => ({ ...prev, timeOfDay: slot }))}
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
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            We’ll start suggesting sessions and mates that match your cadence.
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowGoalSheet(false)}
              className="w-1/2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveGoal}
              className="w-1/2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              Save goal
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

function StatsContent({ goal, onOpenGoalSheet }: { goal: { sessionsPerWeek: string; timeOfDay: string; days: string[] }; onOpenGoalSheet: () => void }) {
  const dayLabel = goal.days.length ? goal.days.join(', ') : 'Any day'

  return (
    <div className="space-y-4 px-3">
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/60">
        <div className="space-y-3 px-5 py-5">
          <p className="text-xl font-semibold text-slate-900">What are you aiming for next?</p>
          <button
            className="w-full rounded-2xl bg-[#e9f1ff] px-4 py-3 text-base font-semibold text-blue-600 shadow-sm transition hover:bg-[#dce8ff]"
            onClick={onOpenGoalSheet}
          >
            Set a goal →
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/60">
        <div className="space-y-2 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Availabity</p>
          <p className="text-2xl font-semibold text-slate-900">
            {goal.sessionsPerWeek} sessions / week · {goal.timeOfDay} · Vibe: Chill
          </p>
          <p className="text-sm font-semibold text-slate-700">Days: {dayLabel}</p>
          <p className="text-base text-slate-600">We&apos;ll help you find sessions &amp; people that fit this.</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/60">
        <div className="space-y-3 px-5 py-5">
          <p className="text-xl font-semibold text-slate-900">1 of 2 sessions done this week</p>
          <p className="text-base font-semibold text-emerald-600">You&apos;re on track. 💪</p>
          <div className="h-3 rounded-full bg-slate-200">
            <div className="h-3 w-1/2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

function MatchesContent() {
  const upcoming = [
    {
      emoji: '🏀',
      title: 'Basketball pickup',
      time: 'Thu 5:00 PM · West End',
      tag: 'Chill',
      checkIn: {
        label: 'GPS check-in zone',
        instructions: 'Tap check-in once you arrive to verify attendance.',
        window: '4:45 – 5:15 PM',
        radius: '100m',
      },
    },
    { emoji: '🏃‍♂️', title: 'Weeknight run', time: 'Mon 6:30 PM · South Bank', tag: 'Chill' },
  ]

  const completed = [
    {
      emoji: '💪',
      title: 'Easy gym session',
      time: 'Sun · 45 min',
      tag: 'Flow',
      checkIn: { time: 'Sun 5:05 PM', status: 'on-time', note: 'Nice work showing up on time!' },
    },
    {
      emoji: '🏐',
      title: 'Social volleyball',
      time: 'Sat · 1h',
      tag: 'Social',
      checkIn: { time: 'Sat 6:12 PM', status: 'late', note: 'Checked in late. Thanks for joining!' },
    },
  ]
  const [active, setActive] = useState<'upcoming' | 'completed'>('upcoming')

  return (
    <div className="space-y-5 px-3">
      <div className="space-y-3">
        <div className="flex border-b border-slate-200">
          {[
            { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
            { key: 'completed', label: `Completed (${completed.length})` },
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
            <div key={item.title} className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/60">
              <div className="space-y-3 px-5 py-5">
                <div className="space-y-1">
                  <p className="text-xl font-semibold text-slate-900">
                    <span className="mr-2">{item.emoji}</span>
                    {item.title}
                  </p>
                  <p className="text-sm text-slate-600">{item.time}</p>
                </div>
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {item.tag}
                </span>
                <p className="text-sm text-slate-600">You&apos;re in. We&apos;ll remind you on the day.</p>
                {item.checkIn && (
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-2">
                      {/* <span className="text-lg">📍</span> */}
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.checkIn.label}</p>
                        <p className="text-xs text-slate-600">{item.checkIn.instructions}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>Check-in window:</span>
                      <span className="font-semibold">{item.checkIn.window}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>Check-in radius:</span>
                      <span className="font-semibold">{item.checkIn.radius}</span>
                    </div>
                    <button
                      type="button"
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-blue-500 hover:to-blue-500"
                    >
                      GPS check-in
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {active === 'completed' && (
        <section className="space-y-3">
          {completed.map((item) => (
            <div key={item.title} className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/60">
              <div className="space-y-3 px-5 py-5">
                <div className="space-y-1">
                  <p className="text-xl font-semibold text-slate-900">
                    <span className="mr-2">{item.emoji}</span>
                    {item.title}
                  </p>
                  <p className="text-sm text-slate-600">{item.time}</p>
                </div>
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {item.tag}
                </span>
                {item.checkIn && (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">Check-in: {item.checkIn.time}</p>
                    <p className="text-sm text-slate-600">
                      {item.checkIn.status === 'on-time'
                        ? item.checkIn.note ?? 'On time — nice consistency!'
                        : item.checkIn.note ?? 'Checked in late.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

function PeopleContent() {
  const navigate = useNavigate()
  const [subTab, setSubTab] = useState<'following' | 'played'>('following')
  const circle = [
    { name: 'Jamie', vibe: 'Chill' },
    { name: 'Alex', vibe: 'Social' },
    { name: 'Sam', vibe: 'Flow' },
    { name: 'Jordan', vibe: 'Competitive' },
    { name: 'Casey', vibe: 'Chill' },
  ]
  const recent = [
    { text: 'Jamie played pickup yesterday', color: 'bg-emerald-500' },
    { text: 'Alex at gym 2 hours ago', color: 'bg-emerald-500' },
    { text: 'Sam taking a break', color: 'bg-amber-400' },
    { text: 'Jordan quiet this week', color: 'bg-rose-500' },
  ]
  const playedWith = [
    { name: 'Jamie', sport: 'Basketball pickup', last: 'Yesterday', vibe: 'Chill' },
    { name: 'Alex', sport: 'Gym session', last: '2h ago', vibe: 'Social' },
    { name: 'Sam', sport: 'Easy run', last: 'Last week', vibe: 'Flow' },
  ]
  const goToMate = (mate: { name: string; vibe: string; username?: string }) => {
    const handle = mate.username || mate.name
    navigate(`/${encodeURIComponent(handle)}`, { state: { mate } })
  }

  return (
    <div className="space-y-5 px-3">
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/60">
        <div className="flex border-b border-slate-200 px-5">
          {[
            { key: 'following', label: 'Following' },
            { key: 'played', label: 'Played' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSubTab(tab.key as typeof subTab)}
              className={clsx(
                'relative flex-1 py-3 text-center text-sm font-semibold',
                subTab === tab.key ? 'text-blue-600' : 'text-slate-500'
              )}
            >
              {tab.label}
              {subTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 mx-auto block h-0.5 w-1/2 rounded-full bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        {subTab === 'following' && (
          <div className="space-y-3">
            <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-600">Your circle</p>
            <div className="grid grid-cols-3 gap-y-6 px-5 pb-6">
              {circle.map((person) => (
                <button
                  key={person.name}
                  type="button"
                  onClick={() => goToMate(person)}
                  className="flex flex-col items-center gap-2 focus:outline-none"
                >
                  <div className="h-24 w-24 rounded-full border-2 border-slate-200 bg-slate-50" />
                  <p className="text-base font-semibold text-slate-900">{person.name}</p>
                  <p className="text-sm text-slate-500">{person.vibe}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {subTab === 'played' && (
          <div className="space-y-3 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Recently played</p>
            <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200/70">
              {playedWith.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => goToMate(item)}
                  className="flex items-center justify-between px-4 py-3 text-left w-full"
                >
                  <div className="space-y-0.5">
                    <p className="text-base font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-600">{item.sport}</p>
                    <p className="text-xs text-slate-500">Last played: {item.last}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {item.vibe}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/60">
        <div className="space-y-3 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">What they&apos;re doing now</p>
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200/70">
            {recent.map((item) => (
              <div key={item.text} className="flex items-center gap-3 px-4 py-3">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                <span className="text-base font-semibold text-slate-900">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
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
          Edit Sport Card
        </button>
      </div>
    </div>
  )
}

const TabsBar = forwardRef<HTMLDivElement, {
  active: 'stats' | 'calendar' | 'mates'
  onChange: (tab: 'stats' | 'calendar' | 'mates') => void
}>(({ active, onChange }, ref) => {
  const tabs = [
    { icon: <Goal className="h-6 w-6" />, key: 'stats' as const },
    { icon: <Gamepad className="h-6 w-6" />, key: 'calendar' as const },
    { icon: <UsersRound className="h-6 w-6" />, key: 'mates' as const },
    // { icon: <Zap className="h-6 w-6" />, key: 'energy' as const },
  ]
  return (
    <div ref={ref} className="flex justify-between border-b border-slate-200 bg-[#f7f8fb] px-6">
      {tabs.map((tab, idx) => (
        <button
          key={idx}
          className="relative flex h-11 flex-1 items-center justify-center text-slate-600"
          aria-pressed={active === tab.key}
          onClick={() => onChange(tab.key)}
        >
          {tab.icon}
          {active === tab.key && (
            <span className="absolute -bottom-[1px] left-0 right-0 mx-auto h-1 w-12 rounded-full bg-[#1e63f4]" />
          )}
        </button>
      ))}
    </div>
  )
})
