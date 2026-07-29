'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    // Register after load so it never competes with first paint.
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined)
    }
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
  }, [])

  return null
}
