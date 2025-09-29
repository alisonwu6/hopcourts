import MainLayout from '@/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const suggestions = ['Bo', 'Chen', 'Dana']

export default function Reconnect() {
  return (
    <MainLayout
      title="How was the run?"
      description="Log quick feedback and stay in touch with standouts."
      contentWidth="md"
    >
      <section className="space-y-4">
        <Card className="border border-slate-200">
          <CardContent className="space-y-3 p-6 text-sm text-slate-600">
            <p>Keep your streak strong. Let the host know how it went.</p>
            <div className="flex gap-2">
              <Button variant="secondary">Great energy</Button>
              <Button variant="outline">Could be better</Button>
            </div>
            <textarea
              rows={3}
              placeholder="Anything the host should know for next time?"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="flex justify-end">
              <Button size="sm">Send feedback</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="space-y-3 p-6">
            <div className="text-sm font-semibold text-slate-900">People you may add</div>
            <ul className="grid gap-2 text-sm">
              {suggestions.map((name) => (
                <li
                  key={name}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                >
                  <span>{name}</span>
                  <Button size="sm">Add to squad</Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  )
}
