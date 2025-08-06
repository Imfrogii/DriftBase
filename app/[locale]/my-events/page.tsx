import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MyEventsPage } from '@/components/pages/MyEventsPage/MyEventsPage'

export default async function MyEvents({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const userAuth = await getUser()

  if (!userAuth?.user) {
    redirect(`/${locale}/auth/signin`)
  }

  return <MyEventsPage />
}
