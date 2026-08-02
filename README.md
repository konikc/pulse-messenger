# Pulse Messenger

Pulse is a self-hosted, cross-platform messenger for Web ([pulsemsg.ru](https://pulsemsg.ru)),
Android, Windows, and Linux, built with Next.js 16, Capacitor, and Tauri.

The app is designed to run on your own server (VPS). Production native clients load the stable
`https://pulsemsg.ru` URL. For local Android development, override it explicitly, e.g.
`PULSE_APP_URL=http://10.0.2.2:3000 pnpm android:sync`; Tauri development uses
`http://localhost:3000` through `devUrl`.

Windows release builds use the GUI subsystem and open without a Command Prompt window.

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Auth:** Neon Auth (`@neondatabase/auth`) — email/password + Google OAuth
- **Database:** Neon Postgres + Drizzle ORM
- **Calls:** LiveKit
- **Media storage:** local filesystem (`lib/storage/local.ts`, configurable via `UPLOAD_DIR`)
- **Native:** Capacitor (Android) + Tauri (Windows/Linux desktop)

## Getting started (local)

```bash
pnpm install
cp .env.native.example .env.local   # then fill in the real values
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required environment variables

See `.env.native.example` and `DEPLOY.md`. The critical ones:

| Variable | Purpose |
| --- | --- |
| `NEON_AUTH_BASE_URL` | Neon Auth server URL |
| `NEON_AUTH_COOKIE_SECRET` | Session cookie secret, **32+ chars** (`openssl rand -base64 32`) |
| `DATABASE_URL` / `DATABASE_URL_UNPOOLED` | Neon Postgres connection strings |
| `NEXT_PUBLIC_APP_URL` | Public site URL, e.g. `https://pulsemsg.ru` |
| `UPLOAD_DIR` | Directory for uploaded media on the server |
| `LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` | Voice/video calls |

## Production build

```bash
pnpm build
pnpm start   # serves on port 3000 by default
```

## Deployment

Full step-by-step instructions for a Beget VPS (Node.js + pm2 + nginx + Let's Encrypt) are in
[`DEPLOY.md`](./DEPLOY.md).
