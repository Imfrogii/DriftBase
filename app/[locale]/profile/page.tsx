import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfilePage } from '@/components/pages/ProfilePage/ProfilePage'

export default async function Profile({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const userAuth = await getUser()

  if (!userAuth?.user) {
    redirect(`/${locale}/auth/signin`)
  }

  return <ProfilePage />
}
