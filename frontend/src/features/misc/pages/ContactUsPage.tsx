import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  UserCircle2,
  HelpCircle,
  Check,
} from 'lucide-react'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { feedbackService } from '@/services/feedbackService'

type FeedbackType = 'issue' | 'feature' | 'account' | 'other'

const feedbackTypes: { value: FeedbackType; label: string; icon: any }[] = [
  { value: 'issue', label: '回報問題', icon: AlertCircle },
  { value: 'feature', label: '功能建議', icon: Lightbulb },
  { value: 'account', label: '帳號相關', icon: UserCircle2 },
  { value: 'other', label: '其他', icon: HelpCircle },
]

export function ContactUsPage() {
  const navigate = useNavigate()
  const [type, setType] = useState<FeedbackType>('issue')
  const [content, setContent] = useState('')
  const [allowReply, setAllowReply] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const getPlaceholder = (feedbackType: FeedbackType) => {
    switch (feedbackType) {
      case 'issue':
        return '請描述你遇到的問題，包含發生了什麼？\n你在做什麼時看到這個問題？'
      case 'feature':
        return '請描述你希望哪個地方可以更好？\n為什麼對你有幫助？'
      case 'account':
        return '請描述你的帳號問題'
      default:
        return '請詳細描述您遇到的問題或建議...'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      setIsSubmitting(true)

      await feedbackService.create({
        type,
        message: content,
        allow_reply: allowReply,
        page: window.location.pathname,
        meta: {
          userAgent: navigator.userAgent,
        },
      })

      setIsSubmitting(false)
      setIsSuccess(true)
    } catch (error) {
      console.error(error)
      setIsSubmitting(false)
      // Ideally show toast here
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white">
        <ActionToolbar title="寫信給我們" onBack={() => navigate(-1)} showBack borderBottom />
        <div className="flex h-[80vh] flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">感謝您的回饋！</h2>
          <p className="mb-8 text-slate-600">
            我們已經收到您的訊息，
            <br />
            團隊將會盡快查看並處理。
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full max-w-xs rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
          >
            返回設定
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-safe min-h-screen bg-slate-50">
      <ActionToolbar
        title="寫信給我們"
        onBack={() => navigate(-1)}
        showBack
        borderBottom
        className="bg-white"
      />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Feedback Type Selection */}
          <div className="space-y-3">
            <label className="text-base font-bold text-slate-900">信件類型</label>
            <div className="mt-2 grid grid-cols-1 gap-3">
              {feedbackTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                    type === value
                      ? 'border-2 border-emerald-500 bg-emerald-50 font-bold text-emerald-700 shadow-sm'
                      : 'border border-slate-200 bg-white font-medium text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${type === value ? 'text-emerald-600' : 'text-slate-400'}`}
                  />
                  {label}
                  {type === value && <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-3">
            <label htmlFor="content" className="text-base font-bold text-slate-900">
              內容描述
            </label>
            <div className="relative mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={getPlaceholder(type)}
                className="h-48 w-full resize-none border-none bg-transparent p-0 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 px-1">
            <button
              type="button"
              role="checkbox"
              aria-checked={allowReply}
              onClick={() => setAllowReply(!allowReply)}
              className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                allowReply
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {allowReply && <Check size={14} strokeWidth={3} />}
            </button>
            <label
              className="cursor-pointer select-none text-sm text-slate-600"
              onClick={() => setAllowReply(!allowReply)}
            >
              允許官方透過 Email 聯繫我以釐清問題
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-4 text-lg font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {isSubmitting ? (
              '傳送中...'
            ) : (
              <>
                <Send className="h-5 w-5" />
                送出回饋
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
