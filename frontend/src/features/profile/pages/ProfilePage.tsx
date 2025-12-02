import { BarChart2, CalendarRange, Menu, UsersRound, Zap } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MateCard } from '@/features/mates/components/MateCard'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

const mockProfile = {
  name: 'Jamie Thompson',
  location: 'Brisbane CBD',
  flag: '🇹🇼',
  vibe: 'Chill',
  sports: ['Basketball', 'Running', 'Gym'],
  trying: ['Pickleball', 'Bouldering'],
  blurb: 'Here for good banter, easy pace, and a crew to play with after work.',
  avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
}

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'calendar' | 'mates' | 'energy'>('stats')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f7f8fb] pb-[120px]">
      <div className="mx-auto w-full max-w-4xl pb-6">
        <ActionToolbar
          showBack={false}
          rightContent={
            <Link
              to="/profile/settings"
              aria-label="Menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700"
            >
              <Menu className="h-6 w-6" />
            </Link>
          }
          contentClassName="px-3"
          borderBottom
        />
        <HeroCard />
        <TabsBar
          active={activeTab}
          onChange={setActiveTab}
        />
        <div className="mt-4 space-y-4">
          {activeTab === 'stats' && (
            <>
              <div>stats</div>
            </>
          )}
          {activeTab === 'calendar' && (
            <>
              <div>calendar</div>
            </>
          )}
          {activeTab === 'mates' && (
            <>
              <div>mates</div>
            </>
          )}
          {activeTab === 'energy' && (
            <>
              <div>energy</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function HeroCard() {
  return (
     <div className="bg-gradient-to-b from-[#e3ebff] to-[#d5e2ff]">
      <MateCard
        {...mockProfile}
        accentClassName="w-full max-w-none min-w-0 shadow-none bg-transparent px-0 rounded-none"
      />
    </div>
  )
}

function TopMenu({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <div className="flex justify-end bg-white pb-2 pt-2 pr-1">
      <Link
        to="/profile/settings"
        aria-label="Menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700"
        onClick={onOpenMenu}
      >
        <Menu className="h-6 w-6" />
      </Link>
    </div>
  )
}

function TabsBar({
  active,
  onChange,
}: {
  active: 'stats' | 'calendar' | 'mates' | 'energy'
  onChange: (tab: 'stats' | 'calendar' | 'mates' | 'energy') => void
}) {
  const tabs = [
    { icon: <BarChart2 className="h-6 w-6" />, key: 'stats' as const },
    { icon: <CalendarRange className="h-6 w-6" />, key: 'calendar' as const },
    { icon: <UsersRound className="h-6 w-6" />, key: 'mates' as const },
    { icon: <Zap className="h-6 w-6" />, key: 'energy' as const },
  ]
  return (
    <div className="flex justify-between border-b border-slate-200 bg-[#f7f8fb] px-6">
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
}

function MenuSheet({ onClose }: { onClose: () => void }) {
  const items = useMemo(
    () => [
      { label: 'Account settings', icon: Settings },
      { label: 'View profile', icon: UserRound },
      { label: 'Privacy', icon: ShieldCheck },
      { label: 'Get help', icon: HelpCircle },
    ],
    []
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-slate-600">Menu</span>
          <button
            aria-label="Close menu"
            className="text-sm font-semibold text-slate-600 hover:text-slate-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="divide-y divide-slate-200">
          {items.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-slate-50"
              onClick={onClose}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-slate-700" />
                <span className="text-base text-slate-800">{label}</span>
              </div>
              <span className="text-slate-300">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
