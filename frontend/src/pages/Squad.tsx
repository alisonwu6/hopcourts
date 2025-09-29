import MainLayout from '@/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MailPlus, UsersRound } from 'lucide-react'

const squadMembers = [
  {
    name: 'Dana',
    suburb: 'South Brisbane',
    sport: 'Netball',
    streak: '12 sessions together',
    note: 'Hosts a friendly Friday run at Davies Park',
  },
  {
    name: 'Chen',
    suburb: 'Fortitude Valley',
    sport: 'Basketball',
    streak: '8 sessions together',
    note: 'Always down for weeknight scrims',
  },
  {
    name: 'Bo',
    suburb: 'West End',
    sport: 'Running',
    streak: '5 sessions together',
    note: 'Tempo partner for Wednesday mornings',
  },
]

const requests = [
  {
    name: 'Hana',
    sport: 'Volleyball',
    message: '“Loved playing at Kangaroo Point, add me for the next game?”',
  },
]

export default function Squad() {
  return (
    <MainLayout
      title="Your squad"
      description="Stay connected with the athletes you trust."
      actions={
        <Button className="gap-1" size="sm">
          <MailPlus className="h-4 w-4" /> Invite teammate
        </Button>
      }
    >
      <section className="space-y-4">
        <Card className="border border-slate-200 bg-white">
          <CardContent className="flex flex-col gap-4 p-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-slate-700">
              <UsersRound className="h-6 w-6 text-blue-500" />
              <div>
                <div className="text-base font-semibold text-slate-900">Squad insights</div>
                <div>3 active connections · 18 recent co-sessions · 2 pending invites</div>
              </div>
            </div>
            <Button variant="outline" size="sm">View history</Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {squadMembers.map((member) => (
            <Card
              key={member.name}
              className="border border-slate-200"
            >
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{member.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-base font-semibold text-slate-900">{member.name}</div>
                    <div className="text-xs text-slate-500">{member.suburb} · {member.sport}</div>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs">
                  {member.streak}
                </Badge>
                <p className="text-sm text-slate-600">{member.note}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary">Start chat</Button>
                  <Button size="sm" variant="outline">Remove</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">Requests</h2>
        {requests.length === 0 ? (
          <Card className="border border-dashed border-slate-300 bg-white">
            <CardContent className="p-5 text-sm text-slate-500">
              No requests at the moment. After a session wraps you can invite players directly.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {requests.map((request) => (
              <Card
                key={request.name}
                className="border border-slate-200"
              >
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{request.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{request.name}</div>
                      <div className="text-xs text-slate-500">{request.sport}</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{request.message}</p>
                  <div className="flex gap-2">
                    <Button size="sm">Add to squad</Button>
                    <Button size="sm" variant="ghost">Maybe later</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  )
}
