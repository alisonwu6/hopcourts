import MainLayout from '@/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCopy } from '@/i18n/LanguageProvider'

export default function MapView() {
  const copy = useCopy()

  return (
    <MainLayout
      title={copy.mapView.title}
      description={copy.mapView.description}
      actions={<Button variant="outline" size="sm">{copy.common.filters}</Button>}
      contentWidth="xl"
    >
      <section className="space-y-4">
        <Card className="border border-slate-200">
          <CardContent className="h-[420px] rounded-lg border border-dashed border-slate-300 bg-slate-100 p-6 text-center text-sm text-slate-500">
            {copy.mapView.description}
          </CardContent>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {copy.mapView.suburbs.map((suburb) => (
            <Card
              key={suburb}
              className="border border-slate-200"
            >
              <CardContent className="p-4 text-sm text-slate-600">
                <div className="text-sm font-semibold text-slate-900">{suburb}</div>
                <p className="text-xs text-slate-500">{copy.mapView.suburbSummary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MainLayout>
  )
}
