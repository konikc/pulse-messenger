# Pulse Messenger

Мягкий кроссплатформенный мессенджер для личного общения, групп и каналов. Pulse работает как веб-приложение, Android-приложение и desktop-клиент для Windows и Linux.

[![Release Pulse](https://github.com/konikc/pulse-messenger/actions/workflows/release.yml/badge.svg)](https://github.com/konikc/pulse-messenger/actions/workflows/release.yml)
[![GitHub release](https://img.shields.io/github/v/release/konikc/pulse-messenger?include_prereleases)](https://github.com/konikc/pulse-messenger/releases)

## Скачать

Готовые сборки публикуются в [GitHub Releases](https://github.com/konikc/pulse-messenger/releases):

- **Android:** `Pulse-Android-v0.1.0.apk`
- **Windows:** установщик `.exe`
- **Linux:** переносимый `.AppImage` и пакет `.deb`

Релиз `v0.1.0` является beta-версией. Перед установкой Android может попросить разрешить установку приложений из браузера или файлового менеджера.

## Возможности

- личные переписки, группы и каналы;
- роли владельца, администратора и участника;
- сообщения, ответы, emoji и реакции;
- голосовые сообщения и вложения;
- профили с уникальным username;
- аватар из фотографии или emoji;
- email/password и Google-вход через Neon Auth;
- аудио- и видеозвонки на LiveKit;
- секретные чаты и исчезающие сообщения в beta-режиме;
- мягкие звуки отправки, получения и звонка;
- автоматическая проверка новой версии через GitHub Releases;
- адаптивный интерфейс для телефона и компьютера.

## Статус функций

| Функция | v0.1.0 |
| --- | --- |
| Email-регистрация и вход | Готово |
| Google OAuth | Код готов, нужны OAuth credentials |
| Уникальные username | Готово, уникальность контролирует база |
| Сообщения и реакции | Готово |
| Группы, каналы и роли | Beta |
| Фото/emoji-аватары | Готово |
| Голосовые сообщения | Beta |
| Аудио/видеозвонки | Beta, требуется LiveKit |
| Секретные чаты | Beta; не заявляются как audited E2EE |
| Регистрация по телефону/SMS | Roadmap |
| Автообновление | Проверка и переход к GitHub Release |

## Технологии

- Next.js 16, React 19 и TypeScript;
- Tailwind CSS 4 и shadcn/ui;
- Neon Postgres, Drizzle ORM и Neon Auth;
- LiveKit для звонков;
- Capacitor для Android;
- Tauri 2 для Windows и Linux;
- GitHub Actions для кроссплатформенных релизов.

## Локальный запуск

Требования: Node.js 24 и pnpm 10.

```bash
pnpm install
pnpm dev
```

Приложению нужны переменные окружения:

```env
DATABASE_URL=
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=
NEXT_PUBLIC_APP_VERSION=0.1.0
GITHUB_OWNER=konikc
GITHUB_REPO=pulse-messenger
```

Для звонков также задайте параметры LiveKit, используемые серверными маршрутами проекта.

## Настройка Google OAuth

1. Создайте OAuth 2.0 Web Client в Google Cloud Console.
2. В настройках Neon Auth включите Google и добавьте Client ID и Client Secret.
3. Скопируйте callback URL, показанный Neon Auth, в **Authorized redirect URIs** Google.
4. Добавьте production-домен `https://pulse-messenger.vercel.app` в разрешённые JavaScript origins и trusted origins Neon Auth.
5. Проверьте вход, затем создание уникального username на экране onboarding.

Секреты Google нельзя коммитить в репозиторий. Они настраиваются в Neon Auth и переменных окружения Vercel.

## Нативные сборки

### Android

```bash
PULSE_APP_URL=https://pulse-messenger.vercel.app pnpm android:sync
cd android && ./gradlew assembleDebug
```

APK появится в `android/app/build/outputs/apk/debug/`.

### Windows и Linux

```bash
pnpm desktop:build
```

Desktop-оболочка открывает production-версию Pulse. GitHub Actions отдельно собирает Windows NSIS `.exe`, Linux `.AppImage` и `.deb` на подходящих runner-ах.

## Релизы и обновления

Workflow `.github/workflows/release.yml` запускается для тегов `v*`, собирает все платформы и создаёт prerelease с файлами установки. Для нового релиза обновите версии в `package.json`, `src-tauri/tauri.conf.json` и `android/app/build.gradle`, затем создайте тег:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Pulse запрашивает `/api/updates`, сравнивает `NEXT_PUBLIC_APP_VERSION` с последним GitHub Release и предлагает открыть страницу загрузки при наличии новой версии. Полностью бесшовная установка обновлений и подпись production-пакетов запланированы после настройки сертификатов Windows, Linux и Android keystore.

## Безопасность

- пользовательские запросы ограничиваются текущим `userId`;
- username защищён уникальным индексом базы данных;
- секреты не хранятся в репозитории;
- доступ к камере и микрофону запрашивается только для звонков;
- секретные чаты в v0.1.0 имеют статус beta и не проходили независимый криптографический аудит.

## Roadmap

- регистрация и восстановление по номеру телефона через SMS-провайдера;
- production signaling/TURN и дополнительная диагностика звонков;
- push-уведомления;
- подписанные Android/Windows-пакеты;
- настоящий in-app updater без перехода в браузер;
- независимый аудит end-to-end encryption.

## Лицензия

Исходный код распространяется без отдельной лицензии. До добавления `LICENSE` все права сохраняются за владельцем репозитория.
