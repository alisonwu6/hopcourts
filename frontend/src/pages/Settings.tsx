import MainLayout from '@/layouts/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components'

export default function Settings() {

  return (
    <MainLayout
      title="Settings"
      description="Control connected accounts, syncing, and privacy options."
      contentWidth="page"
    >
      <section className="space-y-4">
        <Card className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="font-semibold text-slate-900">Connected accounts</div>
                <p className="text-slate-500">Use social sign-in so your profile stays in sync.</p>
              </div>
              <Badge variant="outline">Primary</Badge>
            </div>
            <div className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
              <span>Google</span>
              <Button size="sm" variant="secondary" storyLine="venue">Disconnect</Button>
            </div>
            <div className="flex items-center justify-between rounded border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500">
              <span>Apple</span>
              <Button size="sm" variant="tertiary" storyLine="venue">Connect</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200">
          <CardContent className="space-y-3 p-6">
            <div className="font-semibold text-slate-900">Calendar sync</div>
            <p className="text-sm text-slate-500">
              Automatically add joined games to your calendar.
            </p>
            <Button variant="secondary" storyLine="venue" disabled>
              Coming soon
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
          <CardContent className="space-y-3 p-6 text-sm text-slate-600">
            <div className="font-semibold text-slate-900">Privacy & terms</div>
            <p>SportsMatch is currently in beta. We collect limited data to improve game matching.</p>
            <div className="text-xs text-slate-500">
              Read the Privacy Policy and Community Guidelines.
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  )
}
