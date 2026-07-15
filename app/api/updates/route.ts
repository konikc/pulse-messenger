import { NextResponse } from 'next/server'

export const revalidate = 900

export async function GET() {
  const owner = process.env.GITHUB_OWNER ?? 'konikc'
  const repo = process.env.GITHUB_REPO ?? 'pulse-messenger'
  const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0'

  if (!owner || !repo) {
    return NextResponse.json({ configured: false, currentVersion })
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    next: { revalidate: 900 },
  })

  if (response.status === 404) {
    return NextResponse.json({ configured: true, currentVersion, updateAvailable: false })
  }
  if (!response.ok) {
    return NextResponse.json({ error: 'Не удалось проверить обновления' }, { status: 502 })
  }

  const release = (await response.json()) as { tag_name: string; name?: string; html_url: string; body?: string; published_at?: string }
  const normalize = (value: string) => value.trim().replace(/^v/, '')
  const parts = (value: string) => normalize(value).split('.').map((part) => Number.parseInt(part, 10) || 0)
  const compare = (left: string, right: string) => {
    const a = parts(left)
    const b = parts(right)
    for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
      if ((a[index] ?? 0) !== (b[index] ?? 0)) return (a[index] ?? 0) > (b[index] ?? 0)
    }
    return false
  }

  return NextResponse.json({
    configured: true,
    currentVersion,
    latestVersion: normalize(release.tag_name),
    updateAvailable: compare(release.tag_name, currentVersion),
    name: release.name ?? release.tag_name,
    url: release.html_url,
    notes: release.body?.slice(0, 500) ?? '',
    publishedAt: release.published_at,
  })
}
