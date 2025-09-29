import MainLayout from '@/layouts/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const strengths = ['Shooting', 'Defense', 'Teamwork']
const highlights = [
  'Active streak: 4 weeks',
  '18 sessions hosted',
  'Top feedback: "Great communicator"',
]

export default function AthleteCard() {
  return (
    <MainLayout
      title="Athlete profile"
      description="Preview how others see your card."
      contentWidth="sm"
      actions={<Button variant="outline" size="sm">Share card</Button>}
    >
      <section>
        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6 text-center">
            <Avatar className="mx-auto h-24 w-24">
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Alison Blue</h2>
              <p className="text-sm text-slate-500">Brisbane · Basketball</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              {strengths.map((strength) => (
                <Badge
                  key={strength}
                  variant="outline"
                  className="rounded-full px-3 py-1"
                >
                  {strength}
                </Badge>
              ))}
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              {highlights.map((highlight) => (
                <div key={highlight}>{highlight}</div>
              ))}
            </div>
            <div className="flex justify-center gap-2">
              <Button size="sm" variant="secondary">Invite to squad</Button>
              <Button size="sm" variant="outline">Message</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  )
}
