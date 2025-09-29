import MainLayout from '@/layouts/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCopy } from '@/i18n/LanguageProvider'

export default function AthleteCard() {
  const copy = useCopy()

  return (
    <MainLayout
      title={copy.athleteCard.title}
      description={copy.athleteCard.description}
      contentWidth="sm"
      actions={<Button variant="outline" size="sm">{copy.common.shareToChat}</Button>}
    >
      <section>
        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6 text-center">
            <Avatar className="mx-auto h-24 w-24">
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{copy.myProfile.name}</h2>
              <p className="text-sm text-slate-500">{copy.athleteCard.location}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              {copy.athleteCard.strengths.map((strength) => (
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
              {copy.athleteCard.highlights.map((highlight) => (
                <div key={highlight}>{highlight}</div>
              ))}
            </div>
            <div className="flex justify-center gap-2">
              <Button size="sm" variant="secondary">{copy.common.inviteToSquad}</Button>
              <Button size="sm" variant="outline">{copy.common.message}</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  )
}
