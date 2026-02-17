import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Button } from '@/components'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { BottomSheet, AlertDialog } from '@/components'
import { SheetLayout } from '@/components/SheetLayout'
import clsx from 'clsx'
import {
  Calendar,
  CircleDollarSign,
  MapPin,
  MessageCircle,
  PersonStanding,
  Trash2,
  LandPlot,
  Pencil,
  Share,
  Smile,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/hooks'
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { eventsService } from '@/features/events/services/eventsService'
import { useSports } from '@/features/dictionaries/hooks'
import { PageLoading } from '@/components/PageLoading'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { ProfileRequiredSheet } from '@/features/profile/components/ProfileRequiredSheet'

function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode.length !== 2) return ''
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [isFavorite, setIsFavorite] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [hasCheckedIn, setHasCheckedIn] = useState(false) // This should ideally come from backend
  const [showProfileRequired, setShowProfileRequired] = useState(false)

  const { isAuthenticated, currentUserId, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    currentUserId: state.user?.id,
    user: state.user,
  }))
  const {
    selectedEvent: event,
    fetchEventById,
    isLoading,
    joinEvent,
    leaveEvent,
    checkInToEvent,
  } = useEventsStore()
  const { items: sports } = useSports('zh')

  useEffect(() => {
    if (id) {
      fetchEventById(id)
    }
  }, [id, fetchEventById])

  useEffect(() => {
    console.log('user', user)
    if (isAuthenticated && !user?.onboarding_completed_at) {
      setShowProfileRequired(true)
    }
  }, [isAuthenticated, user?.onboarding_completed_at])

  const handleShare = () => {
    // navigator.share usually requires HTTPS
    if (navigator.share) {
      navigator
        .share({
          title: event?.title,
          text: 'Come join this event!',
          url: window.location.href,
        })
        .catch(console.error)
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

    // Gender Validation
    if (!event.joined && event.gender && event.gender !== 'mixed') {
      const user = useAuthStore.getState().user
      const userGender = user?.gender

      if (event.gender === 'male' && userGender !== 'male') {
        showAlert('', '此活動為男生專場。', 'warning')
        return
      }

      if (event.gender === 'female' && userGender !== 'female') {
        showAlert('', '此活動為女生專場。', 'warning')
        return
      }
    }

    if (event.joined) {
      await leaveEvent(id)
    } else {
      await joinEvent(id)
    }
  }

  const [alertDialog, setAlertDialog] = useState<{
    open: boolean
    title: string
    description: React.ReactNode
    type: 'success' | 'error' | 'info' | 'warning'
  }>({ open: false, title: '', description: '', type: 'info' })

  const showAlert = (
    title: string,
    description: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    setAlertDialog({ open: true, title, description, type })
  }

  const handleCheckIn = async () => {
    if (!id || isCheckingIn) return
    setIsCheckingIn(true)

    if (!navigator.geolocation) {
      showAlert('不支援定位', '您的裝置不支援 GPS 定位，無法進行報到。', 'error')
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
          // Refresh event data so participant list updates
          void fetchEventById(id)

          showAlert('報到成功', '好好享受運動帶來的樂趣吧！', 'success')
        } catch (err: any) {
          console.error('Check-in error full object:', err)

          // Try to extract the backend error object
          const backendError = err.response?.data?.error || err.response?.data || err

          console.log('Parsed backend error:', backendError)

          const code = backendError.code
          const details = backendError.details

          if (code === 'CHECKIN_OUTSIDE_RADIUS') {
            const dist = details?.distance_m
            const radius = details?.radius_m
            const gap = Math.max(0, dist - radius) // Gap required to move

            const distStr = dist >= 1000 ? `${(dist / 1000).toFixed(1)}km` : `${dist}m`
            const gapStr = gap >= 1000 ? `${(gap / 1000).toFixed(1)}km` : `${gap}m`

            showAlert(
              '再靠近一點點就到了！',
              `目前距離場地約 ${distStr}。請再往場地移動約 ${gapStr}，進入 ${radius}m 範圍內即可進行報到！`,
              'warning'
            )
          } else if (code === 'CHECKIN_OUTSIDE_TIME_WINDOW') {
            showAlert('非報到時間', '目前不在開放報到的時間範圍內。', 'warning')
          } else {
            showAlert(
              '報到失敗',
              backendError.message || err.message || '請確認您已抵達活動地點並開啟定位。',
              'error'
            )
          }
        } finally {
          setIsCheckingIn(false)
        }
      },
      (err) => {
        console.error(err)
        showAlert('你在哪？', '請開啟位置功能，讓我們知道你是否已進入到報到範圍。', 'warning')
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

  const isHost = event?.host?.id === currentUserId
  const isParticipant = event?.participants.some((p) => p.id === currentUserId)

  /* DEBUG: Check why isJoined is false -- REMOVED */

  const isJoined = (event?.joined || isParticipant) ?? false
  const spotsRemaining = event ? Math.max(0, event.maxAttendees - event.attendeeCount) : 0

  // Check if current user is checked in based on event data
  const isCheckedInFromServer = React.useMemo(() => {
    if (!event || !currentUserId) return false
    const me = event.participants.find((p) => p.id === currentUserId)
    return !!me?.checkedInAt
  }, [event, currentUserId])

  const effectiveCheckedIn = hasCheckedIn || isCheckedInFromServer

  if (isLoading || !event) {
    return <PageLoading />
  }

  const heroImage =
    event.photos && event.photos.length > 0
      ? event.photos[0]
      : event.heroImageUrl || event.detail?.heroImageUrl
  const skillLabel =
    event.skillLevel === 'beginner'
      ? '初階'
      : event.skillLevel === 'intermediate'
        ? '中階'
        : event.skillLevel === 'advanced'
          ? '進階'
          : '不限程度'

  const genderLabel =
    event.gender === 'female' ? '女性專屬' : event.gender === 'male' ? '男性專屬' : '性別混合'

  const sportLabel =
    sports.find((s) => s.key.toUpperCase() === event.sport.toUpperCase())?.label || event.sport

  const minPeople = Math.max(1, event.minPeople ?? 1)
  const maxPeople = Math.max(minPeople, event.maxAttendees ?? minPeople)
  const formatMoney = (value?: number | null) => {
    if (value == null || Number.isNaN(Number(value))) return ''
    return Math.round(Number(value)).toLocaleString('zh-TW')
  }
  const feeLine2 = (() => {
    if (event.isFree) return '免費活動'
    const total = event.priceTotal
    const perPerson = event.pricePerPerson
    if (event.priceMode === 'person') {
      if (perPerson) return `每人費用 $${formatMoney(perPerson)}`
      return '收費活動（每人計費）'
    }
    if (total != null) return `總費用 $${formatMoney(total)}`
    if (perPerson) return `總費用未提供（每人約 $${formatMoney(perPerson)}）`
    return '收費活動'
  })()
  const feeNote = event.priceNote?.trim() || '無'
  const participantRule =
    minPeople === 1 ? `保證開團｜上限${maxPeople}人` : `${minPeople}人成團｜上限${maxPeople}人`

  // Photos: using heroImage as main, maybe carousel later?
  // Current UI only shows one hero image.

  return (
    <div className="min-h-screen pb-40">
      <ActionToolbar
        onBack={() => {
          if (location.state?.from === 'create-event') {
            navigate('/events')
          } else {
            navigate(-1)
          }
        }}
        onShare={handleShare}
        onToggleFavorite={() => setIsFavorite((prev) => !prev)}
        isFavorite={isFavorite}
        showShare={false}
        showFavorite={false}
        contentClassName="w-full"
        rightContent={
          <>
            {event.host.id === currentUserId && (
              <>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-full bg-slate-100 p-2 text-slate-500 transition"
                  aria-label="Delete event"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/create-event?id=${event.id}`)}
                  className="rounded-full bg-blue-50 p-2 text-blue-600 transition"
                  aria-label="Edit event"
                >
                  <Pencil className="h-5 w-5" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full bg-blue-50 p-2 text-blue-600 transition"
              aria-label="Share"
            >
              <Share className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </button>
          </>
        }
      />
      <div className="w-full space-y-6">
        <div className="relative mb-0 overflow-hidden shadow-[0_25px_70px_rgba(15,41,77,0.12)]">
          <ImageCarousel
            images={
              event.photos && event.photos.length > 0
                ? event.photos
                : ([event.heroImageUrl || event.detail?.heroImageUrl].filter(Boolean) as string[])
            }
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 -mt-6 rounded-t-[32px] bg-white shadow-[0_25px_70px_rgba(15,41,77,0.12)]">
          <div className="mx-auto max-w-[400px] px-5 pb-6 pt-6">
            {event.updatedAt && (
              <p className="text-right text-xs text-slate-400">
                最後更新時間 {format(event.updatedAt, 'yyyy/MM/dd HH:mm')}
              </p>
            )}
            <div
              className="flex cursor-pointer items-center gap-3 transition"
              onClick={() => {
                if (event.host.username) {
                  navigate(`/mate/${event.host.username}`)
                }
              }}
            >
              <div className="flex items-center gap-3">
                <AvatarCircle name={event.host.name} src={event.host.avatarUrl} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{event.host.name}</p>
                  <p className="text-xs text-slate-500">活動發起人</p>
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
            </div>

            <div className="my-4">
              <h1 className="text-[28px] font-semibold text-slate-900">{event.title}</h1>
            </div>

            <div className="space-y-3">
              <InfoRow
                icon={Calendar}
                label={`${new Date(event.startTime).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })} ${new Date(event.startTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date(event.endTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}`}
              />
              <div
                className={clsx(
                  'group cursor-pointer transition active:opacity-70',
                  event.venueId ? 'hover:text-blue-600' : 'hover:text-slate-900'
                )}
                onClick={() => {
                  if (event.location.lat && event.location.lng) {
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${event.location.lat},${event.location.lng}`,
                      '_blank'
                    )
                  } else {
                    const query = event.location.address || event.location.name
                    if (query) {
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
                        '_blank'
                      )
                    }
                  }
                }}
              >
                <InfoRow
                  icon={MapPin}
                  label={
                    event.location.name && event.location.name !== event.location.address
                      ? `${event.location.name} (${event.location.address})`
                      : event.location.address
                  }
                />
              </div>
              <InfoRow icon={CircleDollarSign} label={feeLine2} />
              <div className="ml-[52px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs font-semibold tracking-wide text-slate-500">收費說明</p>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{feeNote}</p>
              </div>
            </div>

            <hr className="my-6 border-slate-200" />

            <div className="space-y-3">
              <div className="flex items-start gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#C8DBFF] bg-[#EEF3FF] text-[#1E6DEB] shadow-[0_4px_10px_rgba(30,109,235,0.12)]">
                  <PersonStanding className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="flex flex-col gap-1">
                  <span>目前報名（剩 {spotsRemaining} 位）</span>
                  <span className="text-[11px] font-medium normal-case tracking-normal text-slate-400">
                    {participantRule}
                  </span>
                </span>
              </div>

              {event.participants.length > 0 ? (
                event.participants.map((p) => {
                  const isCheckedIn = !!p.checkedInAt
                  const endTime = new Date(event.endTime)
                  const closeMins = event.checkinCloseMinsAfter ?? 60
                  const closeTime = new Date(endTime.getTime() + closeMins * 60 * 1000)
                  const now = new Date()
                  const isAbsent = !isCheckedIn && now > closeTime

                  return (
                    <div
                      key={p.id}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 transition"
                      onClick={() => {
                        if (p.username) {
                          navigate(`/mate/${p.username}`)
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <AvatarCircle name={p.name} src={p.avatarUrl} />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{p.name}</p>
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
                <p className="pl-14 text-xs text-slate-300">還沒有人報名</p>
              )}
            </div>

            <hr className="my-6 border-slate-200" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#C8DBFF] bg-[#EEF3FF] text-[#1E6DEB] shadow-[0_4px_10px_rgba(30,109,235,0.12)]">
                    <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span>活動說明</span>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {event.detail?.description || event.description || '沒有描述'}
              </p>
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
        hasCheckedIn={effectiveCheckedIn}
      />

      <BottomSheet open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        {(() => {
          const hasParticipants = event?.participants && event.participants.length > 0

          if (hasParticipants) {
            return (
              <SheetLayout
                onClose={() => setShowDeleteConfirm(false)}
                title="無法刪除活動"
                subtitle="已有夥伴報名參加，無法刪除。"
                primaryButton={{
                  label: '關閉',
                  onClick: () => setShowDeleteConfirm(false),
                }}
              >
                <div className="py-2 text-sm text-slate-500">
                  若有異動需求，請使用上方編輯按鈕更新活動內容並告知參與夥伴。
                </div>
              </SheetLayout>
            )
          }

          return (
            <SheetLayout
              onClose={() => setShowDeleteConfirm(false)}
              title="確定要刪除活動嗎？"
              subtitle="一旦刪除，活動資訊將無法恢復。"
              primaryButton={{
                label: '取消',
                onClick: () => setShowDeleteConfirm(false),
              }}
              secondaryButton={{
                label: isDeleting ? '刪除中...' : '確定刪除',
                onClick: handleDelete,
                variant: 'danger',
                isLoading: isDeleting,
              }}
            >
              <div className="py-2 text-sm text-slate-500">此操作無法復原。</div>
            </SheetLayout>
          )
        })()}
      </BottomSheet>

      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onSignup={() => navigate('/signup')}
      />

      <AlertDialog
        open={alertDialog.open}
        onClose={() => setAlertDialog((prev) => ({ ...prev, open: false }))}
        title={alertDialog.title}
        description={alertDialog.description}
        type={alertDialog.type}
      />

      <ProfileRequiredSheet
        open={showProfileRequired}
        onClose={() => setShowProfileRequired(false)}
      />
    </div>
  )
}

function AvatarCircle({ name, src }: { name: string; src?: string }) {
  return (
    <div
      className={clsx(
        'flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-slate-700',
        !src && 'bg-slate-100'
      )}
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
      {!src && <Smile className="h-6 w-6 text-slate-400" strokeWidth={1.5} />}
    </div>
  )
}

function InfoRow({ icon: Icon, label }: { icon: LucideIcon; label: React.ReactNode }) {
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
  const closeMins = event.checkinCloseMinsAfter ?? 10 // Match backend default

  const openTime = new Date(startTime.getTime() - openMins * 60 * 1000)
  const closeTime = new Date(startTime.getTime() + closeMins * 60 * 1000) // Relative to Start Time
  const isCheckInOpen = now >= openTime && now <= closeTime

  const formatTime = (date: Date) => format(date, 'MM/dd HH:mm', { locale: zhTW })

  let mainButton = (
    <Button onClick={onJoin} className="bg-blue-600 text-white">
      加入活動
    </Button>
  )
  let secondaryButton: React.ReactElement | null = null

  let statusText: React.ReactNode = null

  if (hasCheckedIn) {
    mainButton = (
      <Button disabled className="bg-emerald-600 text-white opacity-100">
        已報到 ✓
      </Button>
    )
  } else if (isJoined) {
    if (isCheckInOpen) {
      mainButton = (
        <Button onClick={onJoin} className="bg-blue-600 text-white opacity-100">
          已加入
        </Button>
      )
      secondaryButton = (
        <Button
          onClick={onCheckIn}
          disabled={isCheckingIn}
          className="!hover:bg-emerald-600 !active:bg-emerald-600 !focus:bg-emerald-600 !bg-emerald-600 !text-white"
        >
          {isCheckingIn ? (
            '定位中...'
          ) : (
            <span className="flex items-center justify-center gap-2">
              <LandPlot className="h-5 w-5" strokeWidth={2} />
              點我報到
            </span>
          )}
        </Button>
      )
      statusText = (
        <p className="px-4 text-center text-xs font-medium leading-relaxed text-slate-500">
          請於 {formatTime(closeTime)} 分前完成報到，讓同場的夥伴知道你到了。
        </p>
      )
    } else if (now > closeTime) {
      mainButton = (
        <Button onClick={onJoin} className="bg-blue-600 text-white opacity-100">
          已加入
        </Button>
      )
      secondaryButton = (
        <Button
          disabled
          className="!hover:bg-emerald-300 !active:bg-emerald-300 !focus:bg-emerald-300 cursor-not-allowed !bg-emerald-300 !text-white opacity-90 disabled:opacity-90"
        >
          缺席
        </Button>
      )
    } else {
      // Joined but not yet time to check in (now < openTime)
      mainButton = (
        <Button onClick={onJoin} className="bg-blue-600 text-white opacity-100">
          已加入
        </Button>
      )
      secondaryButton = (
        <Button
          disabled
          className="!hover:bg-emerald-500 !active:bg-emerald-500 !focus:bg-emerald-500 cursor-not-allowed !bg-emerald-500 !text-white opacity-100 disabled:opacity-100"
        >
          <span className="flex flex-col items-center leading-tight">
            <span className="text-sm font-semibold">點我報到</span>
            <span className="mt-1 text-xs font-medium">於{formatTime(openTime)}開放按鈕</span>
          </span>
        </Button>
      )
      statusText = (
        <p className="text-center text-xs font-medium text-slate-500">
          將於 {formatTime(openTime)} 開放報到，讓夥伴知道你已經抵達場地。
        </p>
      )
    }
  } else if (isPast) {
    mainButton = (
      <Button disabled className="cursor-not-allowed bg-slate-300 text-slate-500 opacity-80">
        活動已結束
      </Button>
    )
  } else if (isFull) {
    mainButton = (
      <Button disabled className="cursor-not-allowed bg-slate-300 text-slate-500 opacity-80">
        已額滿
      </Button>
    )
  }

  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 overflow-hidden bg-white pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-5 shadow-[0_-20px_50px_rgba(15,41,77,0.1)]">
      <div className="relative flex w-full flex-col gap-2 px-4">
        {statusText}
        {secondaryButton ? (
          <div className="grid grid-cols-2 gap-3">
            {React.cloneElement(mainButton as React.ReactElement<{ className?: string }>, {
              className: clsx(
                'h-12 w-full rounded-full text-base font-semibold shadow-lg transition',
                (mainButton as React.ReactElement<{ className?: string }>).props.className
              ),
            })}
            {React.cloneElement(secondaryButton as React.ReactElement<{ className?: string }>, {
              className: clsx(
                'h-12 w-full rounded-full text-base font-semibold shadow-lg transition',
                (secondaryButton as React.ReactElement<{ className?: string }>).props.className
              ),
            })}
          </div>
        ) : (
          React.cloneElement(mainButton as React.ReactElement<{ className?: string }>, {
            className: clsx(
              'h-12 w-full rounded-full text-base font-semibold shadow-lg transition',
              (mainButton as React.ReactElement<{ className?: string }>).props.className
            ),
          })
        )}
      </div>
    </div>
  )
}

function ImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft
    const width = e.currentTarget.clientWidth
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width)
      setCurrentIndex(newIndex)
    }
  }

  // Auto-play effect
  React.useEffect(() => {
    if (images.length <= 1) return

    const timer = setInterval(() => {
      if (containerRef.current) {
        const nextIndex = (currentIndex + 1) % images.length
        const width = containerRef.current.clientWidth
        containerRef.current.scrollTo({
          left: nextIndex * width,
          behavior: 'smooth',
        })
      }
    }, 5000)

    return () => clearInterval(timer)
  }, [currentIndex, images.length])

  if (images.length === 0) {
    return (
      <div
        className="h-[230px] w-full bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(135deg, #DBEAFE, #2563EB)',
        }}
      />
    )
  }

  return (
    <div className="relative h-[320px] w-full">
      <div
        ref={containerRef}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
      >
        {images.map((src, idx) => (
          <div
            key={idx}
            className="relative h-full min-w-full snap-center overflow-hidden bg-slate-100"
          >
            <img
              src={src}
              alt={`Event photo ${idx + 1}`}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-10 right-4 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}
