import { PulseApp } from '@/components/messenger/pulse-app'
import { auth } from '@/lib/auth/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { data: session } = await auth.getSession()
  if (!session?.user) redirect('/auth/sign-in')

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  })
  if (!profile) redirect('/onboarding')

  return <PulseApp />
}
