import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pulse Messenger',
    short_name: 'Pulse',
    description: 'Мягкий и быстрый мессенджер для общения без лишнего шума.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui', 'browser'],
    background_color: '#f5f7f6',
    theme_color: '#167c68',
    lang: 'ru',
    dir: 'ltr',
    categories: ['social', 'communication'],
    orientation: 'any',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
