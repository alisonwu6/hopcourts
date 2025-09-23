import MainLayout from '@/layouts/MainLayout'
import Header from '@/components/navigation/Header'
import { Button } from '@/components/ui/button'
import { Link, useParams } from 'react-router-dom'
export default function SessionDetails() {
  const { id } = useParams()
  return (
    <MainLayout>
      <Header />
      <main className="mx-auto max-w-3xl p-4 space-y-4">
        <h2 className="text-xl font-semibold">Session #{id}</h2>
        <p className="text-slate-600">
          Basketball · Today 18:00 · QUT Gardens · Capacity 8/10
        </p>
        <div className="flex gap-2">
          <Link to={`/sessions/${id}/joined`}>
            <Button>Join</Button>
          </Link>
          <Button variant="secondary">Share</Button>
        </div>
      </main>
    </MainLayout>
  )
}
