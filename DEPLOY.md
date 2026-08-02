# Deploying Pulse Messenger on your own VPS

This guide walks through self-hosting the **web** app (Next.js) on a plain Linux VPS
(e.g. Beget, Hetzner, a DigitalOcean droplet, etc.) using **Node + pm2 + nginx + Let's Encrypt**.
The Android (Capacitor) and desktop (Tauri) clients simply load this web deployment, so once
the site is live at your domain they work too.

> Example domain used throughout: **`pulsemsg.ru`**. Replace it with your own everywhere.

---

## 0. What you need

- A VPS running Ubuntu/Debian (root or a sudo user).
- A domain pointed at the VPS public IP (an `A` record for `pulsemsg.ru`).
- A **Postgres** database. Either:
  - a managed [Neon](https://neon.tech) project (recommended — it also provides Neon Auth), or
  - your own Postgres server (`apt install postgresql`).
- Optionally, a [LiveKit](https://livekit.io) project for voice/video calls (calls degrade to
  HTTP 503 when unconfigured — the rest of the app still works).

---

## 1. Install the system dependencies

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm + pm2 (process manager) + nginx + certbot
sudo npm install -g pnpm pm2
sudo apt-get install -y nginx
sudo apt-get install -y certbot python3-certbot-nginx
```

---

## 2. Get the code

```bash
sudo mkdir -p /var/www && cd /var/www
git clone https://github.com/konikc/pulse-messenger.git pulse
cd pulse
pnpm install
```

---

## 3. Configure environment variables

Create `/var/www/pulse/.env.production.local` (Next.js loads it automatically):

```bash
# --- Database (node-postgres / pg driver) ---
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/pulse?sslmode=require

# --- Neon Auth (email/password) ---
NEON_AUTH_BASE_URL=https://YOUR-PROJECT.neonauth.REGION.aws.neon.tech/neondb/auth
# MUST be 32+ characters. Generate one:  openssl rand -base64 32
NEON_AUTH_COOKIE_SECRET=paste-a-long-random-secret-here

# --- Media storage (local filesystem, NOT Vercel Blob) ---
# Persistent directory for uploads. Create it and make it writable (step 4).
UPLOAD_DIR=/var/www/pulse-data/uploads

# --- Calls (optional) ---
LIVEKIT_URL=wss://YOUR-PROJECT.livekit.cloud
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# --- Native / desktop clients point here ---
PULSE_APP_URL=https://pulsemsg.ru
```

> **The #1 cause of the login "infinite loading" bug is a missing or too-short
> `NEON_AUTH_COOKIE_SECRET`.** It must be at least 32 characters. Always generate it with
> `openssl rand -base64 32`.

If you use your own Postgres instead of Neon, you still need a Neon Auth base URL for
email/password auth, or swap in your own auth provider.

---

## 4. Create the uploads directory

Media (avatars, images, attachments) is written to the local filesystem under `UPLOAD_DIR`,
in a `pulse/<userId>/...` namespace. Keep it **outside** the git checkout so deploys never wipe it:

```bash
sudo mkdir -p /var/www/pulse-data/uploads
sudo chown -R "$USER":"$USER" /var/www/pulse-data
```

---

## 5. Initialise the database schema

This applies every SQL file in `drizzle/` (idempotent — safe to re-run):

```bash
cd /var/www/pulse
set -a && source .env.production.local && set +a
pnpm db:setup
```

You should see `Applying 0000_init.sql... done` then `Database schema is up to date.`

---

## 6. Build and start with pm2

```bash
cd /var/www/pulse
pnpm build
pm2 start "pnpm start" --name pulse --time
pm2 save
pm2 startup   # follow the printed command so pulse restarts on reboot
```

`pnpm start` serves the app on **port 3000** by default. Set `PORT=3000` explicitly in the
pm2 command if you want to be sure.

---

## 7. Put nginx in front (reverse proxy)

Create `/etc/nginx/sites-available/pulse`:

```nginx
server {
    listen 80;
    server_name pulsemsg.ru www.pulsemsg.ru;

    # Allow larger uploads (media)
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable it and reload:

```bash
sudo ln -s /etc/nginx/sites-available/pulse /etc/nginx/sites-enabled/pulse
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. Enable HTTPS with Let's Encrypt

```bash
sudo certbot --nginx -d pulsemsg.ru -d www.pulsemsg.ru
```

Certbot rewrites the nginx config to serve HTTPS and sets up auto-renewal. Verify renewal with:

```bash
sudo certbot renew --dry-run
```

Your messenger is now live at **https://pulsemsg.ru**.

---

## 9. Updating to a new version

```bash
cd /var/www/pulse
git pull
pnpm install
pnpm db:setup        # apply any new migrations
pnpm build
pm2 restart pulse
```

---

## 10. Native clients (optional)

The Android (Capacitor) and desktop (Tauri) apps just load the web deployment.

- **Android:** `capacitor.config.ts` and `.env.native.example` default to `https://pulsemsg.ru`
  via `PULSE_APP_URL`. For local dev against the emulator:
  `PULSE_APP_URL=http://10.0.2.2:3000 pnpm android:sync`.
- **Desktop (Tauri):** dev uses `http://localhost:3000`; release builds load your production URL.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Login spinner never resolves ("infinite loading") | `NEON_AUTH_COOKIE_SECRET` is missing or < 32 chars. Regenerate with `openssl rand -base64 32`, restart. |
| App crashes on boot with *"Neon Auth environment variables are not configured"* | `NEON_AUTH_BASE_URL` and/or `NEON_AUTH_COOKIE_SECRET` are not set. |
| Uploads fail / images 404 | `UPLOAD_DIR` doesn't exist or isn't writable by the Node process. Re-check step 4. |
| Calls return HTTP 503 | LiveKit isn't configured. Set `LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` (optional feature). |
| `pnpm db:setup` can't connect | Check `DATABASE_URL` and that the DB allows connections from the VPS IP. |
