<div align="center">
  <img src="public/pulse-release-icon.png" width="128" height="128" alt="Pulse logo" />

# Pulse Messenger

**Мягкий, быстрый и современный мессенджер для Android, Windows, Linux и Web.**  
**A soft, fast, modern messenger for Android, Windows, Linux, and the Web.**

[![Native release](https://github.com/konikc/pulse-messenger/actions/workflows/release.yml/badge.svg)](https://github.com/konikc/pulse-messenger/actions/workflows/release.yml)
[![Latest release](https://img.shields.io/github/v/release/konikc/pulse-messenger?include_prereleases&label=release)](https://github.com/konikc/pulse-messenger/releases)

[Скачать / Download](https://github.com/konikc/pulse-messenger/releases) · [Web-версия](https://pulse-messenger-10imd7c7p-shelperapp-7107s-projects.vercel.app) · [Сообщить об ошибке](https://github.com/konikc/pulse-messenger/issues)
</div>

---

## Русский

### О проекте

Pulse — кроссплатформенный мессенджер с аккуратным адаптивным интерфейсом. Одна серверная версия обслуживает Web, Android и desktop-приложения, поэтому сообщения, профиль и медиа синхронизируются между устройствами.

### Возможности

- личные чаты с уникальными `@username`;
- текстовые сообщения, реакции и ответы;
- изображения, документы и голосовые файлы в приватном Vercel Blob;
- аудио- и видеозвонки через LiveKit;
- аватары из изображения или эмодзи;
- группы, каналы и роли участников в архитектуре данных;
- проверка новых версий через GitHub Releases;
- адаптивный интерфейс для телефона и компьютера;
- серверные сессии Neon Auth и база Neon Postgres.

### Скачать

Откройте [GitHub Releases](https://github.com/konikc/pulse-messenger/releases) и выберите файл:

| Платформа | Файл | Установка |
|---|---|---|
| Android | `Pulse-Android-v0.1.0.apk` | Разрешите установку из выбранного браузера или файлового менеджера |
| Windows | `Pulse_*_x64-setup.exe` | Запустите установщик и следуйте инструкциям |
| Linux | `Pulse_*.AppImage` | Сделайте файл исполняемым и запустите |
| Ubuntu / Debian | `Pulse_*.deb` | Установите пакет системным менеджером |

Релиз `v0.1.0` является предварительным. Перед установкой можно сверить SHA-256 файла с `SHA256SUMS.txt`.

### Разработка

Требования: Node.js 22+, pnpm 10+, подключённые Neon и Vercel Blob.

```bash
pnpm install
pnpm dev
```

Проверка и native-сборки:

```bash
pnpm exec tsc --noEmit
pnpm build
pnpm android:sync
pnpm desktop:build
```

Секреты базы, авторизации, Blob, LiveKit и подписи Android никогда не должны попадать в репозиторий. Они задаются через Vercel Environment Variables и GitHub Actions Secrets.

---

## English

### About

Pulse is a cross-platform messenger with a calm, responsive interface. A shared server deployment powers the Web, Android, and desktop clients, keeping conversations, profiles, and media synchronized across devices.

### Features

- direct conversations with unique `@usernames`;
- text messages, reactions, and replies;
- images, documents, and voice files in private Vercel Blob storage;
- LiveKit audio and video calls;
- image or emoji avatars;
- data architecture for groups, channels, and member roles;
- GitHub Releases update checks;
- responsive phone and desktop layouts;
- Neon Auth server sessions and Neon Postgres persistence.

### Download

Visit [GitHub Releases](https://github.com/konikc/pulse-messenger/releases) and choose the matching asset:

| Platform | Asset | Installation |
|---|---|---|
| Android | `Pulse-Android-v0.1.0.apk` | Allow installation from the browser or file manager you used |
| Windows | `Pulse_*_x64-setup.exe` | Run the installer and follow its steps |
| Linux | `Pulse_*.AppImage` | Mark the file executable, then launch it |
| Ubuntu / Debian | `Pulse_*.deb` | Install it with your system package manager |

`v0.1.0` is a pre-release. Verify downloads against `SHA256SUMS.txt` before installation.

### Architecture

- **Next.js 16 + React 19** — web application and API routes
- **Neon Postgres + Drizzle** — persistent messenger data
- **Neon Auth** — authentication and server sessions
- **Vercel Blob** — private user media
- **LiveKit** — WebRTC audio and video rooms
- **Capacitor** — Android package
- **Tauri 2** — lightweight Windows and Linux packages
- **GitHub Actions** — repeatable signed release builds

### Security

Pulse scopes conversations and media access to authenticated members. Private Blob URLs are never sent directly to clients, and credentials remain in environment variables or encrypted GitHub Actions secrets.

## Release process

Pushing a tag such as `v0.1.0` runs `.github/workflows/release.yml`. It builds a signed Android APK, Windows NSIS installer, Linux AppImage and deb packages, generates checksums, and publishes a GitHub pre-release.

## License

Copyright © 2026 Pulse Messenger. No open-source license has been selected; all rights are reserved.
