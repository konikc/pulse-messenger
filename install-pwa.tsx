"use client"

import { useEffect, useState } from "react"
import { Check, Download, Share, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}
type Status = "loading" | "installed" | "prompt" | "ios" | "manual"

export function InstallPwa() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [status, setStatus] = useState<Status>("loading")

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari property
      window.navigator.standalone === true
    if (standalone) return setStatus("installed")

    const ua = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua)) return setStatus("ios")

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
      setStatus("prompt")
    }
    const onInstalled = () => setStatus("installed")
    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    const timer = window.setTimeout(() => setStatus((value) => value === "loading" ? "manual" : value), 8000)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
      window.clearTimeout(timer)
    }
  }, [])

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    const choice = await deferred.userChoice
    if (choice.outcome === "accepted") setStatus("installed")
    setDeferred(null)
  }

  if (status === "loading") return null
  if (status === "installed") return <div className="flex items-center gap-2 rounded-xl border p-3 text-sm"><Check className="h-4 w-4 text-emerald-600" /> Приложение установлено</div>
  const manual = status === "ios" || status === "manual"
  return <div className="flex items-start gap-3 rounded-xl border p-3">
    <Smartphone className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
    <div className="flex-1">
      <p className="text-sm font-semibold">Установить приложение Pulse</p>
      <p className="mt-1 text-xs text-muted-foreground">{manual ? 'Откройте меню браузера и выберите «Установить» или «На экран «Домой».' : 'Быстрый доступ, уведомления и работа офлайн.'}</p>
      {manual ? <p className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-700"><Share className="h-4 w-4" /> Через меню браузера</p> : <Button size="sm" className="mt-2 gap-2" onClick={install}><Download className="h-4 w-4" /> Установить</Button>}
    </div>
  </div>
}
