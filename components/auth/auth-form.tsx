'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LogIn, LoaderCircle } from 'lucide-react'
import { PulseLogo } from '@/components/pulse-logo'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth/client'

export function AuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    const name = String(data.get('name') ?? '').trim()

    const result = mode === 'sign-up'
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })

    if (result.error) {
      setError(result.error.message || 'Не удалось выполнить вход')
      setPending(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  async function signInWithGoogle() {
    setPending(true)
    setError('')
    const result = await authClient.signIn.social({ provider: 'google', callbackURL: '/' })
    if (result.error) {
      setError(result.error.message || 'Google-вход сейчас недоступен')
      setPending(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <section className="flex w-full max-w-md flex-col gap-6 rounded-[2rem] border bg-card p-6 shadow-xl shadow-foreground/5 sm:p-8" aria-labelledby="auth-title">
        <div className="flex flex-col items-center gap-3 text-center">
          <PulseLogo className="size-14" />
          <div>
            <h1 id="auth-title" className="text-balance text-2xl font-semibold">{mode === 'sign-in' ? 'С возвращением в Pulse' : 'Создайте аккаунт Pulse'}</h1>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Общайтесь в своём ритме на любом устройстве.</p>
          </div>
        </div>

        <Button type="button" variant="outline" size="lg" onClick={signInWithGoogle} disabled={pending}>
          <LogIn data-icon="inline-start" /> Продолжить с Google
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /><span>или через email</span><span className="h-px flex-1 bg-border" /></div>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {mode === 'sign-up' && <Field><FieldLabel htmlFor="name">Имя</FieldLabel><Input id="name" name="name" autoComplete="name" required maxLength={60} placeholder="Как к вам обращаться" /></Field>}
            <Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></Field>
            <Field><FieldLabel htmlFor="password">Пароль</FieldLabel><Input id="password" name="password" type="password" autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} required minLength={8} /><FieldDescription>Минимум 8 символов.</FieldDescription></Field>
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <Field>
              <Button type="submit" size="lg" disabled={pending}>
                {pending ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : <ArrowRight data-icon="inline-end" />}
                {pending ? 'Подождите…' : mode === 'sign-in' ? 'Войти' : 'Создать аккаунт'}
              </Button>
            </Field>
          </FieldGroup>
        </form>

        <Button type="button" variant="ghost" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setError('') }}>
          {mode === 'sign-in' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </Button>
      </section>
    </main>
  )
}
