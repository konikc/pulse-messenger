'use client'

import { useMemo, useState } from 'react'
import {
  Archive, Bell, ChevronLeft, CircleUserRound, Ellipsis, FileText, Headphones,
  Image as ImageIcon, LockKeyhole, Menu, MessageCircle, Mic, Moon, Paperclip,
  Phone, Plus, Search, Send, Settings, ShieldCheck, Smile, Users, Video,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PulseLogo } from '@/components/pulse-logo'
import { UpdateStatus } from '@/components/messenger/update-status'
import { cn } from '@/lib/utils'

const chats = [
  { id: 1, name: 'Мила Орлова', avatar: '🌿', message: 'Да, звучит отлично. До встречи!', time: '12:42', unread: 2, online: true },
  { id: 2, name: 'Команда Pulse', avatar: '⚡', message: 'Лера: Добавила новые макеты', time: '11:18', unread: 5 },
  { id: 3, name: 'Макс', avatar: '🎧', message: 'Голосовое сообщение · 0:18', time: 'вчера' },
  { id: 4, name: 'Личный архив', avatar: '☁️', message: 'Билеты на пятницу.pdf', time: 'пн' },
  { id: 5, name: 'Дизайн-сообщество', avatar: '✦', message: 'Новый пост в канале', time: 'вс', unread: 12 },
]

const messages = [
  { id: 1, mine: false, text: 'Привет! Как тебе идея встретиться сегодня после работы?', time: '12:36' },
  { id: 2, mine: true, text: 'Привет! Я за. Давай в том тихом месте у парка?', time: '12:38', reaction: '♡ 2' },
  { id: 3, mine: false, text: 'Идеально. Буду примерно в семь', time: '12:39' },
  { id: 4, mine: false, voice: true, time: '12:40' },
  { id: 5, mine: true, text: 'Да, звучит отлично. До встречи!', time: '12:42', delivered: true },
]

function IconButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label={label} onClick={onClick} />}>
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function PulseApp() {
  const [activeChat, setActiveChat] = useState(1)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [sent, setSent] = useState<string[]>([])
  const [mobileChat, setMobileChat] = useState(false)
  const filtered = useMemo(() => chats.filter((chat) => chat.name.toLowerCase().includes(query.toLowerCase())), [query])

  function sendMessage() {
    const value = draft.trim()
    if (!value) return
    setSent((items) => [...items, value])
    setDraft('')
  }

  return (
    <main className="flex min-h-dvh bg-background p-0 md:p-3">
      <section className="mx-auto flex h-dvh w-full max-w-[1480px] overflow-hidden bg-card md:h-[calc(100dvh-1.5rem)] md:rounded-3xl md:border md:shadow-xl">
        <aside className="hidden w-[76px] shrink-0 flex-col items-center border-r bg-sidebar py-4 md:flex">
          <PulseLogo className="[&>span:last-child]:hidden" />
          <nav className="mt-8 flex flex-1 flex-col gap-2" aria-label="Основная навигация">
            <Button size="icon-lg" className="rounded-2xl" aria-label="Сообщения"><MessageCircle /></Button>
            <IconButton label="Контакты"><Users /></IconButton>
            <IconButton label="Звонки"><Phone /></IconButton>
            <IconButton label="Архив"><Archive /></IconButton>
          </nav>
          <div className="flex flex-col gap-2">
            <IconButton label="Настройки"><Settings /></IconButton>
            <Avatar className="size-9"><AvatarFallback>🫧</AvatarFallback></Avatar>
          </div>
        </aside>

        <aside className={cn('w-full shrink-0 border-r bg-card md:w-[330px]', mobileChat && 'hidden md:block')}>
          <header className="flex h-[72px] items-center justify-between px-4">
            <PulseLogo className="md:hidden" />
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold tracking-tight">Сообщения</h1>
              <p className="text-xs text-muted-foreground">Все ваши разговоры</p>
            </div>
            <Button size="icon" className="rounded-xl" aria-label="Создать чат"><Plus /></Button>
          </header>
          <div className="px-4 pb-3">
            <label className="flex h-10 items-center gap-2 rounded-xl bg-muted px-3 focus-within:ring-2 focus-within:ring-ring">
              <Search className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Поиск чатов</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Поиск" />
            </label>
          </div>
          <Tabs defaultValue="all" className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">Все</TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">Новые</TabsTrigger>
              <TabsTrigger value="groups" className="flex-1">Группы</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="mt-2 flex h-[calc(100%-160px)] flex-col overflow-y-auto px-2 pb-4">
            {filtered.map((chat) => (
              <button key={chat.id} onClick={() => { setActiveChat(chat.id); setMobileChat(true) }} className={cn('flex items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-muted', activeChat === chat.id && 'bg-accent')}>
                <div className="relative">
                  <Avatar className="size-12"><AvatarFallback className="text-xl">{chat.avatar}</AvatarFallback></Avatar>
                  {chat.online && <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-primary" aria-label="В сети" />}
                </div>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <strong className="truncate text-sm font-semibold">{chat.name}</strong>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{chat.time}</span>
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted-foreground">{chat.message}</span>
                    {!!chat.unread && <Badge className="min-w-5 justify-center rounded-full px-1.5">{chat.unread}</Badge>}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className={cn('hidden min-w-0 flex-1 flex-col bg-background md:flex', mobileChat && 'flex')}>
          <header className="flex h-[72px] shrink-0 items-center justify-between border-b bg-card px-3 md:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Назад" onClick={() => setMobileChat(false)}><ChevronLeft /></Button>
              <Avatar className="size-10"><AvatarFallback className="text-lg">🌿</AvatarFallback></Avatar>
              <div className="min-w-0"><h2 className="truncate font-semibold">Мила Орлова</h2><p className="text-xs text-primary">в сети</p></div>
            </div>
            <div className="flex items-center gap-1">
              <IconButton label="Аудиозвонок"><Phone /></IconButton>
              <IconButton label="Видеозвонок"><Video /></IconButton>
              <IconButton label="Подробнее"><Ellipsis /></IconButton>
            </div>
          </header>

          <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 md:px-8">
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-end gap-3">
              <div className="mb-3 flex justify-center"><Badge variant="secondary" className="rounded-full">Сегодня</Badge></div>
              {messages.map((message) => (
                <div key={message.id} className={cn('flex', message.mine ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm md:max-w-[66%]', message.mine ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md border bg-card text-card-foreground')}>
                    {message.voice ? (
                      <div className="flex min-w-52 items-center gap-3"><Button size="icon-sm" variant="secondary" className="rounded-full" aria-label="Воспроизвести"><Headphones /></Button><div className="flex flex-1 items-end gap-0.5" aria-label="Волновая форма голосового сообщения">{[2,4,7,5,9,6,3,8,5,4,7,2,6,8,4,3].map((h,i)=><span key={i} className="w-0.5 rounded-full bg-primary/50" style={{height:`${h+4}px`}} />)}</div><span className="text-xs text-muted-foreground">0:18</span></div>
                    ) : message.text}
                    <span className={cn('ml-2 text-[10px]', message.mine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{message.time}{message.delivered ? ' · ✓✓' : ''}</span>
                    {message.reaction && <span className={cn('ml-2 inline-flex rounded-full px-1.5 py-0.5 text-[10px]', message.mine ? 'bg-primary-foreground/15' : 'bg-muted')}>{message.reaction}</span>}
                  </div>
                </div>
              ))}
              {sent.map((text, index) => <div key={`${text}-${index}`} className="flex justify-end"><div className="max-w-[82%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm">{text}<span className="ml-2 text-[10px] text-primary-foreground/70">сейчас · ✓</span></div></div>)}
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3" /> Сообщения защищены при передаче</div>
            </div>
          </div>

          <footer className="shrink-0 border-t bg-card p-3 md:px-6 md:py-4">
            <div className="mx-auto flex max-w-3xl items-end gap-2">
              <IconButton label="Прикрепить файл"><Paperclip /></IconButton>
              <label className="flex min-h-10 flex-1 items-center rounded-2xl bg-muted px-4 py-2 focus-within:ring-2 focus-within:ring-ring">
                <span className="sr-only">Сообщение</span>
                <textarea rows={1} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); sendMessage() } }} className="max-h-28 min-h-6 flex-1 resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground" placeholder="Напишите сообщение…" />
                <Button variant="ghost" size="icon-sm" aria-label="Выбрать эмодзи"><Smile /></Button>
              </label>
              <Button size="icon-lg" className="rounded-2xl" aria-label={draft.trim() ? 'Отправить' : 'Голосовое сообщение'} onClick={draft.trim() ? sendMessage : undefined}>{draft.trim() ? <Send /> : <Mic />}</Button>
            </div>
          </footer>
        </section>

        <aside className="hidden w-[284px] shrink-0 flex-col border-l bg-card xl:flex">
          <div className="flex h-[72px] items-center justify-between px-5"><h2 className="font-semibold">О чате</h2><IconButton label="Закрыть панель"><Menu /></IconButton></div>
          <div className="flex flex-col items-center px-5 py-5 text-center">
            <Avatar className="size-20"><AvatarFallback className="text-3xl">🌿</AvatarFallback></Avatar>
            <h3 className="mt-3 text-lg font-semibold">Мила Орлова</h3><p className="text-sm text-muted-foreground">@mila</p>
            <div className="mt-5 flex gap-2"><IconButton label="Уведомления"><Bell /></IconButton><IconButton label="Поиск"><Search /></IconButton><IconButton label="Без звука"><Moon /></IconButton></div>
          </div>
          <Separator />
          <div className="flex flex-col gap-1 p-3">
            {[{icon:ImageIcon,label:'Медиа',count:'128'},{icon:FileText,label:'Файлы',count:'24'},{icon:ShieldCheck,label:'Секретный чат',count:'E2EE'},{icon:CircleUserRound,label:'Общие группы',count:'3'}].map((item)=><button key={item.label} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-muted"><item.icon className="size-4 text-muted-foreground" /><span className="flex-1 text-left">{item.label}</span><span className="text-xs text-muted-foreground">{item.count}</span></button>)}
          </div>
          <div className="mt-auto p-4"><UpdateStatus /></div>
        </aside>
      </section>
    </main>
  )
}
