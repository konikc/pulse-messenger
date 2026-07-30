import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://pulsemsg.ru'),
  title: {
    default: 'Pulse Messenger',
    template: '%s — Pulse Messenger',
  },
  description:
    'Pulse Messenger — личный мессенджер для друзей и родственников: сообщения, файлы, голосовые и видеозвонки. PWA-приложение, устанавливается прямо из браузера.',
  applicationName: 'Pulse Messenger',
  generator: 'v0.app',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pulse',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://pulsemsg.ru',
    siteName: 'Pulse Messenger',
    title: 'Pulse Messenger',
    description:
      'Личный мессенджер для друзей и родственников: сообщения, файлы, голосовые и видеозвонки.',
  },
  icons: {
    icon: '/pulse-icon-512.png',
    apple: '/pulse-icon-512.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ff5a3c',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className="bg-background">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
