import MainLayout from '@/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MailPlus, UsersRound } from 'lucide-react'
import { useCopy } from '@/i18n/LanguageProvider'

export default function Squad() {
  const copy = useCopy()

  return (
    <MainLayout
      title={copy.squad.title}
      description={copy.squad.description}
      actions={
        <Button className="gap-1" size="sm">
          <MailPlus className="h-4 w-4" /> {copy.common.inviteTeammate}
        </Button>
      }
    >
      <section className="space-y-4">
        <Card className="border border-slate-200 bg-white">
          <CardContent className="flex flex-col gap-4 p-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-slate-700">
              <UsersRound className="h-6 w-6 text-blue-500" />
              <div>
                <div className="text-base font-semibold text-slate-900">{copy.squad.insightsTitle}</div>
                <div>{copy.squad.insightsSummary}</div>
              </div>
            </div>
            <Button variant="outline" size="sm">{copy.squad.viewHistory}</Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {copy.squad.members.map((member) => (
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
                  <Button size="sm" variant="secondary">{copy.common.startChat}</Button>
                  <Button size="sm" variant="outline">{copy.common.remove}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">{copy.squad.requestsTitle}</h2>
        {copy.squad.requests.length === 0 ? (
          <Card className="border border-dashed border-slate-300 bg-white">
            <CardContent className="p-5 text-sm text-slate-500">
              {copy.squad.empty}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {copy.squad.requests.map((request) => (
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
                    <Button size="sm">{copy.squad.add}</Button>
                    <Button size="sm" variant="ghost">{copy.common.maybeLater}</Button>
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
