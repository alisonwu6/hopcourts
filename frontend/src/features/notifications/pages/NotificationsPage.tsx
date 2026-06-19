import { useEffect, useState, useCallback } from 'react'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { Clock, CheckCircle2, UserPlus, UserMinus, AlertCircle, Bell, MessageCircle } from 'lucide-react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { notificationsService, NotificationItem } from '../services/notificationsService'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

const PAGE_SIZE = 20

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    void fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await notificationsService.listNotifications({ limit: PAGE_SIZE, offset: 0 })
      if (res.ok) {
        setNotifications(res.data.items)
        setHasMore(res.data.items.length === PAGE_SIZE)
        setOffset(res.data.items.length)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = useCallback(async () => {
    if (loadingMore) return
    setLoadingMore(true)
    try {
      const res = await notificationsService.listNotifications({ limit: PAGE_SIZE, offset })
      if (res.ok) {
        setNotifications((prev) => [...prev, ...res.data.items])
        setHasMore(res.data.items.length === PAGE_SIZE)
        setOffset((prev) => prev + res.data.items.length)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMore(false)
    }
  }, [offset, loadingMore])

  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loadingMore)

  const handleClick = (n: NotificationItem) => {
    if (!n.is_read) {
      // Optimistic UI update
      setNotifications((prev) => prev.map((p) => (p.id === n.id ? { ...p, is_read: true } : p)))
      notificationsService.markRead(n.id).catch(console.error)
    }

    if (n.metadata?.deep_link) {
      navigate(n.metadata.deep_link)
    }
  }

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((p) => ({ ...p, is_read: true })))
    await notificationsService.markAllRead()
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'session_joined':
        return <UserPlus className="h-5 w-5" />
      case 'session_left':
        return <UserMinus className="h-5 w-5" />
      case 'session_cancelled':
        return <AlertCircle className="h-5 w-5" />
      case 'session_updated':
        return <Clock className="h-5 w-5" />
      case 'check-in':
        return <Clock className="h-5 w-5" />
      case 'ended':
      case 'full':
        return <CheckCircle2 className="h-5 w-5" />
      case 'official_announcement':
        return <MessageCircle className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getIconBg = (type: string) => {
    if (type === 'session_cancelled') return 'bg-red-100 text-red-600'
    if (type === 'session_updated') return 'bg-amber-100 text-amber-700'
    if (type === 'check-in') return 'bg-blue-100 text-blue-600'
    if (type === 'ended') return 'bg-green-100 text-green-600'
    return 'bg-slate-100 text-slate-600'
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ActionToolbar
        title="Notifications"
        showBack={true}
        rightContent={
          notifications.some((n) => !n.is_read) && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Mark all as read
            </button>
          )
        }
      />
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-6">
              <Bell className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900">No new notifications</h3>
            <p className="text-sm text-slate-500">Updates about your events will appear here.</p>
          </div>
        ) : (
          <>
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={clsx(
                  'flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left transition active:bg-slate-50',
                  !n.is_read && 'bg-blue-50/40'
                )}
              >
                <div className="mt-1 flex-shrink-0">
                  <div className={clsx('flex h-10 w-10 items-center justify-center rounded-full', getIconBg(n.type))}>
                    {getIcon(n.type)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={clsx('text-base font-bold', !n.is_read ? 'text-slate-900' : 'text-slate-700')}>
                    {n.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">{n.message}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!n.is_read && <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />}
              </button>
            ))}

            <div ref={sentinelRef} className="h-4" />
            {loadingMore ? (
              <div className="flex justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
              </div>
            ) : !hasMore ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-slate-400">Only notifications from the last 30 days are shown</p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
