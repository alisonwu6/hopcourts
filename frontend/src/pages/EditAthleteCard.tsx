import { FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AthleteCard } from '@/components/athlete/AthleteCard'
import { useCopy } from '@/i18n/LanguageProvider'
import clsx from 'clsx'
import { mockAthlete } from '@/mocks/athlete'
import type { AthleteCardProps } from '@/interfaces/athlete'

type FormState = {
  displayName: string
  location: string
  level: string
  sports: string[]
  strengths: string[]
  badges: string[]
}

const MAX_SPORTS = 3
const MAX_STRENGTHS = 3
const MAX_BADGES = 3

export default function EditAthleteCard() {
  const copy = useCopy()
  const navigate = useNavigate()

  const [state, setState] = useState<FormState>({
    displayName: copy.myProfile.name,
    location: copy.athleteCard.location,
    level: copy.athleteCard.levelValue,
    sports: copy.athleteCard.sports,
    strengths: copy.athleteCard.strengths,
    badges: copy.athleteCard.badges,
  })
  const [saving, setSaving] = useState(false)
  const [savedStamp, setSavedStamp] = useState<number | null>(null)

  const resetSaved = () => setSavedStamp(null)

  const toggleItem = (value: string, key: 'sports' | 'strengths' | 'badges', limit: number) => {
    resetSaved()
    setState((prev) => {
      const nextValues = prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : prev[key].length >= limit
          ? prev[key]
          : [...prev[key], value]

      return {
        ...prev,
        [key]: nextValues,
      }
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return

    setSaving(true)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    // Simulate persistence.
    window.setTimeout(() => {
      setSavedStamp(Date.now())
      setSaving(false)
      navigate('/me')
    }, 1000)
  }

  const handleCancel = () => {
    navigate('/me')
  }

  return (
    <div className="min-h-screen bg-[#F3F7FB] pb-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-4 sm:px-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-[#051333]">{copy.athleteCard.editFabLabel}</h1>
          <p className="text-sm text-[#405070]">{copy.myProfile.description}</p>
        </header>

        <div className="space-y-5">
          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >
          <Card className="rounded-3xl border border-[#cfe3fb] bg-white/95 shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">{copy.myProfile.basicsTitle}</h2>
                <p className="text-xs text-slate-500">{copy.myProfile.basicsDescription}</p>
              </div>
              <div className="space-y-3">
                <label className="flex flex-col gap-1 text-sm text-slate-700">
                  {copy.myProfile.displayName}
                  <input
                    value={state.displayName}
                    onChange={(event) => {
                      resetSaved()
                      setState((prev) => ({ ...prev, displayName: event.target.value }))
                    }}
                    placeholder={copy.myProfile.displayName}
                    className="h-10 rounded-full border border-slate-200 px-4 text-sm text-slate-700 focus:border-[var(--color-primary)] focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-700">
                  {copy.myProfile.suburb}
                  <input
                    value={state.location}
                    onChange={(event) => {
                      resetSaved()
                      setState((prev) => ({ ...prev, location: event.target.value }))
                    }}
                    placeholder={copy.myProfile.location}
                    className="h-10 rounded-full border border-slate-200 px-4 text-sm text-slate-700 focus:border-[var(--color-primary)] focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-700">
                  {copy.athleteCard.levelLabel}
                  <select
                    value={state.level}
                    onChange={(event) => {
                      resetSaved()
                      setState((prev) => ({ ...prev, level: event.target.value }))
                    }}
                    className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-[var(--color-primary)] focus:outline-none"
                  >
                    {copy.myProfile.levelOptions.map((option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-[#cfe3fb] bg-white/95 shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">{copy.myProfile.sportsTitle}</h2>
                <p className="text-xs text-slate-500">{copy.myProfile.sportsHint}</p>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {copy.myProfile.sportOptions.map((sport) => {
                    const isActive = state.sports.includes(sport)
                    return (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => toggleItem(sport, 'sports', MAX_SPORTS)}
                        className={clsx(
                          'rounded-full border px-3 py-1 text-xs transition',
                          isActive
                            ? 'border-transparent bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        )}
                      >
                        {sport}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">{copy.myProfile.strengthsTitle}</p>
                <p className="text-xs text-slate-500">{copy.myProfile.strengthsHint}</p>
                <div className="flex flex-wrap gap-2">
                  {copy.myProfile.strengthOptions.map((strength) => {
                    const isActive = state.strengths.includes(strength)
                    return (
                      <button
                        key={strength}
                        type="button"
                        onClick={() => toggleItem(strength, 'strengths', MAX_STRENGTHS)}
                        className={clsx(
                          'rounded-full border px-3 py-1 text-xs transition',
                          isActive
                            ? 'border-transparent bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        )}
                      >
                        {strength}
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-[#cfe3fb] bg-white/95 shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">{copy.myProfile.badgesTitle}</h2>
                <p className="text-xs text-slate-500">{copy.myProfile.badgesHint}</p>
              </div>
              <div className="space-y-3">
                {copy.myProfile.badgeOptions.map((badge) => {
                  const isActive = state.badges.includes(badge.label)
                  return (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => toggleItem(badge.label, 'badges', MAX_BADGES)}
                      className={clsx(
                        'flex w-full items-start justify-between rounded-2xl border px-4 py-3 text-left transition',
                        isActive
                          ? 'border-transparent bg-amber-50 text-amber-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      )}
                    >
                      <span>
                        <span className="block text-sm font-medium text-slate-800">{badge.label}</span>
                        <span className="block text-xs text-slate-500">{badge.description}</span>
                      </span>
                      <span className={clsx(
                        'mt-1 h-2 w-2 rounded-full',
                        isActive ? 'bg-[var(--color-secondary)]' : 'bg-slate-300'
                      )} />
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-full"
            >
              {saving ? copy.myProfile.savingLabel : copy.myProfile.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="rounded-full"
            >
              {copy.myProfile.cancel}
            </Button>
            {savedStamp && !saving && (
              <span className="self-center text-xs text-emerald-600">
                {copy.myProfile.savedMessage}
              </span>
            )}
          </div>
        </form>
        {savedStamp && !saving && (
          <p className="text-sm text-emerald-600">{copy.myProfile.savedMessage}</p>
        )}
        </div>
      </div>
    </div>
  )
}
