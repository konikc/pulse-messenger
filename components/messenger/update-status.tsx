'use client'

import useSWR from 'swr'
import { ExternalLink, RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type UpdateInfo = {
  configured?: boolean
  currentVersion?: string
  latestVersion?: string
  updateAvailable?: boolean
  url?: string
  error?: string
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Update check failed')
  return response.json() as Promise<UpdateInfo>
}

export function UpdateStatus() {
  const { data, error, isLoading, mutate } = useSWR('/api/updates', fetcher, { revalidateOnFocus: false })
  const description = isLoading
    ? 'Проверяем GitHub Releases…'
    : error
      ? 'Проверка временно недоступна.'
      : !data?.configured
        ? 'Укажите GITHUB_OWNER и GITHUB_REPO.'
        : data.updateAvailable
          ? `Доступна версия ${data.latestVersion}.`
          : `Версия ${data?.currentVersion} актуальна.`

  return (
    <div className="rounded-2xl bg-accent p-4">
      <div className="flex items-center gap-2 font-medium"><Sparkles className="size-4 text-primary" /> Pulse Desktop</div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-3 flex gap-2">
        {data?.updateAvailable && data.url ? (
          <Button size="sm" render={<a href={data.url} target="_blank" rel="noreferrer" />}>
            Открыть релиз <ExternalLink data-icon="inline-end" />
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => mutate()} disabled={isLoading}>
            <RefreshCw data-icon="inline-start" /> Проверить
          </Button>
        )}
      </div>
    </div>
  )
}
