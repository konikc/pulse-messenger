# 00 — READ ME FIRST (AI handoff)

> **You are an AI continuing work on Pulse Messenger. Read this file completely before doing anything else.**
> It tells you what the project is, what has already been done, and exactly what is left to do so you can pick up
> without re-discovering everything. **Keep this file updated as you make progress** (edit section 5 as you finish tasks).

---

## 1. What Pulse is

Pulse is a **self-hosted, cross-platform messenger** (personal chats, groups, channels, voice/video calls).

- **Web:** Next.js 16 (App Router), React 19, Tailwind CSS v4. Runs on the owner's own VPS at **https://pulsemsg.ru**.
- **Android:** Capacitor wrapper that loads the web app (`capacitor.config.ts`, `android/`).
- **Desktop (Windows/Linux):** Tauri wrapper (`src-tauri/`).
- **Auth:** Neon Auth (`@neondatabase/auth`) — email/password.
- **Database:** Neon Postgres via Drizzle ORM using the standard `pg` driver (node-postgres), **not** the serverless driver.
- **Calls:** LiveKit (`@livekit/components-react`, `livekit-server-sdk`).
- **Media storage:** the **local filesystem** (`lib/storage/local.ts`, path from `UPLOAD_DIR`). There is **no Vercel Blob**.

## 2. The mission of this branch

Convert the app from a **Vercel-hosted** build into a **fully self-hostable** one, then ship a deploy guide.

Concretely:
1. Remove Vercel-only dependencies: `@vercel/blob`, `@vercel/analytics`.
2. Replace Blob uploads with local filesystem storage (`lib/storage/local.ts` + `/api/media` routes).
3. Use `pg` + `drizzle-orm/node-postgres` (not the Neon serverless driver).
4. Fix the auth "infinite loading" bug (root cause: missing/short `NEON_AUTH_COOKIE_SECRET`).
5. Fix PWA (`public/sw.js`, `app/manifest.ts`, install/service-worker registration) and hardcoded URLs → `pulsemsg.ru`.
6. Provide DB bootstrap (`drizzle/0000_init.sql` + `scripts/db-setup.mjs`, run via `pnpm db:setup`).
7. Write `DEPLOY.md` (Beget/generic VPS: Node + pm2 + nginx + Let's Encrypt).

## 3. Environment variables (already set in this v0 project)

`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_AUTH_BASE_URL`, `NEON_PROJECT_ID`, plus the `PG*` / `POSTGRES_*`
mirrors are all present. **`NEON_AUTH_COOKIE_SECRET` must be 32+ chars** — this is the #1 cause of the login
"infinite loading" bug. Generate with `openssl rand -base64 32`. LiveKit vars
(`LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET`) are optional; calls degrade gracefully to a 503 when absent.

## 4. Important implementation notes / gotchas

- `lib/auth/server.ts` throws a clear error if the Neon Auth env vars are missing. In the v0 preview the app runs in a
  cross-site iframe, so cookies use `SameSite=None` in dev and `Lax` in production.
- `lib/db/index.ts` = `pg` `Pool` + `drizzle(pool, { schema })` on `DATABASE_URL`.
- `lib/storage/local.ts` resolves `UPLOAD_DIR` lazily per request and blocks path traversal (only the `pulse/` namespace).
  Files are written under `<UPLOAD_DIR>/pulse/<userId>/...` with a sibling `.meta` JSON holding the content type.
- `next.config.mjs` uses `images.unoptimized` and `typescript.ignoreBuildErrors` — keep these for the static/self-host path.
- `scripts/db-setup.mjs` applies every `drizzle/*.sql` file in order to `DATABASE_URL` (idempotent, `IF NOT EXISTS`).
- Native URL is centralized: `capacitor.config.ts` / `.env.native.example` point at `https://pulsemsg.ru`
  (override with `PULSE_APP_URL` for local Android).

### History gotcha (why the branch looked broken)

This branch was assembled by manual "Add files via upload" commits, which:
- **Dumped duplicate files into the repo root** (e.g. `page.tsx`, `layout.tsx`, `server.ts`, `button.tsx`,
  `legal-data.ts`, `pulse-source.zip`, …). Those root copies are dead — the real files live under `app/`, `components/`, `lib/`.
- **Reverted the media routes back to `@vercel/blob`** and re-added `@vercel/analytics`, while dropping the
  `pg` / `swr` / LiveKit deps the code actually imports — so `pnpm build` failed.
These were fixed by restoring the local-storage media routes, aligning `package.json`, and deleting the stray root files.

## 5. Status checklist — UPDATE THIS AS YOU GO

- [x] Task 1 — Converge source to self-hosted target (local storage media routes, `pg` driver, PWA, remove Vercel Blob/Analytics) and delete stray root files.
- [x] Task 2 — Fix `package.json` deps (`pg`, `@types/pg`, `swr`, LiveKit components; drop `@vercel/*` + serverless), install, and run a green `pnpm build`.
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
lib/auth/server.ts             Neon Auth server + cookie config
lib/auth/client.ts             Neon Auth browser client
lib/auth/require-user.ts       requireUserId() guard for API routes
lib/db/index.ts                pg Pool + Drizzle (node-postgres)
lib/db/schema.ts               Drizzle schema (profiles, conversations, messages, ...)
lib/storage/local.ts           Local filesystem media storage (putFile / getFile)
app/api/media/route.ts         Serve uploaded media (auth-gated)
app/api/media/upload/route.ts  Upload media to local storage
app/api/calls/token/route.ts   LiveKit token (503 when unconfigured)
components/messenger/pulse-app.tsx   Main app shell
components/pwa/sw-register.tsx        Service worker registration
drizzle/0000_init.sql          DB bootstrap SQL
scripts/db-setup.mjs           Applies drizzle/*.sql  ->  pnpm db:setup
DEPLOY.md                      Self-host tutorial
```
