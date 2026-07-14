import type { CapacitorConfig } from '@capacitor/cli'

const appUrl = process.env.PULSE_APP_URL ?? 'http://localhost:3000'

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
