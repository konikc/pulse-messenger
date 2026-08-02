import { NextResponse } from 'next/server'
import { requireUserId } from '@/lib/auth/require-user'
import { getFile } from '@/lib/storage/local'

export async function GET(request: Request) {
  try {
    await requireUserId()
    const pathname = new URL(request.url).searchParams.get('pathname')
    if (!pathname?.startsWith('pulse/')) return NextResponse.json({ error: 'Некорректный путь' }, { status: 400 })

    const result = await getFile(pathname)
    if (!result) return new NextResponse('Not found', { status: 404 })

    if (request.headers.get('if-none-match') === result.etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: result.etag, 'Cache-Control': 'private, no-cache' } })
    }

    return new NextResponse(result.data as unknown as BodyInit, {
      headers: {
        'Content-Type': result.contentType,
        ETag: result.etag,
        'Cache-Control': 'private, no-cache',
        'Content-Disposition': 'inline',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
