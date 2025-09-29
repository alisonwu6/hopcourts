import MainLayout from '@/layouts/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCopy } from '@/i18n/LanguageProvider'

export default function Notifications() {
  const copy = useCopy()

  return (
    <MainLayout
      title={copy.notifications.title}
      description={copy.notifications.description}
      contentWidth="md"
      actions={<Button variant="outline" size="sm">{copy.common.markAllRead}</Button>}
    >
      <section className="space-y-3">
        {copy.notifications.items.map((item) => (
          <Card
            key={item.id}
            className="border border-slate-200"
          >
            <CardContent className="flex items-start justify-between gap-3 p-5 text-sm">
              <div>
                <Badge
                  variant="outline"
                  className="mb-2 rounded-full px-3 py-1 text-xs uppercase"
                >
                  {item.type}
                </Badge>
                <p className="text-slate-700">{item.text}</p>
              </div>
              <div className="text-xs text-slate-400">{item.time}</div>
            </CardContent>
          </Card>
        ))}
        <Card className="border border-dashed border-slate-300 bg-white">
          <CardContent className="p-5 text-sm text-slate-500">
            {copy.notifications.empty}
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  )
}
