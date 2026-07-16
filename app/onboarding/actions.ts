'use server'

import { auth } from '@/lib/auth/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { z } from 'zod'

const profileSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,24}$/, 'От 3 до 24 латинских букв, цифр или _'),
  displayName: z.string().trim().min(2, 'Укажите имя').max(60),
  avatarEmoji: z.string().trim().max(8).default(''),
})

export type OnboardingState = {
  error?: string
  field?: 'username' | 'displayName'
  success?: boolean
  requiresSignIn?: boolean
}

export async function completeOnboarding(_state: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const { data: session } = await auth.getSession()
  if (!session?.user) return { error: 'Сессия истекла. Войдите снова.', requiresSignIn: true }

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
      set: {
        username: parsed.data.username,
        displayName: parsed.data.displayName,
        avatarEmoji: parsed.data.avatarEmoji || null,
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    const databaseError = error as {
      code?: string
      constraint?: string
      cause?: { code?: string; constraint?: string }
    }
    const code = databaseError.code ?? databaseError.cause?.code
    const constraint = databaseError.constraint ?? databaseError.cause?.constraint
    if (code === '23505' && constraint === 'profiles_username_unique') {
      return { error: 'Этот username уже занят', field: 'username' }
    }
    return { error: 'Не удалось сохранить профиль. Попробуйте ещё раз.' }
  }

  return { success: true }
}
