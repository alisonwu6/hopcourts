import clsx from 'clsx'
import type { ChangeEvent, FormEvent, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { useMemo, useState, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SKILL_LEVEL_LABELS } from '@/data/mock/events'
import { useGamesStore } from '@/hooks'
import { ActionToolbar } from '@/components/navigation/ActionToolbar'

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
  duration: string
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
  duration: '90',
  location: '',
  capacity: '10',
  priceNote: 'Pay on site',
  skillLevel: 'mixed',
  description: '',
  notes: '',
}

export default function CreateGame() {
  const navigate = useNavigate()
  const createGame = useGamesStore((state) => state.createGame)
  const [form, setForm] = useState<FormState>(initialState)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [heroPreview, setHeroPreview] = useState<string>('')

  const canSubmit = useMemo(() => {
    return Boolean(
      form.title.trim() &&
      form.sport.trim() &&
      form.startTime &&
      Number(form.duration) > 0 &&
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
      navigate('/home')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || isSubmitting) return

    const duration = Number(form.duration)
    const capacity = Number(form.capacity)
    const startDate = new Date(form.startTime)

    if (Number.isNaN(startDate.getTime())) {
      setError('Please choose a valid start date and time.')
      return
    }
    if (Number.isNaN(duration) || duration <= 0) {
      setError('Duration must be a positive number.')
      return
    }
    if (Number.isNaN(capacity) || capacity <= 0) {
      setError('Capacity must be a positive number.')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const game = await createGame({
        title: form.title.trim(),
        sport: form.sport.trim(),
        description: form.description.trim() || undefined,
        skillLevel: form.skillLevel,
        startTime: startDate,
        duration,
        maxAttendees: capacity,
        location: {
          lat: null,
          lng: null,
          address: form.location.trim(),
          instructions: [form.priceNote.trim(), form.notes.trim()].filter(Boolean).join('\n\n') || undefined,
        },
        isFree: true,
        tags: [],
        difficulty: SKILL_LEVEL_ORDER[form.skillLevel] ?? 2,
      })

      navigate(`/game/${game.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create game.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 pb-16">
      <ActionToolbar
        onBack={handleCancel}
        onToggleFavorite={() => setIsFavorite((prev) => !prev)}
        isFavorite={isFavorite}
        showFavorite={false}
        showShare={false}
        backLabel="Cancel"
        contentClassName="w-full max-w-3xl px-4 sm:px-6"
      />
      <form
        id="game-form"
        className="mx-auto mt-6 w-full max-w-3xl space-y-4 px-4 pb-8 sm:px-6"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm">
            {error}
          </div>
        )}

        <section className="space-y-8 rounded-[32px] border border-slate-100 bg-white shadow-[0_24px_60px_rgba(15,41,77,0.12)] px-6 py-8 sm:px-8">
          <CoverUploader previewUrl={heroPreview} onChange={handleImageChange} />

          <FieldSection title="Game basics" description="Start with the essentials players see first.">
            <FloatingField
              label="Title"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              required
            />
            <FloatingField
              label="Sport"
              name="sport"
              value={form.sport}
              onChange={handleInputChange}
              required
            />
            <SkillSelector selected={form.skillLevel} onSelect={handleSkillSelect} />
          </FieldSection>

          <FieldSection title="Schedule & logistics" description="Set when and where your group will meet.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FloatingField
                label="Date & start time"
                name="startTime"
                type="datetime-local"
                value={form.startTime}
                onChange={handleInputChange}
                required
              />
              <FloatingField
                label="Duration (minutes)"
                name="duration"
                type="number"
                min={15}
                value={form.duration}
                onChange={handleInputChange}
                required
              />
            </div>
            <FloatingField
              label="Location"
              name="location"
              value={form.location}
              onChange={handleInputChange}
              required
              supportingText="Share the exact venue or meeting landmark."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FloatingField
                label="Payment info"
                name="priceNote"
                value={form.priceNote}
                onChange={handleInputChange}
                supportingText="e.g. Pay on site, $15 via app, etc."
              />
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

          <FieldSection title="Tell players what to expect" description="Describe the vibe, goals, and any special notes.">
            <FloatingField
              as="textarea"
              label="Description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleInputChange}
              supportingText="Introduce yourself, the plan, or any warm-up ideas."
            />
            <FloatingField
              as="textarea"
              label="Notes for attendees"
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleInputChange}
              supportingText="Visible only to people who join (e.g. gear to bring, host requests)."
            />
          </FieldSection>
        </section>
      </form>

      <ActionBar canSubmit={canSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}

function ActionBar({ canSubmit, isSubmitting }: { canSubmit: boolean; isSubmitting: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-blue-50/95 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-4 shadow-[0_-10px_30px_rgba(30,64,175,0.12)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 sm:px-6">
        <Button
          variant="outline"
          size="sm"
          type="button"
          disabled
          className="flex-1 rounded-full border-blue-200 text-blue-500"
        >
          Draft
        </Button>
        <Button
          size="sm"
          type="submit"
          form="game-form"
          disabled={!canSubmit || isSubmitting}
          className="flex-1 rounded-full px-6"
        >
          {isSubmitting ? 'Publishing…' : 'Publish'}
        </Button>
      </div>
    </div>
  )
}

function FieldSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
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

function SkillSelector({ selected, onSelect }: { selected: SkillLevelKey; onSelect: (level: SkillLevelKey) => void }) {
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

function CoverUploader({ previewUrl, onChange }: { previewUrl?: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4">
      <label className="flex h-52 cursor-pointer flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-slate-300 bg-white text-center text-sm text-slate-500 transition hover:border-blue-300">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="h-full w-full rounded-[20px] object-cover" />
        ) : (
          <>
            <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">Cover photo</div>
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
    } & InputHTMLAttributes<HTMLInputElement> & CommonFloatingProps)
  | ({
      as: 'textarea'
    } & TextareaHTMLAttributes<HTMLTextAreaElement> & CommonFloatingProps)

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
      ? props.value ?? ''
      : 'defaultValue' in props
        ? (props.defaultValue as string | number | readonly string[] | undefined) ?? ''
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
    const { as: _as, className, rows = 4, ...rest } = props as Extract<FloatingFieldProps, { as: 'textarea' }>
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

  const { as: _as, className, type = 'text', ...rest } = props as Extract<FloatingFieldProps, { as?: 'input' }>
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
