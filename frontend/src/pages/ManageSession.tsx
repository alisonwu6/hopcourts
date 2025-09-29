import { Link, useParams } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCopy } from '@/i18n/LanguageProvider'

const roster = ['Alex', 'Bo', 'Chen', 'Dana', 'Eli', 'Faye', 'Gus', 'Hana']
const waitlist = ['Ivy', 'Jules']

export default function ManageSession() {
  const { id } = useParams()
  const copy = useCopy()

  return (
    <MainLayout
      title={copy.manageSession.title}
      description={copy.manageSession.description}
      actions={
        <Button
          asChild
          size="sm"
          variant="outline"
        >
          <Link to={`/sessions/${id}`}>{copy.manageSession.viewPublic}</Link>
        </Button>
      }
      contentWidth="md"
    >
      <section className="space-y-4">
        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{copy.manageSession.confirmedPlayers}</span>
              <span>{copy.common.joinCounts(roster.length, 10)}</span>
            </div>
            <ul className="grid gap-2 text-sm">
              {roster.map((name) => (
                <li
                  key={name}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                >
                  <span>{name}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">{copy.common.message}</Button>
                    <Button size="sm" variant="ghost">{copy.common.remove}</Button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">{copy.manageSession.copyInvite}</Button>
              <Button variant="outline" size="sm">{copy.manageSession.exportRoster}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6">
            <div className="text-sm font-semibold text-slate-900">{copy.manageSession.waitlist}</div>
            {waitlist.length === 0 ? (
              <p className="text-sm text-slate-500">{copy.manageSession.noWaitlist}</p>
            ) : (
              <ul className="grid gap-2 text-sm">
                {waitlist.map((name) => (
                  <li
                    key={name}
                    className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                  >
                    <span>{name}</span>
                    <div className="flex gap-2">
                      <Button size="sm">{copy.manageSession.approve}</Button>
                      <Button size="sm" variant="ghost">{copy.manageSession.decline}</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="grid gap-3 p-6 sm:grid-cols-2">
            <Button variant="outline">{copy.manageSession.sendUpdate}</Button>
            <Button variant="outline">{copy.manageSession.cancelSession}</Button>
            <Button variant="outline">{copy.manageSession.duplicateSession}</Button>
            <Button variant="outline">{copy.manageSession.feedbackForm}</Button>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  )
}
