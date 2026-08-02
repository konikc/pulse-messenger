import { auth } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'

export const dynamic = 'force-dynamic'

export default async function SignInPage() {
  const { data: session } = await auth.getSession()
  if (session?.user) redirect('/')

  return <AuthForm />
}
