import MainLayout from '@/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function MapView() {
  return (
    <MainLayout
      title="Map view"
      description="Scan upcoming sessions by suburb and vibe."
      actions={<Button variant="outline" size="sm">Filters</Button>}
      contentWidth="xl"
    >
      <section className="space-y-4">
        <Card className="border border-slate-200">
          <CardContent className="h-[420px] rounded-lg border border-dashed border-slate-300 bg-slate-100 p-6 text-center text-sm text-slate-500">
            Interactive map coming soon. We’ll show pins for every open session.
          </CardContent>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {['South Bank', 'Fortitude Valley', 'West End', 'Kangaroo Point'].map((suburb) => (
            <Card
              key={suburb}
              className="border border-slate-200"
            >
              <CardContent className="p-4 text-sm text-slate-600">
                <div className="text-sm font-semibold text-slate-900">{suburb}</div>
                <p className="text-xs text-slate-500">2 sessions live · 1 starting soon</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MainLayout>
  )
}
