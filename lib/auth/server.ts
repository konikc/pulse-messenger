import { createNeonAuth } from '@neondatabase/auth/next/server'

type NeonAuth = ReturnType<typeof createNeonAuth>

let cached: NeonAuth | null = null

/**
 * Lazily create the Neon Auth instance.
 *
 * We intentionally do NOT create it at module load time: doing so would throw
 * during `next build` (page-data collection imports this module) whenever the
 * environment variables are not yet configured. Creating it on first use keeps
 * the build green and surfaces a clear error only at request time.
 */
export function getAuth(): NeonAuth {
  if (cached) return cached

  const baseUrl = process.env.NEON_AUTH_BASE_URL
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET

  if (!baseUrl || !cookieSecret) {
    throw new Error(
      'Neon Auth не настроен: задайте NEON_AUTH_BASE_URL и NEON_AUTH_COOKIE_SECRET в переменных окружения.',
    )
  }

  cached = createNeonAuth({
    baseUrl,
    cookies: {
      secret: cookieSecret,
      sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax',
    },
    logLevel: 'warn',
  })

  return cached
}
