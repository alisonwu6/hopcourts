import MainLayout from '@/layouts/MainLayout'
import Header from '@/components/navigation/Header'
import Input from '@/components/ui/Input'
import { Button } from '@/components/ui/button'

export default function CreateSession() {
  return (
    <MainLayout>
      <Header />
      <main className="mx-auto max-w-xl p-4 space-y-4">
        <h2 className="text-xl font-semibold">Create Session</h2>
        <div className="grid gap-3">
          <Input
            label="Sport"
            placeholder="Basketball"
          />
          <Input
            label="Date & Start time"
            type="datetime-local"
          />
          <Input
            label="Duration (min)"
            type="number"
            placeholder="90"
          />
          <Input
            label="Location"
            placeholder="QUT Gardens Point"
          />
          <Input
            label="Capacity"
            type="number"
            placeholder="10"
          />
        </div>
        <Button>Publish</Button>
      </main>
    </MainLayout>
  )
}
