import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { BottomSheet } from '@/components/BottomSheet'
import { SheetLayout } from '@/components/SheetLayout'
import clsx from 'clsx'
import { Calendar, CircleDollarSign, MapPin, MessageCircle, PersonStanding, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/hooks'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { eventsService } from '@/features/events/services/eventsService'
import { useSports } from '@/features/dictionaries/hooks'

function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode.length !== 2) return ''
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [hasCheckedIn, setHasCheckedIn] = useState(false) // This should ideally come from backend
  
  const { isAuthenticated, currentUserId } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    currentUserId: state.user?.id,
  }))
  const { selectedEvent: event, fetchEventById, isLoading, joinEvent, leaveEvent, checkInToEvent } = useEventsStore()
  const { items: sports } = useSports('zh')

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

  const handleCheckIn = async () => {
    if (!id || isCheckingIn) return
    setIsCheckingIn(true)

    if (!navigator.geolocation) {
      window.alert('您的裝置不支援 GPS 定位，無法報到')
      setIsCheckingIn(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await checkInToEvent(id, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setHasCheckedIn(true)
          window.alert('報到成功！🎉')
        } catch (err: any) {
          console.error(err)
          window.alert(err.message || '報到失敗，請確認您已抵達活動地點')
        } finally {
          setIsCheckingIn(false)
        }
      },
      (err) => {
        console.error(err)
        window.alert('無法取得您的位置，請確認已開啟 GPS 權限')
        setIsCheckingIn(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      const res = await eventsService.deleteEvent(id)
      if (res.success) {
        navigate(-1)
      }
    } catch (err) {
      console.error('Delete failed', err)
    } finally {
      setIsDeleting(false)
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
  
  const sportLabel = sports.find((s) => s.key.toUpperCase() === event.sport.toUpperCase())?.label || event.sport

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
        rightContent={
          event.host.id === currentUserId && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-500 transition hover:text-red-600"
              aria-label="Delete event"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )
        }
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
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
              onClick={() => {
                if (event.host.username) {
                  navigate(`/mate/${event.host.username}`)
                }
              }}
            >
              <div className="flex items-center gap-3">
                <AvatarCircle name={event.host.name} src={event.host.avatarUrl} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.host.name}
                  </p>
                  <p className="text-xs text-slate-500">發動發起人</p>
                </div>
              </div>
            </div>

            <hr className="my-6 border-slate-200" />

            <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                {sportLabel}
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
                {skillLabel}
              </span>
              <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-pink-700">
                {genderLabel}
              </span>
              {event.visibility === 'public' && (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                  公開場次
                </span>
              )}
            </div>

            <div className="mt-4">
              <h1 className="text-[28px] font-semibold text-slate-900">{event.title}</h1>
            </div>

            <div className="mt-6 space-y-3">
              <InfoRow 
                icon={Calendar} 
                label={`${new Date(event.startTime).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })} ${new Date(event.startTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date(event.endTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}`} 
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
                event.participants.map(p => {
                  const isCheckedIn = !!p.checkedInAt
                  const endTime = new Date(event.endTime)
                  const closeMins = event.checkinCloseMinsAfter ?? 60
                  const closeTime = new Date(endTime.getTime() + closeMins * 60 * 1000)
                  const now = new Date()
                  const isAbsent = !isCheckedIn && now > closeTime

                  return (
                    <div 
                      key={p.id} 
                      className="flex items-center justify-between gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 cursor-pointer hover:bg-slate-100 transition"
                      onClick={() => {
                        if (p.username) {
                          navigate(`/mate/${p.username}`)
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
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
                      <div className="pr-1">
                        {isCheckedIn ? (
                          <span className="text-xs font-bold text-emerald-600">已報到</span>
                        ) : isAbsent ? (
                          <span className="text-xs font-bold text-red-500">缺席</span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">尚未報到</span>
                        )}
                      </div>
                    </div>
                  )
                })
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
      <JoinBar
        isJoined={isJoined}
        event={event}
        onJoin={handleJoinClick}
        onCheckIn={handleCheckIn}
        isCheckingIn={isCheckingIn}
        hasCheckedIn={hasCheckedIn}
      />
      
      <BottomSheet
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <SheetLayout
          onClose={() => setShowDeleteConfirm(false)}
          title="確定要刪除活動嗎？"
          subtitle="一旦刪除，活動資訊將無法恢復。"
          primaryButton={{
            label: isDeleting ? '刪除中...' : '確定刪除',
            onClick: handleDelete,
            variant: 'danger',
            isLoading: isDeleting
          }}
          secondaryButton={{
            label: '取消',
            onClick: () => setShowDeleteConfirm(false),
          }}
        >
          <div className="py-2 text-slate-500 text-sm">此操作無法復原。</div>
        </SheetLayout>
      </BottomSheet>

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
      className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-slate-700"
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

type JoinBarProps = {
  isJoined: boolean
  event: any // Replace 'any' with PlayerEvent type if possible
  onJoin: () => void
  onCheckIn: () => void
  isCheckingIn: boolean
  hasCheckedIn: boolean
}

function JoinBar({ isJoined, event, onJoin, onCheckIn, isCheckingIn, hasCheckedIn }: JoinBarProps) {
  const isFull = event.attendeeCount >= event.maxAttendees
  const now = new Date()
  const startTime = new Date(event.startTime)
  const endTime = new Date(event.endTime)
  const isPast = endTime < now
  
  // Check-in window logic
  // Use event configuration or defaults (30m before, 60m after)
  const openMins = event.checkinOpenMinsBefore ?? 30
  const closeMins = event.checkinCloseMinsAfter ?? 60
  
  const openTime = new Date(startTime.getTime() - openMins * 60 * 1000)
  const closeTime = new Date(endTime.getTime() + closeMins * 60 * 1000)
  const isCheckInOpen = now >= openTime && now <= closeTime

  const formatTime = (date: Date) => 
    date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })

  let mainButton = (
    <Button
      onClick={onJoin}
      className="bg-blue-600 text-white hover:bg-blue-700"
    >
      加入活動
    </Button>
  )

  let statusText: React.ReactNode = null

  if (hasCheckedIn) {
    mainButton = (
      <Button disabled className="bg-emerald-500 text-white opacity-100">
        已報到 ✓
      </Button>
    )
  } else if (isJoined) {
    if (isCheckInOpen) {
      mainButton = (
        <Button
          onClick={onCheckIn}
          disabled={isCheckingIn}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {isCheckingIn ? '定位中...' : '📍 我到了！馬上報到'}
        </Button>
      )
      statusText = (
        <p className="text-center text-xs font-medium text-red-500">
          最晚報到時間為 {formatTime(closeTime)}
        </p>
      )
    } else if (now > closeTime) {
      mainButton = (
        <Button disabled className="bg-slate-400 text-white opacity-80 cursor-not-allowed">
          缺席
        </Button>
      )
    } else {
      // Joined but not yet time to check in (now < openTime)
      mainButton = (
        <Button 
          disabled={false} 
          onClick={onJoin} 
          className="bg-player-600 text-white hover:bg-player-700 shadow-sm"
        >
          已加入
        </Button>
      )
      statusText = (
        <p className="text-center text-xs font-medium text-slate-500">
          將於 {formatTime(openTime)} 開放報到
        </p>
      )
    }
  } else if (isPast) {
    mainButton = (
      <Button disabled className="bg-slate-300 text-slate-500 opacity-80 cursor-not-allowed">
        活動已結束
      </Button>
    )
  } else if (isFull) {
    mainButton = (
      <Button disabled className="bg-slate-300 text-slate-500 opacity-80 cursor-not-allowed">
        已額滿
      </Button>
    )
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 overflow-hidden bg-white pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-5 shadow-[0_-20px_50px_rgba(15,41,77,0.1)]">
      <div className="relative mx-auto flex w-full max-w-[420px] flex-col gap-2 px-4">
        {statusText}
        {React.cloneElement(mainButton as React.ReactElement, {
          className: clsx(
            'h-12 w-full rounded-full text-base font-semibold shadow-lg transition',
            (mainButton as React.ReactElement).props.className
          ),
        })}
      </div>
    </div>
  )
}
