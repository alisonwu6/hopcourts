import MainLayout from '@/layouts/MainLayout'
import Header from '@/components/navigation/Header'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function JoinConfirmation() {
  const { id } = useParams()
  return (
    <MainLayout>
      <Header />
      <main className="mx-auto max-w-md p-6 text-center space-y-4">
        <div className="text-3xl">✅</div>
        <h2 className="text-xl font-semibold">You’re in!</h2>
        <p className="text-slate-600">
          Added to the roster. Don’t forget to add it to your calendar.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="secondary">Add .ics</Button>
          <Link to={`/sessions/${id}`}>
            <Button>Go to session</Button>
          </Link>
        </div>
      </main>
    </MainLayout>
  )
}
