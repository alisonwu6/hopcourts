import clsx from 'clsx'
import type {
  ChangeEvent,
  FormEvent,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'
import { useMemo, useState, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components'
const SKILL_LEVEL_LABELS = {
  mixed: '不限程度',
  beginner: '初階',
  intermediate: '中階',
  advanced: '進階',
} as const
import { useEventsStore } from '@/features/events/hooks/useEventsStore'
import { useAuthStore } from '@/hooks'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'
import { LoginPromptSheet } from '@/components/LoginPromptSheet'

type SkillLevelKey = keyof typeof SKILL_LEVEL_LABELS

const SKILL_LEVEL_ORDER: Record<SkillLevelKey, 1 | 2 | 3 | 4 | 5> = {
  mixed: 2,
  beginner: 1,
  intermediate: 3,
  advanced: 4,
}

type FormState = {
  title: string
  sport: string
  startTime: string
  endTime: string
  location: string
  capacity: string
  priceNote: string
  skillLevel: SkillLevelKey
  description: string
  notes: string
}

const initialState: FormState = {
  title: '',
  sport: '',
  startTime: '',
  endTime: '',
  location: '',
  capacity: '3',
  priceNote: '現場收費',
  skillLevel: 'mixed',
  description: '',
  notes: '',
}

export default function CreateEventPage() {
  const navigate = useNavigate()
  const createEvent = useEventsStore((state) => state.createEvent)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [form, setForm] = useState<FormState>(initialState)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [heroPreview, setHeroPreview] = useState<string>('')
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const canSubmit = useMemo(() => {
    return Boolean(
      form.title.trim() &&
      form.sport.trim() &&
      form.startTime &&
      form.endTime &&
      Number(form.capacity) > 0 &&
      form.location.trim()
    )
  }, [form])

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    if (name === 'skillLevel') {
      setForm((prev) => ({ ...prev, skillLevel: value as SkillLevelKey }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSkillSelect = (level: SkillLevelKey) => {
    setForm((prev) => ({ ...prev, skillLevel: level }))
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    setHeroPreview(previewUrl)
  }

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || isSubmitting) return
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }

    const capacity = Number(form.capacity)
    const startDate = new Date(form.startTime)
    const endDate = new Date(form.endTime)

    if (Number.isNaN(startDate.getTime())) {
      setError('請選擇有效的開始日期與時間。')
      return
    }
    if (Number.isNaN(endDate.getTime())) {
      setError('請選擇有效的結束日期與時間。')
      return
    }
    if (endDate <= startDate) {
      setError('結束時間需晚於開始時間。')
      return
    }
    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000)
    if (Number.isNaN(durationMinutes) || durationMinutes <= 0) {
      setError('無法計算活動時長，請調整時間。')
      return
    }
    if (Number.isNaN(capacity) || capacity <= 0) {
      setError('人數上限必須大於 0。')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const event = await createEvent({
        title: form.title.trim(),
        sport: form.sport.trim(),
        description: form.description.trim() || undefined,
        skillLevel: form.skillLevel,
        startTime: startDate,
        duration: durationMinutes,
        maxAttendees: capacity,
        location: {
          lat: null,
          lng: null,
          address: form.location.trim(),
          instructions:
            [form.priceNote.trim(), form.notes.trim()].filter(Boolean).join('\n\n') || undefined,
        },
        isFree: true,
        tags: [],
        difficulty: SKILL_LEVEL_ORDER[form.skillLevel] ?? 2,
      })

      navigate(`/event/${event.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : '建立活動失敗。'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-blue-50 pb-16">
        <ActionToolbar
          onBack={handleCancel}
          onToggleFavorite={() => setIsFavorite((prev) => !prev)}
          isFavorite={isFavorite}
          showFavorite={false}
          showShare={false}
          backLabel="取消"
          contentClassName="w-full max-w-3xl px-4 sm:px-6"
        />
        <form
          id="event-form"
          className="mx-auto mt-6 w-full max-w-3xl space-y-4 px-4 pb-8 sm:px-6"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm">
              {error}
            </div>
          )}

          <section className="space-y-8 rounded-[32px] border border-slate-100 bg-white px-6 py-8 shadow-[0_24px_60px_rgba(15,41,77,0.12)] sm:px-8">
            <CoverUploader previewUrl={heroPreview} onChange={handleImageChange} />

            <FieldSection title="活動基本資料" description="先填最重要的資訊，讓大家一眼看懂。">
              <FloatingField
                label="標題"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                required
              />
              <FloatingField
                label="運動項目"
                name="sport"
                value={form.sport}
                onChange={handleInputChange}
                required
              />
              <SkillSelector selected={form.skillLevel} onSelect={handleSkillSelect} />
            </FieldSection>

            <FieldSection title="時間與地點" description="設定集合時間與地點。">
              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingField
                  label="開始時間"
                  name="startTime"
                  type="datetime-local"
                  value={form.startTime}
                  onChange={handleInputChange}
                  required
                />
                <FloatingField
                  label="結束時間"
                  name="endTime"
                  type="datetime-local"
                  value={form.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <FloatingField
                label="地點"
                name="location"
                value={form.location}
                onChange={handleInputChange}
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingField
                  label="Capacity"
                  name="capacity"
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </FieldSection>

            <FieldSection title="告訴大家期待什麼" description="描述氛圍、目標，或注意事項。">
              <FloatingField
                as="textarea"
                label="描述"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleInputChange}
                supportingText="說明活動的氛圍、步調，讓參加者知道會遇到什麼。"
              />
              <FloatingField
                as="textarea"
                label="給參加者的小提醒"
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleInputChange}
                supportingText="只給已報名者的最新通知或重要細節。"
              />
            </FieldSection>
          </section>
        </form>

        <ActionBar canSubmit={canSubmit} isSubmitting={isSubmitting} />
      </div>
      <LoginPromptSheet
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onSignup={() => navigate('/signup')}
      />
    </>
  )
}

function ActionBar({ canSubmit, isSubmitting }: { canSubmit: boolean; isSubmitting: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-blue-50/95 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-4 shadow-[0_-10px_30px_rgba(30,64,175,0.12)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 sm:px-6">
        <Button
          variant="secondary"
          size="sm"
          type="button"
          disabled
          className="flex-1 rounded-full border-blue-200 text-blue-500 hover:bg-blue-50"
        >
          草稿
        </Button>
        <Button
          size="sm"
          type="submit"
          form="event-form"
          disabled={!canSubmit || isSubmitting}
          className="flex-1 rounded-full px-6"
        >
          {isSubmitting ? '發布中…' : '發佈'}
        </Button>
      </div>
    </div>
  )
}

function FieldSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="space-y-4 rounded-[28px] border border-slate-100 bg-slate-50/60 p-4 sm:p-6">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function SkillSelector({
  selected,
  onSelect,
}: {
  selected: SkillLevelKey
  onSelect: (level: SkillLevelKey) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wide text-slate-500">Skill level</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(SKILL_LEVEL_LABELS).map(([level, label]) => {
          const value = level as SkillLevelKey
          const isActive = selected === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              className={clsx(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition',
                isActive
                  ? 'border-blue-500 bg-blue-600 text-white shadow-[0_6px_16px_rgba(30,64,175,0.25)]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CoverUploader({
  previewUrl,
  onChange,
}: {
  previewUrl?: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4">
      <label className="flex h-52 cursor-pointer flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-slate-300 bg-white text-center text-sm text-slate-500 transition hover:border-blue-300">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="h-full w-full rounded-[20px] object-cover"
          />
        ) : (
          <>
            <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              Cover photo
            </div>
            <p>Add an inviting photo (Airbnb-style). Drag or click to upload.</p>
          </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={onChange} />
      </label>
    </div>
  )
}

type FloatingFieldProps =
  | ({
      as?: 'input'
    } & InputHTMLAttributes<HTMLInputElement> &
      CommonFloatingProps)
  | ({
      as: 'textarea'
    } & TextareaHTMLAttributes<HTMLTextAreaElement> &
      CommonFloatingProps)

type CommonFloatingProps = {
  label: string
  supportingText?: string
  characterLimit?: number
}

function FloatingField(props: FloatingFieldProps) {
  const { label, supportingText, characterLimit } = props
  const as = props.as ?? 'input'
  const id = useId()
  const value =
    'value' in props
      ? (props.value ?? '')
      : 'defaultValue' in props
        ? ((props.defaultValue as string | number | readonly string[] | undefined) ?? '')
        : ''
  const hasValue =
    typeof value === 'number'
      ? true
      : Array.isArray(value)
        ? value.length > 0
        : Boolean(value && String(value).trim().length > 0)
  const baseClasses =
    'peer block w-full rounded-[14px] border-2 border-slate-300 bg-white px-4 pt-7 pb-3 text-base text-slate-900 transition focus:border-slate-900 focus:shadow-[0_0_0_1px_rgba(0,0,0,0.2)] focus:outline-none disabled:opacity-60'
  const labelClasses =
    'pointer-events-none absolute left-4 top-2 text-sm font-semibold text-slate-600 bg-white px-1'
  const infoText =
    typeof value === 'string' && characterLimit
      ? `${Math.max(characterLimit - value.length, 0)} characters available`
      : supportingText

  if (as === 'textarea') {
    const {
      as: _as,
      className,
      rows = 4,
      ...rest
    } = props as Extract<FloatingFieldProps, { as: 'textarea' }>
    return (
      <div className="space-y-1">
        <div className="relative">
          <textarea
            {...rest}
            id={id}
            rows={rows}
            placeholder={rest.placeholder ?? ' '}
            data-filled={hasValue}
            className={clsx(baseClasses, 'resize-none', className)}
          />
          <label htmlFor={id} className={labelClasses}>
            {label}
          </label>
        </div>
        {infoText && <p className="text-xs text-slate-500">{infoText}</p>}
      </div>
    )
  }

  const {
    as: _as,
    className,
    type = 'text',
    ...rest
  } = props as Extract<FloatingFieldProps, { as?: 'input' }>
  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          {...rest}
          id={id}
          type={type}
          placeholder={rest.placeholder ?? ' '}
          data-filled={hasValue}
          className={clsx(baseClasses, className)}
        />
        <label htmlFor={id} className={labelClasses}>
          {label}
        </label>
      </div>
      {infoText && <p className="text-xs text-slate-500">{infoText}</p>}
    </div>
  )
}
