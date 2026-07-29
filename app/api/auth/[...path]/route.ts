import { getAuth } from '@/lib/auth/server'

type RouteContext = { params: Promise<{ path: string[] }> }

// Handlers are resolved lazily per request so that `next build` never evaluates
// the Neon Auth config (which requires env vars) while collecting page data.
export async function GET(request: Request, context: RouteContext) {
  return getAuth().handler().GET(request, context)
}

export async function POST(request: Request, context: RouteContext) {
  return getAuth().handler().POST(request, context)
}
