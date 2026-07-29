# Pulse Messenger

Pulse is a cross-platform messenger for [Web](https://pulse-messenger.vercel.app), Android, Windows, and Linux, built with Next.js, Capacitor, and Tauri.

Production native clients load the stable `https://pulse-messenger.vercel.app` alias. For local Android development, override it explicitly, for example `PULSE_APP_URL=http://10.0.2.2:3000 pnpm android:sync`; Tauri development continues to use `http://localhost:3000` through `devUrl`.

Windows release builds use the GUI subsystem and therefore open without a Command Prompt window. Debug builds intentionally keep the console available for diagnostics.

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_qP6slcSxKorbTzppXjGHMIBeT6v0)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Развёртывание на Beget (VPS)

1. **Node.js 22+** и **PostgreSQL** (можно Neon или локальный) должны быть установлены.
2. Задайте переменные окружения (файл `.env.production` или панель Beget):

   ```bash
   DATABASE_URL=postgres://user:pass@host:5432/pulse
   NEON_AUTH_BASE_URL=https://<ваш-проект>.neon.tech
   NEON_AUTH_COOKIE_SECRET=<openssl rand -base64 32>
   PULSE_APP_URL=https://ваш-домен
   ```

3. Один раз создайте таблицы:

   ```bash
   psql "$DATABASE_URL" -f lib/db/schema.sql
   ```

4. Соберите и запустите:

   ```bash
   pnpm install --frozen-lockfile
   pnpm build
   pnpm start   # слушает порт 3000, проксируйте через nginx
   ```

5. Настройте systemd/PM2 для автозапуска и nginx как reverse-proxy на порт 3000.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
