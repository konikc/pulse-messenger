import { createNeonAuth } from '@neondatabase/auth/next/server'

const baseUrl = process.env.NEON_AUTH_BASE_URL
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET

if (!baseUrl) {
  throw new Error('NEON_AUTH_BASE_URL is not set. Add it to your environment (see 00_READ_ME_FIRST_AI.md).')
}

if (!cookieSecret || cookieSecret.length < 32) {
  throw new Error(
    'NEON_AUTH_COOKIE_SECRET is missing or shorter than 32 characters. ' +
      'This is the #1 cause of the "infinite loading" login bug. ' +
      'Generate one with `openssl rand -base64 32` and set NEON_AUTH_COOKIE_SECRET.',
  )
}

// In the v0 preview the app runs inside a cross-site iframe, so cookies need
// SameSite=None to survive. On your own domain (pulsemsg.ru) use Lax.
const isProd = process.env.NODE_ENV === 'production'

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
    sameSite: isProd ? 'lax' : 'none',
  },
  logLevel: 'warn',
})
