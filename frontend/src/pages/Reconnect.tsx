import MainLayout from '@/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCopy } from '@/i18n/LanguageProvider'

const suggestions = ['Bo', 'Chen', 'Dana']

export default function Reconnect() {
  const copy = useCopy()

  return (
    <MainLayout
      title={copy.reconnect.title}
      description={copy.reconnect.description}
      contentWidth="md"
    >
      <section className="space-y-4">
        <Card className="border border-slate-200">
          <CardContent className="space-y-3 p-6 text-sm text-slate-600">
            <p>{copy.reconnect.prompt}</p>
            <div className="flex gap-2">
              <Button variant="secondary">{copy.common.greatEnergy}</Button>
              <Button variant="outline">{copy.common.couldBeBetter}</Button>
            </div>
            <textarea
              rows={3}
              placeholder={copy.reconnect.placeholder}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="flex justify-end">
              <Button size="sm">{copy.common.sendFeedback}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="space-y-3 p-6">
            <div className="text-sm font-semibold text-slate-900">{copy.reconnect.peopleYouMayAdd}</div>
            <ul className="grid gap-2 text-sm">
              {suggestions.map((name) => (
                <li
                  key={name}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                >
                  <span>{name}</span>
                  <Button size="sm">{copy.common.addToSquad}</Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  )
}
