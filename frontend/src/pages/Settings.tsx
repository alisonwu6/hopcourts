import MainLayout from '@/layouts/MainLayout'
import Header from '@/components/navigation/Header'
export default function Settings() {
  return (
    <MainLayout>
      <Header />
      <main className="mx-auto max-w-md p-4 space-y-3">
        <h2 className="text-xl font-semibold">Settings</h2>
        <ul className="grid gap-2">
          <li className="border p-2 rounded">Connected: Google (default)</li>
          <li className="border p-2 rounded">Calendar sync (coming soon)</li>
          <li className="border p-2 rounded">Privacy & Terms</li>
        </ul>
      </main>
    </MainLayout>
  )
}
