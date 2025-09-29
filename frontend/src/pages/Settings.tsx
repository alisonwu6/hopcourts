import MainLayout from '@/layouts/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Settings() {
  return (
    <MainLayout
      title="Settings"
      description="Control connected accounts, syncing, and privacy options."
      contentWidth="md"
    >
      <section className="space-y-4">
        <Card className="border border-slate-200">
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
              <Button size="sm" variant="outline">Disconnect</Button>
            </div>
            <div className="flex items-center justify-between rounded border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500">
              <span>Apple</span>
              <Button size="sm" variant="ghost">Connect</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="space-y-3 p-6">
            <div className="font-semibold text-slate-900">Calendar sync</div>
            <p className="text-sm text-slate-500">
              Automatically add joined sessions to your calendar.
            </p>
            <Button variant="outline" disabled>
              Coming soon
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="space-y-3 p-6 text-sm text-slate-600">
            <div className="font-semibold text-slate-900">Privacy & terms</div>
            <p>SportsMatch is currently in beta. We collect limited data to improve session matching.</p>
            <div className="text-xs text-slate-500">
              Read the <span className="underline">Privacy Policy</span> and <span className="underline">Community Guidelines</span>.
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  )
}
