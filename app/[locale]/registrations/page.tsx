import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RegisteredEventsPage } from '@/components/pages/RegisteredEventsPage/RegisteredEventsPage'

export default async function Registrations({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const userAuth = await getUser()

  if (!userAuth?.user) {
    redirect(`/${locale}/auth/signin`)
  }

  return <RegisteredEventsPage />
}
