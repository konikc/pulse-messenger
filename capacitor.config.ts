import type { CapacitorConfig } from '@capacitor/cli'

const appUrl = process.env.PULSE_APP_URL ?? 'https://pulse-messenger.vercel.app'

if (!appUrl.startsWith('https://') && process.env.NODE_ENV === 'production') {
  throw new Error('PULSE_APP_URL must use HTTPS for production builds')
}

const config: CapacitorConfig = {
  appId: 'app.pulse.messenger',
  appName: 'Pulse',
  webDir: 'public',
  server: {
    url: appUrl,
    cleartext: appUrl.startsWith('http://'),
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: appUrl.startsWith('http://'),
  },
}

export default config
