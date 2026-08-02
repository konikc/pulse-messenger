import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/server'

// Create the underlying middleware lazily on first request so `next build`
// doesn't initialize auth (and require secrets) while tracing this module.
type Middleware = ReturnType<typeof auth.middleware>
let middleware: Middleware | null = null
function getMiddleware(): Middleware {
  if (!middleware) middleware = auth.middleware({ loginUrl: '/auth/sign-in' })
  return middleware
}

export default function proxy(request: NextRequest, ...rest: unknown[]) {
  // @ts-expect-error forward the full Next middleware argument list
  return getMiddleware()(request, ...rest)
}

export const config = {
  matcher: ['/', '/onboarding/:path*', '/settings/:path*'],
}
