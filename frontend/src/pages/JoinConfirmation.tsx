import { Link, useParams } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { Button } from '@/components'

export default function JoinConfirmation() {
  const { id } = useParams()

  return (
    <MainLayout
      title="You are in!"
      description="We have added you to the roster and notified the host."
      contentWidth="sm"
    >
      <section className="text-center">
        <div className="mx-auto grid gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-4xl">✅</div>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Add it to your calendar or share the link with friends.
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="outline">Add to calendar (.ics)</Button>
              <Button variant="outline">Share to group chat</Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild storyLine="venue">
              <Link to={`/games/${id}`}>Go to game</Link>
            </Button>
            <Button asChild variant="secondary" storyLine="venue">
              <Link to="/">Browse more games</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
