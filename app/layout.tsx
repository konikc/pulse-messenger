import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

const manrope = Manrope({ subsets: ['cyrillic', 'latin'], variable: '--font-manrope' })

export const metadata: Metadata = {
  title: 'Pulse — общение в вашем ритме',
  description: 'Мягкий и быстрый мессенджер для личных разговоров, групп, каналов и звонков.',
  applicationName: 'Pulse',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f7f6' },
    { media: '(prefers-color-scheme: dark)', color: '#111715' },
  ],
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="bg-background">
      <body className={`${manrope.variable} font-sans antialiased`}>
        <TooltipProvider>{children}</TooltipProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
