'use client'

import { useCallback, useState, useSyncExternalStore } from 'react'
import { Check, Download, Share, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// A tiny external store that tracks the pending install prompt and installed
// state. Using useSyncExternalStore keeps everything SSR-safe (no hydration
// mismatch) and avoids calling setState inside an effect.
let deferredPrompt: BeforeInstallPromptEvent | null = null
let isInstalled = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  const onBeforeInstall = (event: Event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    emit()
  }
  const onInstalled = () => {
    isInstalled = true
    deferredPrompt = null
    emit()
  }

  if (listeners.size === 1) {
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }
}

function getSnapshot() {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  // Encode both booleans into a stable primitive so React can compare snapshots.
  return `${isInstalled || standalone}|${deferredPrompt ? '1' : '0'}`
}

function getServerSnapshot() {
  return 'false|0'
}

function detectIosSafari() {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent.toLowerCase()
  const iosDevice = /iphone|ipad|ipod/.test(ua)
  const isSafari = iosDevice && !/crios|fxios/.test(ua)
  return iosDevice && isSafari
}

export function InstallApp() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [installedFlag, hasPrompt] = snapshot.split('|')
  const installed = installedFlag === 'true'
  const [isIos] = useState(detectIosSafari)
  const [showIosHint, setShowIosHint] = useState(false)

  const handleInstall = useCallback(async () => {
    if (isIos) {
      setShowIosHint((value) => !value)
      return
    }
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') isInstalled = true
    deferredPrompt = null
    emit()
  }, [isIos])

  if (installed) {
    return (
      <div className="rounded-2xl bg-accent p-4">
        <div className="flex items-center gap-2 font-medium">
          <Check className="size-4 text-primary" /> Приложение установлено
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Pulse запущен как отдельное приложение. Приятного общения!
        </p>
      </div>
    )
  }

  const canPrompt = hasPrompt === '1' || isIos

  return (
    <div className="rounded-2xl bg-accent p-4">
      <div className="flex items-center gap-2 font-medium">
        <Sparkles className="size-4 text-primary" /> Установить Pulse
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {canPrompt
          ? 'Добавьте приложение на устройство — Windows, Linux, Android или iOS.'
          : 'Откройте сайт в Chrome, Edge или Safari, чтобы установить приложение.'}
      </p>

      {showIosHint && isIos && (
        <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-card p-2 text-xs leading-relaxed text-muted-foreground">
          <Share className="mt-0.5 size-3.5 shrink-0" />
          Нажмите «Поделиться», затем «На экран “Домой”».
        </p>
      )}

      <div className="mt-3">
        <Button size="sm" onClick={handleInstall} disabled={!canPrompt}>
          <Download data-icon="inline-start" /> Установить приложение
        </Button>
      </div>
    </div>
  )
}
