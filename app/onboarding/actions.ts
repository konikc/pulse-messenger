'use server'

import { auth } from '@/lib/auth/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const profileSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,24}$/, 'От 3 до 24 латинских букв, цифр или _'),
  displayName: z.string().trim().min(2, 'Укажите имя').max(60),
  avatarEmoji: z.string().trim().max(8).default(''),
})

export type OnboardingState = { error?: string; field?: 'username' | 'displayName' }

export async function completeOnboarding(_state: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const { data: session } = await auth.getSession()
  if (!session?.user) redirect('/auth/sign-in')

  const parsed = profileSchema.safeParse({
    username: formData.get('username'),
    displayName: formData.get('displayName'),
    avatarEmoji: formData.get('avatarEmoji') || '',
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Проверьте данные' }

  try {
    await db.insert(profiles).values({
      userId: session.user.id,
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      avatarEmoji: parsed.data.avatarEmoji || null,
    }).onConflictDoUpdate({
      target: profiles.userId,
      set: { displayName: parsed.data.displayName, avatarEmoji: parsed.data.avatarEmoji || null, updatedAt: new Date() },
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('profiles_username_unique_ci')) return { error: 'Этот username уже занят', field: 'username' }
    return { error: 'Не удалось сохранить профиль. Попробуйте ещё раз.' }
  }

  redirect('/')
}
