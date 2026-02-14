import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Smile } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { api } from '@/api/client'
import { useCities } from '@/features/dictionaries/hooks'

export function TeammatesPage() {
  const navigate = useNavigate()
  const { items: citiesCatalog } = useCities()
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.profiles.getTeammates()
      .then((res) => {
        setList(res.data || [])
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const getCityLabel = (key: string) => {
    return citiesCatalog.find((c) => c.key === key)?.label || key
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="sticky top-0 z-10 flex items-center justify-center relative border-b border-slate-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-2 rounded-full p-2 text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <span className="text-lg font-bold text-slate-900">我的運動圈</span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {loading ? (
          <div className="text-center text-sm text-slate-400 py-10">載入中...</div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <p>還沒有我的運動圈</p>
            <p className="text-xs mt-1">只要參加過同一場活動，就會出現在這裡</p>
          </div>
        ) : (
          list.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/mate/${item.username}`)}
              className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition active:scale-[0.98]"
            >
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
                {item.avatar_url ? (
                  <img src={item.avatar_url} alt={item.display_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <Smile className="h-6 w-6" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="truncate font-bold text-slate-900">{item.display_name}</div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" />
                  <span>{getCityLabel(item.city_key)}</span>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-slate-900">
                  共 {item.sessions_count} 場
                </div>
                <div className="text-xs text-slate-400">
                  {item.last_played_at
                    ? formatDistanceToNow(new Date(item.last_played_at), { addSuffix: true, locale: zhTW })
                    : ''}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
