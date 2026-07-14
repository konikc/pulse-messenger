import { createNeonAuth } from '@neondatabase/auth/next/server'

const baseUrl = process.env.NEON_AUTH_BASE_URL
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET

if (!baseUrl || !cookieSecret) {
  throw new Error('Neon Auth environment variables are not configured')
}

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
    sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax',
  },
  logLevel: 'warn',
})
