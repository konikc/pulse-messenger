import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pulse Messenger',
    short_name: 'Pulse',
    description: 'Мягкий и быстрый мессенджер для общения без лишнего шума.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f7f6',
    theme_color: '#167c68',
    lang: 'ru',
    orientation: 'any',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  }
}
