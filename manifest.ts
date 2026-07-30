import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pulse Messenger',
    short_name: 'Pulse',
    description:
      'Личный мессенджер для друзей и родственников: сообщения, файлы, голосовые и видеозвонки.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#ff5a3c',
    lang: 'ru',
    categories: ['social', 'communication'],
    icons: [
      {
        src: '/pulse-icon-512.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pulse-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pulse-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
