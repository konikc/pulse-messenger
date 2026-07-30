'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LogIn, LoaderCircle } from 'lucide-react'
import { PulseLogo } from '@/components/pulse-logo'
import { InstallPwa } from '@/components/pwa/install-pwa'
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
    if (pending) return
    setPending(true)
    setError('')

    try {
      const data = new FormData(event.currentTarget)
      const email = String(data.get('email') ?? '').trim()
      const password = String(data.get('password') ?? '')
      const name = String(data.get('name') ?? '').trim()

      const result = mode === 'sign-up'
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password })

      if (result.error) {
        setError(result.error.message || 'Не удалось выполнить вход')
        return
      }

      router.replace('/')
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Сервис авторизации недоступен. Попробуйте ещё раз.')
    } finally {
      setPending(false)
    }
  }

  async function signInWithGoogle() {
    if (pending) return
    setPending(true)
    setError('')
    try {
      const callbackURL = new URL('/', window.location.origin).toString()
      const result = await authClient.signIn.social({ provider: 'google', callbackURL })
      if (result.error) setError(result.error.message || 'Google-вход сейчас недоступен')
    } catch {
      setError('Не удалось открыть Google-вход. Проверьте домен в Neon Auth и попробуйте снова.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === 'sign-up' && (
          <Field>
            <FieldLabel htmlFor="name">Имя</FieldLabel>
            <Input id="name" name="name" placeholder="Как к вам обращаться" autoComplete="name" required />
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Пароль</FieldLabel>
          <Input id="password" name="password" type="password" minLength={8} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} required />
          <FieldDescription>Минимум 8 символов.</FieldDescription>
        </Field>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
          {pending ? 'Подождите…' : mode === 'sign-in' ? 'Войти' : 'Создать аккаунт'}
        </Button>
      </form>

      <Button type="button" variant="outline" className="w-full" onClick={signInWithGoogle} disabled={pending}>
        <LogIn /> Продолжить с Google
      </Button>

      <button type="button" className="w-full text-sm underline-offset-4 hover:underline" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setError('') }}>
        {mode === 'sign-in' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
      </button>
      <InstallPwa />
    </div>
  )
}
