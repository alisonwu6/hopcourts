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
  { value: 'issue', label: 'Report an issue', icon: AlertCircle },
  { value: 'feature', label: 'Feature suggestion', icon: Lightbulb },
  { value: 'account', label: 'Account related', icon: UserCircle2 },
  { value: 'other', label: 'Other', icon: HelpCircle },
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
        return 'Describe the issue.\nWhat happened and what were you doing at the time?'
      case 'feature':
        return 'Tell us what you\'d like to improve, and why it would make a difference.'
      case 'account':
        return 'Tell us about your account issue.'
      default:
        return 'Share your thoughts in detail...'
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
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white">
        <ActionToolbar title="Contact Us" onBack={() => navigate(-1)} showBack borderBottom />
        <div className="flex h-[80vh] flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Thanks for your feedback!</h2>
          <p className="mb-8 text-slate-600">
            We've received your message and our team will review it shortly.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full max-w-xs rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
          >
            Back to Settings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-safe min-h-screen bg-slate-50">
      <ActionToolbar
        title="Contact Us"
        onBack={() => navigate(-1)}
        showBack
        borderBottom
        className="bg-white"
      />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-base font-bold text-slate-900">Feedback Type</label>
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

          <div className="space-y-3">
            <label htmlFor="content" className="text-base font-bold text-slate-900">
              Details
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
              Allow HopCourts to contact me by email for follow-up
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-4 text-lg font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {isSubmitting ? (
              'Sending...'
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
