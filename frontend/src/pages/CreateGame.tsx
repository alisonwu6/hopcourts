import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '@/components/ui/Input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SKILL_LEVEL_LABELS } from '@/data/mock/events'
import { useGamesStore } from '@/hooks'
import { fetchSports, type SportOption } from '@/services'

type SkillLevelKey = keyof typeof SKILL_LEVEL_LABELS

const VIBE_TAGS = ['Beginner friendly', 'Competitive', 'Social', 'Coffee after']
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
  skillLevel: 'mixed',
  description: '',
  notes: '',
}

export default function CreateGame() {
  const navigate = useNavigate()
  const createGame = useGamesStore((state) => state.createGame)
  const [form, setForm] = useState<FormState>(initialState)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sportOptions, setSportOptions] = useState<SportOption[]>([])
  const [sportsError, setSportsError] = useState<string | null>(null)
  const [isLoadingSports, setIsLoadingSports] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadSports() {
      try {
        const options = await fetchSports()
        if (!isMounted) return
        setSportOptions(options)
      } catch (err) {
        if (!isMounted) return
        const message = err instanceof Error ? err.message : 'Failed to load sports.'
        setSportsError(message)
      } finally {
        if (isMounted) setIsLoadingSports(false)
      }
    }
    void loadSports()
    return () => {
      isMounted = false
    }
  }, [])

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

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    if (name === 'skillLevel') {
      setForm((prev) => ({ ...prev, skillLevel: value as SkillLevelKey }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/home')
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    )
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
          instructions: form.notes.trim() || undefined,
        },
        isFree: true,
        tags: selectedTags,
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
    <div className="min-h-screen bg-blue-50 pb-32">
      <div className="sticky top-[80px] z-40 bg-white/95 backdrop-blur shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="border-t border-blue-100">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
            <div className="flex h-[58px] items-center gap-3 text-sm font-semibold text-slate-500">
              <button
                type="button"
                onClick={handleCancel}
                className="transition hover:text-slate-800"
              >
                ← Cancel
              </button>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled
                  className="rounded-full border-blue-200 text-blue-500"
                >
                  Preview
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  form="game-form"
                  disabled={!canSubmit || isSubmitting}
                  className="rounded-full px-6"
                >
                  {isSubmitting ? 'Publishing…' : 'Publish'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form
        id="game-form"
        className="mx-auto mt-6 w-full max-w-3xl space-y-4 px-4 sm:px-6"
        onSubmit={handleSubmit}
      >
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm">
            {error}
          </div>
        )}

        <section className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_24px_60px_rgba(15,41,77,0.12)]">
          <div className="space-y-8 px-6 py-8 sm:px-8">
            <header className="space-y-3">
              <div className="space-y-3">
                <Input
                  label="Title"
                  name="title"
                  placeholder="Sunrise tempo run"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="h-12 rounded-2xl border-slate-200 bg-blue-50/40 text-lg font-semibold text-slate-900"
                />
                <label className="grid gap-2 text-sm text-slate-600">
                  Sport
                  {sportOptions.length > 0 ? (
                    <select
                      name="sport"
                      value={form.sport}
                      onChange={handleChange}
                      className="h-12 rounded-2xl border border-slate-200 bg-blue-50/30 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      required
                    >
                      <option value="">Choose a sport</option>
                      {sportOptions.map((sport) => (
                        <option key={sport.id} value={sport.name}>
                          {sport.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      label={undefined}
                      name="sport"
                      placeholder="Running"
                      value={form.sport}
                      onChange={handleChange}
                      disabled={isLoadingSports}
                      required
                      className="h-12 rounded-2xl border-slate-200 bg-blue-50/30"
                    />
                  )}
                  <span className="text-xs text-slate-500">
                    Keep it specific so the right players can find you.
                  </span>
                  {sportsError && (
                    <span className="text-xs text-red-600">Unable to load sports — using manual entry.</span>
                  )}
                </label>
              </div>
            </header>

            <div className="space-y-4 rounded-[24px] border border-slate-100 bg-blue-50/40 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Date & start time"
                  name="startTime"
                  type="datetime-local"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                  className="rounded-2xl border-slate-200 bg-white"
                />
                <Input
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  min="15"
                  placeholder="90"
                  value={form.duration}
                  onChange={handleChange}
                  required
                  className="rounded-2xl border-slate-200 bg-white"
                />
              </div>
              <Input
                label="Location"
                name="location"
                placeholder="New Farm Park Riverside"
                value={form.location}
                onChange={handleChange}
                required
                className="rounded-2xl border-slate-200 bg-white"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  placeholder="10"
                  value={form.capacity}
                  onChange={handleChange}
                  required
                  className="rounded-2xl border-slate-200 bg-white"
                />
                <label className="grid gap-2 text-sm text-slate-600">
                  <span className="flex items-center justify-between">
                    <span>Skill level</span>
                    <span className="text-xs font-semibold text-blue-600">All levels welcome</span>
                  </span>
                  <select
                    name="skillLevel"
                    value={form.skillLevel}
                    onChange={handleChange}
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {Object.entries(SKILL_LEVEL_LABELS).map(([level, label]) => (
                      <option key={level} value={level}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-500">
                    Leave it on mixed if everyone&rsquo;s invited.
                  </span>
                </label>
              </div>
            </div>

            <label className="grid gap-2 text-sm text-slate-600">
              Description
              <textarea
                name="description"
                rows={4}
                value={form.description}
                placeholder="Outline the vibe, meeting spot, and any warm up plans..."
                className="rounded-2xl border border-slate-200 bg-blue-50/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                onChange={handleChange}
              />
            </label>

            <div className="space-y-3">
              <div>
                <p className="text-base font-semibold text-slate-900">Game vibe</p>
                <p className="text-sm text-slate-500">Tag your game so the right athletes can discover it.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                {VIBE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag)
                  return (
                    <Badge
                      key={tag}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => toggleTag(tag)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          toggleTag(tag)
                        }
                      }}
                      variant="outline"
                      className={`cursor-pointer rounded-full border px-3 py-1 text-sm font-medium transition ${
                        isSelected
                          ? 'border-player-500 bg-player-50 text-player-700 shadow-[0_6px_16px_rgba(30,144,255,0.15)]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-player-200 hover:text-player-700'
                      }`}
                    >
                      {tag}
                    </Badge>
                  )
                })}
              </div>
              <label className="grid gap-2 text-sm text-slate-600">
                Notes for attendees
                <textarea
                  name="notes"
                  rows={3}
                  value={form.notes}
                  placeholder="Anything they should bring or know before the game?"
                  className="rounded-2xl border border-slate-200 bg-blue-50/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  onChange={handleChange}
                />
                <span className="text-xs text-slate-500">Visible only to people who join.</span>
              </label>
            </div>
          </div>
        </section>
      </form>
    </div>
  )
}
