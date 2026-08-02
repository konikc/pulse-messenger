# 00 — READ ME FIRST (AI handoff)

> **You are an AI continuing work on Pulse Messenger. Read this file completely before doing anything else.**
> It tells you what the project is, what has already been done, and exactly what is left to do so you can pick up
> without re-discovering everything. Keep this file updated as you make progress.

---

## 1. What Pulse is

Pulse is a **self-hosted, cross-platform messenger** (personal chats, groups, channels, voice/video calls).

- **Web:** Next.js 16 (App Router), React 19, Tailwind CSS v4. Runs on the owner's own VPS at **https://pulsemsg.ru**.
- **Android:** Capacitor wrapper that loads the web app.
- **Desktop (Windows/Linux):** Tauri wrapper.
- **Auth:** Neon Auth (`@neondatabase/auth`) — email/password (+ optional Google OAuth).
- **Database:** Neon Postgres via Drizzle ORM, using the standard `pg` driver (node-postgres), **not** the serverless driver.
- **Calls:** LiveKit.
- **Media storage:** the **local filesystem** (`lib/storage/local.ts`, path from `UPLOAD_DIR`). There is **no Vercel Blob**.

## 2. The mission of this branch

Convert the app from a **Vercel-hosted** build into a **fully self-hostable** one, then ship a deploy guide.

Concretely that means:
1. Remove Vercel-only dependencies: `@vercel/blob`, `@vercel/analytics`.
2. Replace Blob uploads with local filesystem storage (`lib/storage/local.ts` + `/api/media` routes).
3. Swap the Neon **serverless** DB driver for `pg` + `drizzle-orm/node-postgres`.
4. Fix the auth "infinite loading" bug (root cause: missing/short `NEON_AUTH_COOKIE_SECRET`).
5. Fix PWA (`public/sw.js`, `manifest.ts`, install prompt) and all hardcoded URLs → `pulsemsg.ru`.
6. Provide DB bootstrap (`drizzle/0000_init.sql` + `scripts/db-setup.mjs`, run via `pnpm db:setup`).
7. Write `DEPLOY.md` (Beget VPS: Node + pm2 + nginx + Let's Encrypt).

## 3. Environment variables (already set in this v0 project)

`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_AUTH_BASE_URL`, `NEON_PROJECT_ID`, plus the `PG*` / `POSTGRES_*`
mirrors are all present. **`NEON_AUTH_COOKIE_SECRET` must be 32+ chars** — this is the #1 cause of the login
"infinite loading" bug. Generate with `openssl rand -base64 32`. LiveKit vars
(`LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET`) are optional; calls degrade gracefully to a 503 when absent.

## 4. Important implementation notes / gotchas

- `lib/auth/server.ts` throws a clear error if `NEON_AUTH_COOKIE_SECRET` is missing or < 32 chars. In the v0 preview
  the app runs in a cross-site iframe, so cookies use `SameSite=None` in dev and `Lax` in production.
- `lib/db/index.ts` strips `sslmode` / `channel_binding` from the connection string and sets TLS via `ssl` explicitly
  to avoid `pg` deprecation warnings.
- `lib/storage/local.ts` resolves `UPLOAD_DIR` lazily per request and blocks path traversal (only the `pulse/` namespace).
- `next.config.mjs` uses `images.unoptimized` and `typescript.ignoreBuildErrors` — keep these for the static/self-host path.
- Native URL is centralized: `capacitor.config.ts` and `.env.native.example` point at `https://pulsemsg.ru`
  (override with `PULSE_APP_URL` for local Android).

## 5. Status checklist — UPDATE THIS AS YOU GO

- [x] Task 1 — Converge source to self-hosted target (remove Vercel Blob/Analytics, add local storage, fix auth, PWA, URLs) and delete stray root files.
- [x] Task 2 — Fix `package.json` deps, set `NEON_AUTH_COOKIE_SECRET`, install, and run a green `pnpm build`.
- [ ] Task 3 — Test the auth flow in the browser (sign-in → onboarding → app). Use the `agent-browser` skill.
- [ ] Task 4 — Write `DEPLOY.md` self-host tutorial and push to the branch.

## 6. If you are starting fresh

1. `pnpm install`
2. Confirm `NEON_AUTH_COOKIE_SECRET` is set and 32+ chars.
3. `pnpm build` — must be green.
4. `pnpm dev`, then verify `/auth/sign-in` loads (no infinite spinner) and the app shell renders.
5. Finish whatever is unchecked in section 5, then commit and push to the working branch and open/update the PR.

## 7. Files that matter most

```
lib/auth/server.ts          Neon Auth server + cookie-secret guard
lib/auth/client.ts          Neon Auth browser client
lib/db/index.ts             pg Pool + Drizzle (node-postgres)
lib/db/schema.ts            Drizzle schema (profiles, conversations, messages, ...)
lib/storage/local.ts        Local filesystem media storage
app/api/media/route.ts      Serve uploaded media (auth-gated)
app/api/media/upload/route.ts  Upload media to local storage
app/api/calls/token/route.ts   LiveKit token (503 when unconfigured)
components/messenger/pulse-app.tsx   Main app shell
components/pwa/install-prompt.tsx    PWA install prompt
drizzle/0000_init.sql       DB bootstrap SQL
scripts/db-setup.mjs        Applies drizzle/*.sql  ->  pnpm db:setup
DEPLOY.md                   Self-host tutorial (Beget VPS)
```
