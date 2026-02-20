import { useEffect, useState } from 'react'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { Clock, CheckCircle2, UserPlus, UserMinus, AlertCircle, Bell, MessageCircle } from 'lucide-react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { notificationsService, NotificationItem } from '../services/notificationsService'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
    // Mark all as read when opening page? Or provide button?
    // User spec says: "markAllRead(id)" on click item. "markAllRead" separate action.
    // For v1, let's just fetch.
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await notificationsService.listNotifications({ limit: 50 })
      if (res.ok) {
        setNotifications(res.data.items)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = (n: NotificationItem) => {
    if (!n.is_read) {
      // Optimistic UI update
      setNotifications(prev => prev.map(p => p.id === n.id ? { ...p, is_read: true } : p))
      notificationsService.markRead(n.id).catch(console.error)
    }

    if (n.metadata?.deep_link) {
      navigate(n.metadata.deep_link)
    }
  }

  const handleMarkAllRead = async () => {
      setNotifications(prev => prev.map(p => ({ ...p, is_read: true })))
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
        title="通知中心" 
        showBack={true}
        rightContent={
            notifications.some(n => !n.is_read) && (
                <button 
                    onClick={handleMarkAllRead}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    全部已讀
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
             <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="mb-4 rounded-full bg-slate-100 p-6">
                  <Bell className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">目前沒有新通知</h3>
                <p className="text-sm text-slate-500">
                  您的活動有新動向時，會顯示在這裡。
                </p>
             </div>
         ) : (
             <>
                {notifications.map(n => (
                    <button 
                        key={n.id} 
                        onClick={() => handleClick(n)}
                        className={clsx(
                            "flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left transition active:bg-slate-50", 
                            !n.is_read && 'bg-blue-50/40'
                        )}
                    >
                    <div className="mt-1 flex-shrink-0">
                        <div className={clsx("flex h-10 w-10 items-center justify-center rounded-full", getIconBg(n.type))}>
                            {getIcon(n.type)}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={clsx("text-base font-bold", !n.is_read ? 'text-slate-900' : 'text-slate-700')}>
                            {n.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 leading-relaxed line-clamp-2">
                            {n.message}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: zhTW })}
                        </p>
                    </div>
                    {!n.is_read && (
                        <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                    )}
                    </button>
                ))}
                
                <div className="px-4 py-8 text-center">
                    <p className="text-xs text-slate-400">僅顯示最近 30 天的通知</p>
                </div>
             </>
         )}
      </div>
    </div>
  )
}
