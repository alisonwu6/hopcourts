import { useNavigate } from 'react-router-dom'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

export function UsageRulesPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white pb-[120px] text-slate-900">
      <ActionToolbar
        onBack={() => navigate(-1)}
        showShare={false}
        showFavorite={false}
        title={<span className="text-lg font-semibold text-slate-900">使用規範</span>}
        contentClassName="max-w-3xl px-4"
        showBack
        borderBottom
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">SportsMatch 使用規範</h1>

        <div className="space-y-8 text-base leading-relaxed text-slate-600">
          <section>
            <p className="mb-4">
              歡迎來到 SportsMatch。這是一個讓人可以輕鬆揪團的運動服務平台。
              為了讓每個人都能自在、安全地參與活動，請遵守以下原則：
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-slate-900">1. 真實與尊重</h2>
            <p>
              請以真實身份參與活動，並以尊重、平等的態度與他人互動。
              騷擾、歧視、攻擊或不當言行，將可能導致帳號限制或終止。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-slate-900">2. 自主與安全</h2>
            <p>
              所有活動由用戶自行發起與參與。請在報名前自行評估身體狀況與安全風險。
              如有身體不適或特殊健康狀況，建議先諮詢專業醫療意見。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-slate-900">3. 活動責任</h2>
            <p>
              活動內容、時間與場地安排由發起人負責。請參與者自行確認活動細節。 SportsMatch
              不參與或介入活動實際運作。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-slate-900">4. 場地與費用</h2>
            <p>
              前往場地前，請務必確認場地是否為運動場館或是公共運動空間，提升自身安全。
              場地規則與收費標準以場地方規定為準。請於活動前確認相關資訊。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-slate-900">5. 再連結與隱私</h2>
            <p>「一起動過」的紀錄僅代表曾同場活動。請尊重彼此隱私，勿進行不當聯繫或騷擾。</p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-slate-900">6. 帳號管理</h2>
            <p>若發現違規行為，我們有權暫停或終止帳號使用權。</p>
          </section>
        </div>
      </div>
    </div>
  )
}
