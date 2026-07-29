import type { NextRequest } from 'next/server'
import { getAuth } from '@/lib/auth/server'

type Middleware = ReturnType<ReturnType<typeof getAuth>['middleware']>

let handler: Middleware | null = null

// Build the middleware lazily on first request so that `next build` never
// evaluates the Neon Auth config (which requires env vars).
export default function proxy(request: NextRequest, event: unknown) {
  if (!handler) {
    handler = getAuth().middleware({ loginUrl: '/auth/sign-in' })
  }
  return (handler as (req: NextRequest, ev: unknown) => unknown)(request, event)
}

export const config = {
  matcher: ['/', '/onboarding/:path*', '/settings/:path*'],
}
