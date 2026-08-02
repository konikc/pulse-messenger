import { createNeonAuth } from '@neondatabase/auth/next/server'

type NeonAuth = ReturnType<typeof createNeonAuth>

// The auth instance is created lazily on first use rather than at module load.
// This keeps `next build` (which imports route modules to collect page data)
// from throwing when secrets are absent — secrets are only required when an
// actual request is served. See 00_READ_ME_FIRST_AI.md / DEPLOY.md.
let cached: NeonAuth | null = null

function createAuth(): NeonAuth {
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

  return createNeonAuth({
    baseUrl,
    cookies: {
      secret: cookieSecret,
      sameSite: isProd ? 'lax' : 'none',
    },
    logLevel: 'warn',
  })
}

export function getAuth(): NeonAuth {
  if (!cached) cached = createAuth()
  return cached
}

// A transparent lazy proxy: existing code can keep using `auth.getSession()`,
// `auth.handler()`, `auth.middleware()` etc. The real instance is only built
// (and secrets validated) the first time a property is accessed at runtime.
export const auth = new Proxy({} as NeonAuth, {
  get(_target, prop, receiver) {
    const instance = getAuth() as unknown as Record<string | symbol, unknown>
    const value = Reflect.get(instance, prop, receiver)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})
