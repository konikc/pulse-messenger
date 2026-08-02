'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'
import { completeOnboarding, type OnboardingState } from '@/app/onboarding/actions'
import { PulseLogo } from '@/components/pulse-logo'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const initialState: OnboardingState = {}

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const router = useRouter()
  const [state, action, pending] = useActionState(completeOnboarding, initialState)

  useEffect(() => {
    if (state.success) {
      router.push('/')
      router.refresh()
    } else if (state.requiresSignIn) {
      router.replace('/auth/sign-in')
    }
  }, [router, state.requiresSignIn, state.success])

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <section className="flex w-full max-w-lg flex-col gap-6 rounded-[2rem] border bg-card p-6 shadow-xl shadow-foreground/5 sm:p-8" aria-labelledby="onboarding-title">
        <div className="flex items-center gap-4"><PulseLogo className="size-12" /><div><p className="text-sm font-medium text-primary">Последний шаг</p><h1 id="onboarding-title" className="text-balance text-2xl font-semibold">Создайте профиль Pulse</h1></div></div>
        <form action={action}>
          <FieldGroup>
            <Field><FieldLabel htmlFor="avatarEmoji">Emoji-аватар</FieldLabel><Input id="avatarEmoji" name="avatarEmoji" defaultValue="👋" maxLength={8} className="text-2xl" /><FieldDescription>Позже можно загрузить фотографию в настройках.</FieldDescription></Field>
            <Field data-invalid={state.field === 'displayName'}><FieldLabel htmlFor="displayName">Отображаемое имя</FieldLabel><Input id="displayName" name="displayName" defaultValue={defaultName} required maxLength={60} aria-invalid={state.field === 'displayName'} /></Field>
            <Field data-invalid={state.field === 'username'}><FieldLabel htmlFor="username">Username</FieldLabel><Input id="username" name="username" required minLength={3} maxLength={24} pattern="[a-z0-9_]+" autoCapitalize="none" autoCorrect="off" placeholder="pulse_user" aria-invalid={state.field === 'username'} /><FieldDescription>Уникальный адрес: pulse.app/@username</FieldDescription></Field>
            {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
            <Field><Button type="submit" size="lg" disabled={pending}>{pending && <LoaderCircle data-icon="inline-start" className="animate-spin" />}{pending ? 'Сохраняю…' : 'Начать общение'}</Button></Field>
          </FieldGroup>
        </form>
      </section>
    </main>
  )
}

