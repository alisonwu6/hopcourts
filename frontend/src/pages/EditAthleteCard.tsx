import MainLayout from '@/layouts/MainLayout'
import { Button } from '@/components/ui/button'

export default function EditAthleteCard() {
  return (
    <MainLayout
      title="Edit athlete card"
      description="Full-screen editor coming soon."
    >
      <section className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-6 text-sm text-slate-600">
        <p>We&apos;re building a dedicated editor with live preview and privacy controls.</p>
        <p className="mt-2">For now, reach out to the team to update your card manually.</p>
        <div className="mt-4">
          <Button disabled>Coming soon</Button>
        </div>
      </section>
    </MainLayout>
  )
}
