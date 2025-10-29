import MainLayout from '@/layouts/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Notifications() {

  return (
    <MainLayout
      title="Notifications"
      description="Stay on top of roster updates and reminders."
      contentWidth="md"
      actions={<Button variant="outline" size="sm">Mark all read</Button>}
    >
      <section className="space-y-3">
        <Card className="border border-slate-200">
          <CardContent className="flex items-start justify-between gap-3 p-5 text-sm">
            <div>
              <Badge
                variant="outline"
                className="mb-2 rounded-full px-3 py-1 text-xs uppercase"
              >
                roster
              </Badge>
              <p className="text-slate-700">Bo joined your session for Friday futsal</p>
            </div>
            <div className="text-xs text-slate-400">2m ago</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="flex items-start justify-between gap-3 p-5 text-sm">
            <div>
              <Badge
                variant="outline"
                className="mb-2 rounded-full px-3 py-1 text-xs uppercase"
              >
                reminder
              </Badge>
              <p className="text-slate-700">Yoga Flow starts in 1h</p>
            </div>
            <div className="text-xs text-slate-400">1h ago</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="flex items-start justify-between gap-3 p-5 text-sm">
            <div>
              <Badge
                variant="outline"
                className="mb-2 rounded-full px-3 py-1 text-xs uppercase"
              >
                feedback
              </Badge>
              <p className="text-slate-700">Dana left feedback on Sunrise Run Club</p>
            </div>
            <div className="text-xs text-slate-400">Yesterday</div>
          </CardContent>
        </Card>
        <Card className="border border-dashed border-slate-300 bg-white">
          <CardContent className="p-5 text-sm text-slate-500">
            You are caught up. New updates will show here.
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  )
}
