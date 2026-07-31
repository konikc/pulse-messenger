# 00 — READ ME FIRST (для следующего ИИ)

> ЭТОТ ФАЙЛ НАДО ПРОЧИТАТЬ ПЕРВЫМ. Если предыдущий ИИ не успел закончить из-за лимитов —
> продолжи ровно с того места, где он остановился. Экономь токены: не переписывай то, что уже работает.

## Проект
Pulse Messenger — Next.js 16 (App Router) мессенджер. Владелец хостит всё сам на **VPS Beget**,
домен **pulsemsg.ru**. НЕЛЬЗЯ делать проект зависимым от Vercel (Vercel можно использовать только
для превью/тестов v0). Всё должно запускаться `next build` + `next start` за nginx на своём сервере.

## Стек
- Next.js 16, React 19, Tailwind v4, shadcn-подобные UI-компоненты в `components/ui`.
- Аутентификация: **Neon Auth** (`@neondatabase/auth` 0.4.2-beta). Хостится в Neon (это НЕ Vercel — оставляем).
  - `lib/auth/server.ts` — `createNeonAuth({ baseUrl, cookies:{ secret } })`.
  - `lib/auth/client.ts` — `createAuthClient()`.
  - Роут-хендлер: `app/api/auth/[...path]/route.ts`.
  - Middleware: `proxy.ts`.
- БД: **Neon Postgres** + Drizzle (`lib/db`). Таблицы: `profiles`, разговоры, сообщения и т.д.
- Звонки: LiveKit (`app/api/calls/token`).
- Медиа-хранилище: РАНЬШЕ был `@vercel/blob`. Переведено на локальный диск (см. `lib/storage`).

## КОРНЕВАЯ ПРИЧИНА багов входа (ГЛАВНОЕ)
`NEON_AUTH_COOKIE_SECRET` НЕ был задан. `createNeonAuth` бросает ошибку, если `cookies.secret`
короче 32 символов → КАЖДЫЙ запрос к `/api/auth/*` падает с 500 → бесконечная загрузка,
Google-вход и регистрация не работают.
**Решение:** задать env `NEON_AUTH_COOKIE_SECRET` (>=32 символов, `openssl rand -base64 32`).

## Обязательные переменные окружения (и в v0, и на VPS)
```
NEON_AUTH_BASE_URL=<из Neon Auth>            # уже есть
NEON_AUTH_COOKIE_SECRET=<32+ символов>        # ГЛАВНОЕ, задать!
DATABASE_URL=<Neon pooled>                    # уже есть
DATABASE_URL_UNPOOLED=<Neon direct>           # уже есть
NEXT_PUBLIC_APP_URL=https://pulsemsg.ru       # публичный адрес
LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET  # для звонков (если нужны)
UPLOAD_DIR=/var/www/pulse/data/uploads        # куда сохранять медиа на VPS
GITHUB_OWNER=konikc / GITHUB_REPO=pulse-messenger  # для проверки обновлений desktop
```

## Google-вход
Код верный (`authClient.signIn.social({ provider:'google', callbackURL })`).
Чтобы заработало — в консоли **Neon Auth** включить провайдер Google и добавить в Google Cloud
Console redirect URI: `https://pulsemsg.ru/api/auth/callback/google` (и для теста — превью-URL).
Если после задания cookie-secret Google всё ещё не работает — проблема в конфиге провайдера, НЕ в коде.

## Что уже сделано (проверь git log / diff)
- [x] `lib/auth/server.ts` — понятная ошибка + чтение `NEON_AUTH_COOKIE_SECRET`, sameSite prod=lax/dev=none.
- [x] PWA: сгенерированы PNG-иконки 192/512, обновлён `app/manifest.ts` (иконки PNG any+maskable). Это чинит «скачивание PWA недоступно».
- [x] Удалён `@vercel/analytics` из `app/layout.tsx`.
- [x] Медиа переведено на локальный диск: `lib/storage/local.ts`, `app/api/media/*` больше не используют `@vercel/blob`.
- [x] `vercel.app` URL заменены на `pulsemsg.ru`.
- [x] Security-заголовки в `next.config.mjs`.
- [x] `DEPLOY.md` — инструкция для Beget VPS (Node+pm2+nginx+certbot).

## Что может остаться доделать
- [ ] Прогнать `pnpm build` и убедиться что билд зелёный.
- [ ] Проверить вход/регистрацию/Google в браузере (agent-browser) ПОСЛЕ того как задан COOKIE_SECRET.
- [ ] Запушить в ветку `progressive-web-application-1`.
- [ ] Убедиться что `@vercel/blob` и `@vercel/analytics` удалены из `package.json`.

## Как тестировать вход
1. Убедись что `NEON_AUTH_COOKIE_SECRET` задан (иначе всё падает).
2. `pnpm build && pnpm start`, открой `/auth/sign-in`.
3. Регистрация email+пароль → должно редиректить на `/onboarding`, затем на `/`.
4. Не должно быть бесконечного спиннера. Если есть — смотри логи `/api/auth/*` (обычно снова секрет/baseUrl).

## Правила
- НЕ добавлять обратно Vercel-зависимости. НЕ деплоить на Vercel как основную площадку.
- Экономь токены, редактируй только нужные файлы, пиши постамбулы коротко.
- Ветка для пуша: `progressive-web-application-1`.
