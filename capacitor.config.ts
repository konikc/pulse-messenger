import type { CapacitorConfig } from '@capacitor/cli'

const appUrl = process.env.PULSE_APP_URL ?? 'https://pulse-messenger-10imd7c7p-shelperapp-7107s-projects.vercel.app'

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
