import MainLayout from '@/layouts/MainLayout'
import Header from '@/components/navigation/Header'
import { Button } from '@/components/ui/button'
export default function Squad() {
  const people = ['Alex', 'Bo', 'Chen', 'Dana']
  return (
    <MainLayout>
      <Header />
      <main className="mx-auto max-w-lg p-4 space-y-4">
        <h2 className="text-xl font-semibold">Your Squad</h2>
        <ul className="grid gap-2">
          {people.map((n) => (
            <li
              key={n}
              className="flex items-center justify-between border p-2 rounded"
            >
              <div>{n}</div>
              <Button variant="secondary">Remove</Button>
            </li>
          ))}
        </ul>
      </main>
    </MainLayout>
  )
}
