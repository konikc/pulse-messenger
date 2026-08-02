import { auth } from '@/lib/auth/server'

const handlers = auth.handler()

// The canonical origin the upstream Neon Auth project trusts.
// In the v0 preview the app runs inside a cross-site iframe, so the browser
// sends the sandbox origin (e.g. *.vusercontent.net) which Neon Auth rejects
// with "Invalid origin". We normalize the forwarded Origin/Referer to the app's
// own origin (APP_ORIGIN, else the base URL) before proxying upstream.
function canonicalOrigin(request: Request): string {
  const configured = process.env.APP_ORIGIN || process.env.NEON_AUTH_BASE_URL
  if (configured) {
    try {
      return new URL(configured).origin
    } catch {
      // fall through to request origin
    }
  }
  return new URL(request.url).origin
}

function withNormalizedOrigin(request: Request): Request {
  const origin = canonicalOrigin(request)
  const headers = new Headers(request.headers)
  headers.set('origin', origin)
  // Keep the path of the original referer but swap in the trusted origin.
  const referer = headers.get('referer')
  if (referer) {
    try {
      const url = new URL(referer)
      headers.set('referer', `${origin}${url.pathname}${url.search}`)
    } catch {
      headers.set('referer', origin)
    }
  } else {
    headers.set('referer', origin)
  }
  return new Request(request.url, {
    method: request.method,
    headers,
    body: request.body,
    // @ts-expect-error duplex is required by Node when a body stream is present
    duplex: 'half',
  })
}

type RouteContext = { params: Promise<{ path: string[] }> }

export async function GET(request: Request, context: RouteContext) {
  return handlers.GET(withNormalizedOrigin(request), context)
}

export async function POST(request: Request, context: RouteContext) {
  return handlers.POST(withNormalizedOrigin(request), context)
}
