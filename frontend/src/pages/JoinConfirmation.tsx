import { Link, useParams } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { useCopy } from '@/i18n/LanguageProvider'

export default function JoinConfirmation() {
  const { id } = useParams()
  const copy = useCopy()

  return (
    <MainLayout
      title={copy.joinConfirmation.title}
      description={copy.joinConfirmation.description}
      contentWidth="sm"
    >
      <section className="text-center">
        <div className="mx-auto grid gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-4xl">✅</div>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              {copy.joinConfirmation.sharePrompt}
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="outline">{copy.common.addToCalendar}</Button>
              <Button variant="outline">{copy.common.shareToChat}</Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link to={`/sessions/${id}`}>{copy.common.goToSession}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/home">{copy.common.browseMore}</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
