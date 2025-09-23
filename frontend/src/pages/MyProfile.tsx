import MainLayout from '@/layouts/MainLayout'
import Header from '@/components/navigation/Header'
import Input from '@/components/ui/Input'
import { Button } from '@/components/ui/button'
export default function MyProfile() {
  return (
    <MainLayout>
      <Header />
      <main className="mx-auto max-w-md p-4 space-y-4">
        <h2 className="text-xl font-semibold">My Profile</h2>
        <Input
          label="Display name"
          placeholder="Your name"
        />
        <Input
          label="Suburb / City"
          placeholder="Brisbane"
        />
        <Input
          label="Primary sport"
          placeholder="Basketball"
        />
        <Button>Save</Button>
      </main>
    </MainLayout>
  )
}
