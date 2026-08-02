'use client'

import { useState } from 'react'
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from '@livekit/components-react'
import '@livekit/components-styles'
import { LoaderCircle, PhoneOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type CallCredentials = { url: string; token: string }

export function CallRoom({ conversationId, video, onClose }: { conversationId: string; video: boolean; onClose: () => void }) {
  const [credentials, setCredentials] = useState<CallCredentials | null>(null)
  const [error, setError] = useState('')

  async function connect() {
    setError('')
    const response = await fetch('/api/calls/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId }) })
    const result = await response.json()
    if (!response.ok) return setError(result.error ?? 'Звонок пока недоступен')
    setCredentials({ url: result.url, token: result.token })
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-3" role="dialog" aria-modal="true" aria-label={video ? 'Видеозвонок' : 'Аудиозвонок'}>
    <div className="flex h-full max-h-[760px] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-background shadow-2xl">
      <header className="flex items-center justify-between border-b px-4 py-3"><div><h2 className="font-semibold">{video ? 'Видеозвонок Pulse' : 'Аудиозвонок Pulse'}</h2><p className="text-xs text-muted-foreground">Защищённая комната для участников чата</p></div><Button variant="ghost" size="icon" aria-label="Закрыть" onClick={onClose}><X /></Button></header>
      {!credentials ? <div className="flex flex-1 flex-col items-center justify-center p-6 text-center"><div className="flex size-20 items-center justify-center rounded-full bg-accent"><PhoneOff className="size-8 text-primary" /></div><h3 className="mt-5 text-xl font-semibold">Готовы подключиться?</h3><p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">Pulse запросит доступ к {video ? 'камере и микрофону' : 'микрофону'} только после подключения.</p>{error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}<Button className="mt-6" onClick={connect}><LoaderCircle className="hidden animate-spin" /> Подключиться</Button></div> : <LiveKitRoom serverUrl={credentials.url} token={credentials.token} connect audio video={video} onDisconnected={onClose} className="min-h-0 flex-1"><VideoConference /><RoomAudioRenderer /></LiveKitRoom>}
    </div>
  </div>
}
