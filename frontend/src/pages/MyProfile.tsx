import MainLayout from '@/layouts/MainLayout'
import { useCopy } from '@/i18n/LanguageProvider'
import AthleteCardView from '@/components/athlete/AthleteCardView'

export default function MyProfile() {
  const copy = useCopy()

  return (
    <MainLayout
      title={undefined}
      description={undefined}
      contentWidth="sm"
    >
      <AthleteCardView
        copy={copy.athleteCard}
        displayName={copy.myProfile.name}
        inviteLabel={copy.common.inviteToSquad}
        messageLabel={copy.common.message}
        editHref="/u/me/edit"
        isOwner
      />
    </MainLayout>
  )
}
