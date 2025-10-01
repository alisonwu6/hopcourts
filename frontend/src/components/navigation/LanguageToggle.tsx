import { Button } from '@/components/ui/button'
import { useCopy, useLanguage } from '@/i18n/LanguageProvider'

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()
  const copy = useCopy()
  const nextLabel = language === 'en' ? copy.language.chinese : copy.language.english

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      aria-label={copy.language.toggleA11y}
      className="inline-flex rounded-full px-4"
    >
      {nextLabel}
    </Button>
  )
}
