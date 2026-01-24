import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import clsx from 'clsx'
import { Calendar, CircleDollarSign, MapPin, MessageCircle, PersonStanding, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/hooks'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { selectedEvent: event, fetchEventById, isLoading, joinEvent, leaveEvent } = useEventsStore()

  useEffect(() => {
    if (id) {
      fetchEventById(id)
    }
  }, [id, fetchEventById])

  const handleShare = () => {
    // navigator.share usually requires HTTPS
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: 'Come join this event!',
        url: window.location.href,
      }).catch(console.error)
    } else {
      window.alert('分享功能即將推出')
    }
  }

  const handleJoinClick = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }
    if (!event || !id) return
    
    if (event.joined) {
      await leaveEvent(id)
    } else {
      await joinEvent(id)
    }
  }

  if (isLoading || !event) {
    return <div className="flex h-screen items-center justify-center text-slate-500">載入中...</div>
  }

  const isJoined = event.joined
  const spotsRemaining = Math.max(0, event.maxAttendees - event.attendeeCount)
  const heroImage = (event.photos && event.photos.length > 0) ? event.photos[0] : (event.heroImageUrl || event.detail?.heroImageUrl)
  const skillLabel = 
    event.skillLevel === 'beginner' ? '初階' :
    event.skillLevel === 'intermediate' ? '中階' :
    event.skillLevel === 'advanced' ? '進階' : '不限程度'
    
  const genderLabel = 
    event.gender === 'female_only' ? '女性專屬' :
    event.gender === 'male_only' ? '男性專屬' : '性別混合'

  // Photos: using heroImage as main, maybe carousel later?
  // Current UI only shows one hero image.

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
        <div className="relative mb-0 overflow-hidden shadow-[0_25px_70px_rgba(15,41,77,0.12)]">
          <div 
             className="h-[230px] w-full bg-cover bg-center"
             style={{ 
               backgroundImage: heroImage ? `url(${heroImage})` : 'linear-gradient(135deg, #DBEAFE, #2563EB)',
             }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 -mt-6 rounded-t-[32px] bg-white shadow-[0_25px_70px_rgba(15,41,77,0.12)]">
          <div className="px-5 pb-6 pt-6">
            <div className="flex items-center gap-3">
              <AvatarCircle name={event.host.name} src={event.host.avatarUrl} />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  由 {event.host.name} 主辦
                </p>
                <p className="text-xs text-slate-500">Host</p>
              </div>
            </div>

            <hr className="my-6 border-slate-200" />

            <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                {event.sport}
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
                {skillLabel}
              </span>
              <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-pink-700">
                {genderLabel}
              </span>
            </div>

            <div className="mt-4">
              <h1 className="text-[28px] font-semibold text-slate-900">{event.title}</h1>
            </div>

            <div className="mt-6 space-y-3">
              <InfoRow 
                icon={Calendar} 
                label={`${new Date(event.startTime).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - ${new Date(event.endTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`} 
              />
              <InfoRow 
                icon={MapPin} 
                label={event.location.name && event.location.name !== event.location.address 
                  ? `${event.location.name} (${event.location.address})` 
                  : event.location.address} 
              />
              <InfoRow icon={CircleDollarSign} label={event.priceRange || (event.isFree ? '免費' : 'Paid')} />
            </div>

            <hr className="my-6 border-slate-200" />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#C8DBFF] bg-[#EEF3FF] text-[#1E6DEB] shadow-[0_4px_10px_rgba(30,109,235,0.12)]">
                  <PersonStanding className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </span>
                <span>目前報名（剩 {spotsRemaining} 位）</span>
              </div>
              
              {event.participants.length > 0 ? (
                event.participants.map(p => (
                  <div key={p.id} className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                    <AvatarCircle
                      name={p.name}
                      src={p.avatarUrl}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {p.name}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 pl-14">還沒有人報名，快來搶頭香！</p>
              )}
            </div>

            <hr className="my-6 border-slate-200" />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#C8DBFF] bg-[#EEF3FF] text-[#1E6DEB] shadow-[0_4px_10px_rgba(30,109,235,0.12)]">
                  <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </span>
                <span>主辦想說</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">{event.detail?.description || event.description || '沒有描述'}</p>
            </div>
            
            {/* Photos Section if multiple */}


          </div>
        </div>
      </div>
      <JoinBar isJoined={isJoined} onClick={handleJoinClick} event={event} />
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

function JoinBar({ isJoined, onClick, event }: { isJoined: boolean; onClick: () => void; event: any }) {
  const isFull = event.attendeeCount >= event.maxAttendees;
  const isPast = new Date(event.endTime) < new Date();

  let buttonText = '加入活動';
  let disabled = false;

  if (isJoined) {
    buttonText = '已加入';
  } else if (isPast) {
    buttonText = '活動已結束';
    disabled = true;
  } else if (isFull) {
    buttonText = '已額滿';
    disabled = true;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 overflow-hidden pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-5 shadow-[0_-20px_50px_rgba(15,41,77,0.2)]">
      <div className="absolute inset-0 bg-gradient-to-br from-player-50/95 via-white/95 to-player-200/95" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,199,44,0.25),_transparent_60%)]" />
      <div className="relative mx-auto w-full max-w-[420px] px-4">
        <Button
          onClick={onClick}
          disabled={disabled}
          className={clsx(
            'h-12 w-full rounded-full text-base font-semibold shadow-lg transition',
            isJoined ? 'bg-player-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  )
}
