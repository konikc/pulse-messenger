'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import {
  Archive, Bell, ChevronLeft, Ellipsis, FileText, Headphones, Image as ImageIcon,
  LockKeyhole, MessageCircle, Mic, Paperclip, Phone, Plus, Search, Send,
  Settings, ShieldCheck, Smile, Users, Video,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PulseLogo } from '@/components/pulse-logo'
import { UpdateStatus } from '@/components/messenger/update-status'
import { CallRoom } from '@/components/messenger/call-room'
import { cn } from '@/lib/utils'

type Conversation = { id: string; kind: string; title: string | null; latestMessage: string | null; latestAt: string | null }
type MessageReaction = { reaction: string; count: number; reacted: boolean }
type Message = { id: string; senderId: string; body: string | null; kind: string; createdAt: string; encryptedPayload?: { name?: string; type?: string; size?: number } | null; reactions?: MessageReaction[] }
type MessagesResponse = { messages: Message[]; currentUserId: string }

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Request failed')
  return response.json()
}

function IconButton({ label, children, onClick, disabled }: { label: string; children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label={label} onClick={onClick} disabled={disabled} />}>
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function initials(title: string | null) {
  return (title?.trim().slice(0, 2) || 'P').toUpperCase()
}

function formatTime(value: string | null) {
  if (!value) return ''
  return new Intl.DateTimeFormat('ru', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export function PulseApp() {
  const { data, error, isLoading, mutate: refreshConversations } = useSWR<{ conversations: Conversation[] }>('/api/conversations', fetcher, { refreshInterval: 5000 })
  const conversations = data?.conversations ?? []
  const [activeId, setActiveId] = useState<string | null>(null)
  const selectedId = activeId ?? conversations[0]?.id ?? null
  const { data: messageData, mutate: refreshMessages } = useSWR<MessagesResponse>(selectedId ? `/api/conversations/${selectedId}/messages` : null, fetcher, { refreshInterval: 2500 })
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [mobileChat, setMobileChat] = useState(false)
  const [newChatOpen, setNewChatOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)
  const [callMode, setCallMode] = useState<'audio' | 'video' | null>(null)
  const activeConversation = conversations.find((item) => item.id === selectedId)
  const filtered = useMemo(() => conversations.filter((chat) => (chat.title ?? 'Чат').toLowerCase().includes(query.toLowerCase())), [conversations, query])

  async function createChat() {
    setStatus('')
    const response = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) })
    const result = await response.json()
    if (!response.ok) return setStatus(result.error ?? 'Не удалось создать чат')
    setUsername('')
    setNewChatOpen(false)
    setActiveId(result.id)
    setMobileChat(true)
    await refreshConversations()
  }

  async function sendMessage() {
    const body = draft.trim()
    if (!body || !selectedId || sending) return
    setSending(true)
    setDraft('')
    const response = await fetch(`/api/conversations/${selectedId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'text', body }) })
    if (!response.ok) setDraft(body)
    await Promise.all([refreshMessages(), refreshConversations()])
    setSending(false)
  }

  async function toggleReaction(message: Message, reaction: string) {
    const selected = message.reactions?.find((item) => item.reaction === reaction)?.reacted
    await fetch(`/api/messages/${message.id}/reactions`, {
      method: selected ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reaction }),
    })
    await refreshMessages()
  }

  async function uploadFile(file: File) {
    if (!selectedId || sending) return
    setSending(true)
    const formData = new FormData()
    formData.set('file', file)
    const uploadResponse = await fetch('/api/media/upload', { method: 'POST', body: formData })
    const uploaded = await uploadResponse.json()
    if (uploadResponse.ok) {
      const kind = file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'file'
      await fetch(`/api/conversations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, body: uploaded.pathname, metadata: { name: uploaded.name, type: uploaded.type, size: uploaded.size } }),
      })
      await Promise.all([refreshMessages(), refreshConversations()])
    }
    setSending(false)
  }

  return (
    <main className="flex min-h-dvh bg-background p-0 md:p-3">
      <section className="mx-auto flex h-dvh w-full max-w-[1480px] overflow-hidden bg-card md:h-[calc(100dvh-1.5rem)] md:rounded-3xl md:border md:shadow-xl">
        <aside className="hidden w-[76px] shrink-0 flex-col items-center border-r bg-sidebar py-4 md:flex">
          <PulseLogo className="[&>span:last-child]:hidden" />
          <nav className="mt-8 flex flex-1 flex-col gap-2" aria-label="Основная навигация">
            <Button size="icon-lg" className="rounded-2xl" aria-label="Сообщения"><MessageCircle /></Button>
            <IconButton label="Контакты"><Users /></IconButton><IconButton label="Звонки"><Phone /></IconButton><IconButton label="Архив"><Archive /></IconButton>
          </nav>
          <div className="flex flex-col gap-2"><IconButton label="Настройки"><Settings /></IconButton><Avatar className="size-9"><AvatarFallback>PU</AvatarFallback></Avatar></div>
        </aside>

        <aside className={cn('w-full shrink-0 border-r bg-card md:w-[330px]', mobileChat && 'hidden md:block')}>
          <header className="flex h-[72px] items-center justify-between px-4">
            <PulseLogo className="md:hidden" />
            <div className="hidden md:block"><h1 className="text-xl font-semibold tracking-tight">Сообщения</h1><p className="text-xs text-muted-foreground">Все ваши разговоры</p></div>
            <Button size="icon" className="rounded-xl" aria-label="Создать чат" onClick={() => setNewChatOpen((value) => !value)}><Plus /></Button>
          </header>
          {newChatOpen && <div className="mx-3 mb-3 rounded-2xl border bg-background p-3"><label className="text-xs font-medium" htmlFor="new-username">Новый чат по username</label><div className="mt-2 flex gap-2"><input id="new-username" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} placeholder="username" className="min-w-0 flex-1 rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /><Button size="sm" onClick={createChat}>Найти</Button></div>{status && <p role="alert" className="mt-2 text-xs text-destructive">{status}</p>}</div>}
          <div className="px-4 pb-3"><label className="flex h-10 items-center gap-2 rounded-xl bg-muted px-3 focus-within:ring-2 focus-within:ring-ring"><Search className="size-4 text-muted-foreground" aria-hidden="true" /><span className="sr-only">Поиск чатов</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Поиск" /></label></div>
          <Tabs defaultValue="all" className="px-4"><TabsList className="w-full"><TabsTrigger value="all" className="flex-1">Все</TabsTrigger><TabsTrigger value="direct" className="flex-1">Личные</TabsTrigger><TabsTrigger value="groups" className="flex-1">Группы</TabsTrigger></TabsList></Tabs>
          <div className="mt-2 flex h-[calc(100%-160px)] flex-col overflow-y-auto px-2 pb-4">
            {isLoading && <p className="p-4 text-sm text-muted-foreground">Загружаем чаты…</p>}
            {error && <p role="alert" className="p-4 text-sm text-destructive">Не удалось загрузить чаты.</p>}
            {!isLoading && !error && filtered.length === 0 && <div className="m-3 rounded-2xl bg-muted p-4 text-center"><MessageCircle className="mx-auto size-6 text-primary" /><p className="mt-2 text-sm font-medium">Начните разговор</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Нажмите плюс и найдите человека по уникальному username.</p></div>}
            {filtered.map((chat) => <button key={chat.id} onClick={() => { setActiveId(chat.id); setMobileChat(true) }} className={cn('flex items-center gap-3 rounded-2xl p-3 text-left hover:bg-muted', selectedId === chat.id && 'bg-accent')}><Avatar className="size-12"><AvatarFallback>{initials(chat.title)}</AvatarFallback></Avatar><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="truncate text-sm">{chat.title || 'Новый чат'}</strong><span className="text-[11px] text-muted-foreground">{formatTime(chat.latestAt)}</span></span><span className="mt-1 block truncate text-xs text-muted-foreground">{chat.latestMessage || 'Напишите первое сообщение'}</span></span></button>)}
          </div>
        </aside>

        <section className={cn('hidden min-w-0 flex-1 flex-col bg-background md:flex', mobileChat && 'flex')}>
          {selectedId ? <>
            <header className="flex h-[72px] shrink-0 items-center justify-between border-b bg-card px-3 md:px-5"><div className="flex min-w-0 items-center gap-3"><Button variant="ghost" size="icon" className="md:hidden" aria-label="Назад" onClick={() => setMobileChat(false)}><ChevronLeft /></Button><Avatar className="size-10"><AvatarFallback>{initials(activeConversation?.title ?? null)}</AvatarFallback></Avatar><div className="min-w-0"><h2 className="truncate font-semibold">{activeConversation?.title || 'Чат'}</h2><p className="text-xs text-primary">Pulse</p></div></div><div className="flex items-center gap-1"><IconButton label="Аудиозвонок" onClick={() => setCallMode('audio')}><Phone /></IconButton><IconButton label="Видеозвонок" onClick={() => setCallMode('video')}><Video /></IconButton><IconButton label="Подробнее"><Ellipsis /></IconButton></div></header>
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 md:px-8"><div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-end gap-3"><div className="mb-3 flex justify-center"><Badge variant="secondary" className="rounded-full">Защищённый разговор</Badge></div>{messageData?.messages.map((message) => { const mine = message.senderId === messageData.currentUserId; return <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}><div className={cn('max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm md:max-w-[66%]', mine ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md border bg-card')}>{message.kind === 'image' && message.body ? <img src={`/api/media?pathname=${encodeURIComponent(message.body)}`} alt={message.encryptedPayload?.name || 'Изображение'} className="mb-2 max-h-72 rounded-xl object-contain" /> : message.kind === 'audio' && message.body ? <div className="mb-2 flex items-center gap-2"><Headphones className="size-4" /><audio controls preload="metadata" src={`/api/media?pathname=${encodeURIComponent(message.body)}`} className="h-9 max-w-full" /></div> : message.kind === 'file' && message.body ? <a href={`/api/media?pathname=${encodeURIComponent(message.body)}`} target="_blank" rel="noreferrer" className="mb-2 flex items-center gap-2 underline underline-offset-4"><FileText className="size-4" />{message.encryptedPayload?.name || 'Открыть файл'}</a> : message.body}<span className={cn('ml-2 text-[10px]', mine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{formatTime(message.createdAt)}{mine ? ' · ✓' : ''}</span><div className="mt-2 flex flex-wrap gap-1">{['👍', '❤️', '🔥'].map((reaction) => { const state = message.reactions?.find((item) => item.reaction === reaction); return <button key={reaction} type="button" aria-label={`Реакция ${reaction}`} aria-pressed={state?.reacted ?? false} onClick={() => void toggleReaction(message, reaction)} className={cn('rounded-full border px-2 py-0.5 text-xs transition-colors', state?.reacted ? 'bg-accent text-accent-foreground' : 'bg-card text-card-foreground')}>{reaction}{state?.count ? ` ${state.count}` : ''}</button> })}</div></div></div> })}<div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3" /> Данные защищены при передаче и хранении</div></div></div>
            <footer className="shrink-0 border-t bg-card p-3 md:px-6 md:py-4"><div className="mx-auto flex max-w-3xl items-end gap-2"><label className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl hover:bg-muted" aria-label="Прикрепить файл"><Paperclip className="size-5" /><input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,image/gif,audio/webm,audio/ogg,audio/mp4,application/pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(file); event.target.value = '' }} /></label><label className="flex min-h-10 flex-1 items-center rounded-2xl bg-muted px-4 py-2 focus-within:ring-2 focus-within:ring-ring"><span className="sr-only">Сообщение</span><textarea rows={1} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); void sendMessage() } }} className="max-h-28 min-h-6 flex-1 resize-none bg-transparent text-sm leading-6 outline-none" placeholder="Напишите сообщение…" /><Button variant="ghost" size="icon-sm" aria-label="Смайлики"><Smile /></Button></label><Button size="icon-lg" className="rounded-2xl" disabled={sending} aria-label={draft.trim() ? 'Отправить' : 'Голосовое сообщение'} onClick={draft.trim() ? sendMessage : undefined}>{draft.trim() ? <Send /> : <Mic />}</Button></div></footer>
          </> : <div className="flex flex-1 items-center justify-center p-6"><div className="max-w-sm text-center"><div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-accent"><MessageCircle className="size-7 text-primary" /></div><h2 className="mt-4 text-xl font-semibold">Ваш Pulse начинается здесь</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Создайте первый чат по username. Сообщения синхронизируются между вашими устройствами.</p></div></div>}
        </section>

        <aside className="hidden w-[284px] shrink-0 flex-col border-l bg-card xl:flex"><div className="flex h-[72px] items-center px-5"><h2 className="font-semibold">О чате</h2></div><div className="flex flex-col items-center px-5 py-5 text-center"><Avatar className="size-20"><AvatarFallback className="text-xl">{initials(activeConversation?.title ?? null)}</AvatarFallback></Avatar><h3 className="mt-3 text-lg font-semibold">{activeConversation?.title || 'Pulse'}</h3><p className="text-sm text-muted-foreground">{activeConversation?.kind === 'direct' ? 'Личный чат' : 'Сообщество'}</p><div className="mt-5 flex gap-2"><IconButton label="Уведомления"><Bell /></IconButton><IconButton label="Безопасность"><ShieldCheck /></IconButton></div></div><Separator /><div className="p-4 text-sm leading-relaxed text-muted-foreground">Участники чата видят только доступные им сообщения. Сервер проверяет членство при каждом запросе.</div><div className="mt-auto p-4"><UpdateStatus /></div></aside>
      </section>
      {callMode && selectedId && <CallRoom conversationId={selectedId} video={callMode === 'video'} onClose={() => setCallMode(null)} />}
    </main>
  )
}
