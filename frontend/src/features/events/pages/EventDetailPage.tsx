import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import clsx from 'clsx'
import { Calendar, CircleDollarSign, MapPin, MessageCircle, PersonStanding } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import heroPlaceholder from '@/assets/placeholders/game-placeholder.JPEG'
import { useAuthStore } from '@/hooks'

const mockEvent = {
  title: 'Bouldering Session',
  description:
    'Come hang, climb, and chill with a small friendly crew. This session is super relaxed — perfect if you’re getting back into climbing or just want people to climb with. I’ll warm up with you and we can work a few problems together.',
  sport: 'Bouldering',
  skillLabel: 'Intermediate',
  dateTime: 'Mon, 17 Nov 05:00 - 06:30',
  location: 'Sunnybank KFC',
  price: 'Pay on site',
  host: {
    name: 'Alison Wu',
    subtitle: 'Basketball • Running • Gym-goer',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=60',
  },
  participants: [
    {
      id: '1',
      name: 'Alison Wu',
      subtitle: 'Basketball • Running • Gym-goer',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=60',
    },
  ],
  spotsRemaining: 8,
  heroImage: heroPlaceholder,
}

export function EventDetailPage() {
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const handleShare = () => {
    window.alert('Share coming soon')
  }

  const handleJoinClick = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }
    setIsJoined((prev) => !prev)
  }

  return (
    <div className="min-h-screen bg-[#f3f5f8] pb-12">
      <ActionToolbar
        onBack={() => navigate(-1)}
        onShare={handleShare}
        onToggleFavorite={() => setIsFavorite((prev) => !prev)}
        isFavorite={isFavorite}
        showShare
        showFavorite
        contentClassName="w-full max-w-[400px] px-4"
      />
      <div className="mx-auto w-full max-w-[400px] space-y-6 pb-8">
        <div className="relative overflow-hidden shadow-[0_25px_70px_rgba(15,41,77,0.12)] mb-0">
          <img
            src={mockEvent.heroImage}
            alt="Bouldering wall"
            className="h-[230px] w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />
        </div>
        <div className="-mt-6 rounded-t-[32px] bg-white shadow-[0_25px_70px_rgba(15,41,77,0.12)] relative z-10">
          <div className="px-5 pb-6 pt-6">
            
            <div className="flex items-center gap-3">
              <AvatarCircle name={mockEvent.host.name} src={mockEvent.host.avatar} />
              <div>
                <p className="text-sm font-semibold text-slate-900">Hosted by {mockEvent.host.name}</p>
                <p className="text-xs text-slate-500">{mockEvent.host.subtitle}</p>
              </div>
            </div>

            <hr className="my-6 border-slate-200" />

            <div className="mt-6 flex justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                {mockEvent.sport}
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
                {mockEvent.skillLabel}
              </span>
            </div>

            <div className="mt-4">
              <h1 className="text-[28px] font-semibold text-slate-900">{mockEvent.title}</h1>
            </div>

            <div className="mt-6 space-y-3">
              <InfoRow icon={Calendar} label={mockEvent.dateTime} />
              <InfoRow icon={MapPin} label={mockEvent.location} />
              <InfoRow icon={CircleDollarSign} label={mockEvent.price} />
            </div>

            <hr className="my-6 border-slate-200" />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#C8DBFF] bg-[#EEF3FF] text-[#1E6DEB] shadow-[0_4px_10px_rgba(30,109,235,0.12)]">
                  <PersonStanding className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </span>
                <span>
                  Who&apos;s joining ({mockEvent.spotsRemaining} spots remaining)
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                <AvatarCircle name={mockEvent.participants[0].name} src={mockEvent.participants[0].avatar} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{mockEvent.participants[0].name}</p>
                  <p className="text-xs text-slate-500">{mockEvent.participants[0].subtitle}</p>
                </div>
              </div>
            </div>

            <hr className="my-6 border-slate-200" />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#C8DBFF] bg-[#EEF3FF] text-[#1E6DEB] shadow-[0_4px_10px_rgba(30,109,235,0.12)]">
                  <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </span>
                <span>Hey there,</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">{mockEvent.description}</p>
            </div>
          </div>
        </div>
      </div>
      <JoinBar isJoined={isJoined} onClick={handleJoinClick} />
      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onSignup={() => navigate('/signup')}
      />
    </div>
  )
}

function AvatarCircle({ name, src }: { name: string; src?: string }) {
  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#FBEFD6] bg-[#FFE7B6] text-lg font-semibold text-slate-700"
      style={
        src
          ? {
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {!src && name.charAt(0).toUpperCase()}
    </div>
  )
}

function InfoRow({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#C8DBFF] bg-[#EEF3FF] text-[#1E6DEB] shadow-[0_4px_10px_rgba(30,109,235,0.12)]">
        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </span>
      <span>{label}</span>
    </div>
  )
}

function JoinBar({ isJoined, onClick }: { isJoined: boolean; onClick: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 overflow-hidden pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-5 shadow-[0_-20px_50px_rgba(15,41,77,0.2)]">
      <div className="absolute inset-0 bg-gradient-to-br from-player-50/95 via-white/95 to-player-200/95" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,199,44,0.25),_transparent_60%)]" />
      <div className="relative mx-auto w-full max-w-[420px] px-4">
        <Button
          onClick={onClick}
          className={clsx(
            'h-12 w-full rounded-full text-base font-semibold shadow-lg transition',
            isJoined ? 'bg-player-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {isJoined ? 'Joined' : 'Join'}
        </Button>
      </div>
    </div>
  )
}
