import MainLayout from '@/layouts/MainLayout'
import Input from '@/components/ui/Input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useCopy } from '@/i18n/LanguageProvider'

export default function MyProfile() {
  const copy = useCopy()

  return (
    <MainLayout
      title={copy.myProfile.title}
      description={copy.myProfile.description}
      contentWidth="md"
      actions={<Button variant="outline" size="sm">{copy.myProfile.viewPublic}</Button>}
    >
      <section>
        <Card className="border border-slate-200">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-base font-semibold text-slate-900">{copy.myProfile.name}</div>
                <div className="text-slate-500">{copy.myProfile.location}</div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {copy.myProfile.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="rounded-full px-3 py-1"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-slate-500">
                {copy.myProfile.stats}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <form className="space-y-6">
        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{copy.myProfile.basicsTitle}</h2>
              <p className="text-sm text-slate-500">{copy.myProfile.basicsDescription}</p>
            </div>
            <Input
              label={copy.myProfile.displayName}
              placeholder={copy.myProfile.name}
            />
            <Input
              label={copy.myProfile.suburb}
              placeholder="West End"
            />
            <Input
              label={copy.myProfile.primarySport}
              placeholder="Basketball"
            />
            <label className="grid gap-1 text-sm text-slate-600">
              {copy.myProfile.bio}
              <textarea
                rows={3}
                placeholder={copy.myProfile.bioPlaceholder}
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{copy.myProfile.availabilityTitle}</h2>
              <p className="text-sm text-slate-500">{copy.myProfile.availabilityDescription}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm text-slate-600">
                {copy.myProfile.preferredDays}
                <div className="flex flex-wrap gap-2">
                  {copy.myProfile.availabilityDays.map((day) => (
                    <Badge
                      key={day}
                      variant="outline"
                      className="rounded-full px-3 py-1"
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
              </label>
              <label className="grid gap-1 text-sm text-slate-600">
                {copy.myProfile.timeOfDay}
                <select className="h-10 rounded border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                  {copy.myProfile.timeOptions.map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-1 text-sm text-slate-600">
              {copy.myProfile.lookingFor}
              <textarea
                rows={3}
                placeholder={copy.myProfile.lookingForPlaceholder}
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="ghost">{copy.common.cancel}</Button>
          <Button type="submit">{copy.common.save}</Button>
        </div>
      </form>
    </MainLayout>
  )
}
