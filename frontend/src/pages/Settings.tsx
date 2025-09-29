import MainLayout from '@/layouts/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCopy } from '@/i18n/LanguageProvider'
import LanguageToggle from '@/components/navigation/LanguageToggle'

export default function Settings() {
  const copy = useCopy()

  return (
    <MainLayout
      title={copy.settings.title}
      description={copy.settings.description}
      contentWidth="md"
    >
      <section className="space-y-4">
        <Card className="border border-slate-200">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="font-semibold text-slate-900">{copy.settings.connectedTitle}</div>
                <p className="text-slate-500">{copy.settings.connectedDescription}</p>
              </div>
              <Badge variant="outline">{copy.settings.primaryBadge}</Badge>
            </div>
            <div className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
              <span>{copy.settings.google}</span>
              <Button size="sm" variant="outline">{copy.settings.disconnect}</Button>
            </div>
            <div className="flex items-center justify-between rounded border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500">
              <span>{copy.settings.apple}</span>
              <Button size="sm" variant="ghost">{copy.settings.connect}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="space-y-3 p-6">
            <div>
              <div className="font-semibold text-slate-900">{copy.settings.languageTitle}</div>
              <p className="text-sm text-slate-500">{copy.settings.languageDescription}</p>
            </div>
            <div className="flex justify-start">
              <LanguageToggle />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="space-y-3 p-6">
            <div className="font-semibold text-slate-900">{copy.settings.calendarTitle}</div>
            <p className="text-sm text-slate-500">
              {copy.settings.calendarDescription}
            </p>
            <Button variant="outline" disabled>
              {copy.common.comingSoon}
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="space-y-3 p-6 text-sm text-slate-600">
            <div className="font-semibold text-slate-900">{copy.settings.privacyTitle}</div>
            <p>{copy.settings.privacyCopy}</p>
            <div className="text-xs text-slate-500">
              {copy.settings.privacyLinks}
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  )
}
