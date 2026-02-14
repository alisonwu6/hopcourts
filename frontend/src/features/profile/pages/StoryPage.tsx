import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

export function StoryPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white pb-[120px] text-slate-900">
      <ActionToolbar
        onBack={() => navigate(-1)}
        showShare={false}
        showFavorite={false}
        title={<span className="text-lg font-semibold text-slate-900">創立故事</span>}
        contentClassName="max-w-3xl px-4"
        showBack
        borderBottom
      />
      
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="space-y-6 text-base leading-relaxed text-slate-600">
          <p>
           嗨！ 我們是 SportsMatch，一個讓你輕鬆找到運動夥伴的平台。
          </p>
          <p>
            在繁忙的都市生活中，要找到時間、地點以及程度相近的運動夥伴並不容易。
            我們希望能透過科技的力量，讓每一個人都能輕鬆找到屬於自己的運動圈，
            不再讓找不到人成為運動的阻礙。
          </p>
          <p>
            我們相信，運動不僅僅是鍛鍊身體，更是連結人與人之間最純粹的方式。
            每一次的擊掌、每一次的互動，都在建立真實的連結。
          </p>
        </div>
      </div>
    </div>
  )
}
