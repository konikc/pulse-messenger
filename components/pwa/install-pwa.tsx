"use client"

import { useEffect, useState } from "react"
import { Check, Download, Share, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type Status = "loading" | "installed" | "prompt" | "ios" | "unavailable"

export function InstallPwa() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [status, setStatus] = useState<Status>("loading")

  useEffect(() => {
    if (typeof window === "undefined") return

    // 1) Already installed / running as an app?
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari exposes navigator.standalone
      window.navigator.standalone === true
    if (standalone) {
      setStatus("installed")
      return
    }

    // 2) iOS Safari has no beforeinstallprompt — show manual hint.
    const ua = window.navigator.userAgent.toLowerCase()
    const iOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua)
    if (iOS) {
      setStatus("ios")
      return
    }

    // 3) Chromium: wait for the install prompt event.
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setStatus("prompt")
    }
    const onInstalled = () => setStatus("installed")

    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)

    // If the prompt never fires (e.g. not eligible / already dismissed), keep a neutral state.
    const timer = window.setTimeout(() => {
      setStatus((s) => (s === "loading" ? "unavailable" : s))
    }, 3000)

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
      window.clearTimeout(timer)
    }
  }, [])

  async function handleInstall() {
    if (!deferred) return
    await deferred.prompt()
    const choice = await deferred.userChoice
    if (choice.outcome === "accepted") setStatus("installed")
    setDeferred(null)
  }

  if (status === "loading") return null

  // Already installed — friendly confirmation.
  if (status === "installed") {
    return (
      <section
        aria-label="Статус приложения"
        className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Check className="size-5" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-foreground">Приложение установлено</p>
      </section>
    )
  }

  const isIos = status === "ios"

  return (
    <section
      aria-label="Установка приложения"
      className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-lg shadow-foreground/5"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl"
      />
      <div className="relative flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
          <Smartphone className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-card-foreground">Установить приложение Pulse</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground text-pretty">
            {isIos
              ? "Откройте меню браузера и выберите «На экран «Домой», чтобы пользоваться Pulse как приложением."
              : "Добавьте Pulse на устройство для быстрого доступа, уведомлений и работы офлайн."}
          </p>

          {isIos ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              <Share className="size-4 shrink-0" aria-hidden="true" />
              <span>
                Нажмите <span className="font-medium text-foreground">«Поделиться»</span>, затем{" "}
                <span className="font-medium text-foreground">«На экран «Домой»</span>.
              </span>
            </div>
          ) : (
            <Button
              className="mt-3 w-full"
              onClick={handleInstall}
              disabled={status !== "prompt"}
            >
              <Download data-icon="inline-start" />
              {status === "prompt" ? "Установить" : "Установка недоступна"}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
