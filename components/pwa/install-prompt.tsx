'use client'

import { useEffect, useState } from 'react'
import { Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    // Register the service worker (required for installability).
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent))

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (isStandalone || installed) {
    return (
      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Check className="size-3.5 text-primary" /> Приложение установлено
      </p>
    )
  }

  if (deferred) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={async () => {
          await deferred.prompt()
          await deferred.userChoice
          setDeferred(null)
        }}
      >
        <Download data-icon="inline-start" /> Установить приложение Pulse
      </Button>
    )
  }

  if (isIos) {
    return (
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Чтобы установить Pulse: нажмите «Поделиться», затем «На экран „Домой“».
      </p>
    )
  }

  return (
    <p className="text-center text-xs leading-relaxed text-muted-foreground">
      Установка доступна из меню браузера: «Установить приложение».
    </p>
  )
}
