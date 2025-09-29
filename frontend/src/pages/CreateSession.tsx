import MainLayout from '@/layouts/MainLayout'
import Input from '@/components/ui/Input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCopy } from '@/i18n/LanguageProvider'

export default function CreateSession() {
  const copy = useCopy()

  return (
    <MainLayout
      title={copy.createSession.title}
      description={copy.createSession.description}
      contentWidth="md"
      actions={
        <Button variant="ghost" size="sm">
          {copy.createSession.saveDraft}
        </Button>
      }
    >
      <form className="space-y-6">
        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{copy.createSession.basicsTitle}</h2>
              <p className="text-sm text-slate-500">
                {copy.createSession.basicsDescription}
              </p>
            </div>
            <Input
              label={copy.createSession.titleLabel}
              placeholder="Sunrise tempo run"
            />
            <Input
              label={copy.createSession.sportLabel}
              placeholder="Running"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={copy.createSession.datetimeLabel}
                type="datetime-local"
              />
              <Input
                label={copy.createSession.durationLabel}
                type="number"
                placeholder="90"
              />
            </div>
            <Input
              label={copy.createSession.locationLabel}
              placeholder="New Farm Park Riverwalk"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={copy.createSession.capacityLabel}
                type="number"
                placeholder="10"
              />
              <label className="grid gap-1 text-sm text-slate-600">
                {copy.createSession.skillLabel}
                <select className="h-10 rounded border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value="">{copy.createSession.skillPlaceholder}</option>
                  {(Object.keys(copy.mockEvents.skillLevels) as Array<keyof typeof copy.mockEvents.skillLevels>).map((level) => (
                    <option
                      key={level}
                      value={level}
                    >
                      {copy.mockEvents.skillLevels[level]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-1 text-sm text-slate-600">
              {copy.createSession.descriptionLabel}
              <textarea
                rows={4}
                placeholder={copy.createSession.descriptionPlaceholder}
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{copy.createSession.vibeTitle}</h2>
              <p className="text-sm text-slate-500">
                {copy.createSession.vibeDescription}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {copy.createSession.vibeTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer rounded-full px-3 py-1"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <label className="grid gap-1 text-sm text-slate-600">
              {copy.createSession.notesLabel}
              <textarea
                rows={3}
                placeholder={copy.createSession.notesPlaceholder}
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <span className="text-xs text-slate-500">{copy.createSession.notesHint}</span>
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline">{copy.createSession.preview}</Button>
          <Button type="submit">{copy.createSession.publish}</Button>
        </div>
      </form>
    </MainLayout>
  )
}
