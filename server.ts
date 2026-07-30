import { createNeonAuth } from '@neondatabase/auth/next/server'

const baseUrl = process.env.NEON_AUTH_BASE_URL
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET

if (!baseUrl || !cookieSecret) {
  throw new Error('NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET are required')
}

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
  logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
})
