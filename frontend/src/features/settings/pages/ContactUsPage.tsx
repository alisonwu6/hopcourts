import { useState, type ChangeEvent } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/hooks'
import { Send, CheckCircle2, Check, ImagePlus, X, ChevronDown } from 'lucide-react'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { feedbackService } from '@/services/feedbackService'
import { uploadService } from '@/features/events/services/uploadService'
import { convertFileToWebP } from '@/utils/imageUtils'

type FeedbackType = 'issue' | 'feature' | 'account' | 'other'

const feedbackTypes: { value: FeedbackType; label: string }[] = [
  { value: 'other', label: 'Share feedback' },
  { value: 'issue', label: 'Report an issue' },
  { value: 'feature', label: 'Request a feature' },
  { value: 'account', label: 'Account related' },
]

const validTypes: FeedbackType[] = ['issue', 'feature', 'account', 'other']
const MAX_IMAGES = 3
const MAX_BYTES = 5 * 1024 * 1024

export function ContactUsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStore((s) => ({ isAuthenticated: s.isAuthenticated }))
  const [searchParams] = useSearchParams()

  const handleBack = () => {
    if (location.key !== 'default') {
      navigate(-1)
    } else {
      navigate('/settings')
    }
  }
  const paramType = searchParams.get('type')
  const [type, setType] = useState<FeedbackType>(
    validTypes.includes(paramType as FeedbackType) ? (paramType as FeedbackType) : 'issue'
  )
  const [content, setContent] = useState('')
  const [allowReply, setAllowReply] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [guestEmail, setGuestEmail] = useState('')

  const getPlaceholder = (feedbackType: FeedbackType) => {
    switch (feedbackType) {
      case 'issue':
        return 'Describe the issue.\nWhat happened and what were you doing at the time?'
      case 'feature':
        return "Tell us what you'd like to improve, and why it would make a difference."
      case 'account':
        return 'Tell us about your account issue.'
      default:
        return 'Share your thoughts in detail...'
    }
  }

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files ?? [])
    if (!rawFiles.length) return

    setPhotoError(null)

    const remaining = MAX_IMAGES - imageFiles.length
    if (remaining <= 0) {
      setPhotoError(`You can upload up to ${MAX_IMAGES} photos.`)
      e.target.value = ''
      return
    }

    const filesToProcess = rawFiles.slice(0, remaining)
    const results: File[] = []

    for (const file of filesToProcess) {
      let processed: File
      try {
        processed = await convertFileToWebP(file)
        if (processed.size > MAX_BYTES) {
          processed = await convertFileToWebP(file, 1280, 0.7)
        }
      } catch {
        processed = file
      }

      if (processed.size > MAX_BYTES) {
        const mb = (processed.size / 1024 / 1024).toFixed(1)
        setPhotoError(`Photo is too large (${mb} MB). Please use a photo under 5 MB.`)
        e.target.value = ''
        return
      }

      results.push(processed)
    }

    setImagePreviews((prev) => [...prev, ...results.map((f) => URL.createObjectURL(f))])
    setImageFiles((prev) => [...prev, ...results])
    e.target.value = ''
  }

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setPhotoError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      setIsSubmitting(true)

      const uploadedUrls = await Promise.all(imageFiles.map((f) => uploadService.uploadFeedbackImage(f)))

      await feedbackService.create({
        type,
        message: content,
        allow_reply: isAuthenticated ? allowReply : !!guestEmail.trim(),
        images: uploadedUrls,
        guest_email: !isAuthenticated && guestEmail.trim() ? guestEmail.trim() : undefined,
        page: window.location.pathname,
        meta: { userAgent: navigator.userAgent },
      })

      setIsSuccess(true)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-[100dvh] bg-white">
        <ActionToolbar
          title="Contact Us"
          onBack={handleBack}
          showBack
          borderBottom
        />
        <div className="flex h-[80vh] flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Thanks for your feedback!</h2>
          <p className="mb-8 text-slate-600">We've received your message and our team will review it shortly.</p>
          <button
            onClick={() => navigate('/events')}
            className="bg-ocean max-w-xs cursor-pointer rounded-full px-6 py-3 font-semibold text-white"
          >
            Explore Events
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-safe min-h-[100dvh] bg-white">
      <ActionToolbar
        title="Contact Us"
        onBack={handleBack}
        showBack
        borderBottom
        className="bg-white"
      />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-3">
            <label
              htmlFor="feedback-type"
              className="mb-2 inline-block text-base font-bold text-slate-900"
            >
              Feedback Type
            </label>
            <div className="relative">
              <select
                id="feedback-type"
                value={type}
                onChange={(e) => setType(e.target.value as FeedbackType)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-base font-semibold text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none"
              >
                {feedbackTypes.map(({ value, label }) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="content"
              className="text-base font-bold text-slate-900"
            >
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

          <div className="space-y-3">
            <label className="text-base font-bold text-slate-900">
              Photos <span className="text-sm font-normal text-slate-400">— optional, up to 3</span>
            </label>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/50 p-2">
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((src, idx) => (
                  <div
                    key={src}
                    className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-100 shadow-sm"
                  >
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < MAX_IMAGES && (
                  <label className="group relative box-border flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-white p-2 transition">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <ImagePlus className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500">Add Photo</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>
            {photoError && <p className="text-xs text-red-500">{photoError}</p>}
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 px-1">
              <button
                type="button"
                role="checkbox"
                aria-checked={allowReply}
                onClick={() => setAllowReply(!allowReply)}
                className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${allowReply ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'}`}
              >
                {allowReply && (
                  <Check
                    size={14}
                    strokeWidth={3}
                  />
                )}
              </button>
              <label
                className="cursor-pointer select-none text-sm text-slate-600"
                onClick={() => setAllowReply(!allowReply)}
              >
                Allow HopCourts to contact me by email for follow-up
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <label
                htmlFor="guest-email"
                className="text-base font-bold text-slate-900"
              >
                Your email <span className="text-sm font-normal text-slate-400">(optional — so we can follow up)</span>
              </label>
              <input
                id="guest-email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 shadow-sm placeholder:font-normal placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="bg-ocean hover:bg-ocean-600 flex items-center justify-center gap-2 rounded-full px-10 py-3 text-lg font-bold text-white shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
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
          </div>
        </form>
      </main>
    </div>
  )
}
