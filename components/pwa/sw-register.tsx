"use client"

import { useEffect } from "react"

/** Registers the service worker once, in the browser only. Renders nothing. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return
    const onLoad = () => navigator.serviceWorker.register("/sw.js").catch(() => {})
    window.addEventListener("load", onLoad)
    return () => window.removeEventListener("load", onLoad)
  }, [])

  return null
}
