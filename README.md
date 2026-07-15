<div align="center">
  <img src="src-tauri/icons/128x128.png" width="96" height="96" alt="Pulse Messenger logo" />

  # Pulse Messenger

  **Быстрый и уютный мессенджер для Web, Android, Windows и Linux.**

  [![Release](https://img.shields.io/github/v/release/konikc/pulse-messenger?include_prereleases&style=flat-square&color=22c55e)](https://github.com/konikc/pulse-messenger/releases/latest)
  [![Next.js](https://img.shields.io/badge/Next.js-16-111827?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
  [![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app/)
  [![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?style=flat-square&logo=capacitor&logoColor=white)](https://capacitorjs.com/)

  [Открыть Pulse](https://pulse-messenger-chi.vercel.app) · [Скачать приложение](https://github.com/konikc/pulse-messenger/releases/latest) · [Сообщить о проблеме](https://github.com/konikc/pulse-messenger/issues)
</div>

---

## О проекте

Pulse объединяет современный веб-интерфейс и нативные оболочки в одном проекте. Переписывайтесь, делитесь файлами, управляйте профилем и оставайтесь на связи с любого поддерживаемого устройства.

### Возможности

- Личные диалоги и синхронизация сообщений
- Отправка файлов и изображений
- Аудио- и видеосвязь на базе LiveKit
- Аккаунты, профиль пользователя и защищённые сессии
- Адаптивный интерфейс для телефона и компьютера
- Единая актуальная веб-версия внутри нативных приложений

## Скачать

Перейдите в [последний GitHub Release](https://github.com/konikc/pulse-messenger/releases/latest) и выберите файл для своей платформы.

| Платформа | Файл | Установка |
| --- | --- | --- |
| Android | `Pulse-Messenger-v0.1.0-Android.apk` | Разрешите установку из выбранного источника и откройте APK |
| Windows | `Pulse-Messenger-v0.1.0-Windows.exe` | Запустите установщик NSIS |
| Linux | `Pulse-Messenger-v0.1.0-Linux.AppImage` | Сделайте файл исполняемым и запустите |
| Debian / Ubuntu | `Pulse-Messenger-v0.1.0-Linux.deb` | Установите пакет через системный менеджер приложений |

> Версия `v0.1.0` публикуется как предварительный релиз. Windows и Linux могут показать предупреждение для приложения без коммерческого code-signing сертификата.

## Технологии

| Область | Стек |
| --- | --- |
| Web | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| UI | shadcn/ui, Base UI, Lucide |
| Данные и авторизация | Neon, Drizzle ORM, Neon Auth |
| Звонки | LiveKit |
| Android | Capacitor 8, Gradle |
| Desktop | Tauri 2, Rust |
| Доставка | Vercel, GitHub Actions, GitHub Releases |

## Локальная разработка

Требуются Node.js 22+ и pnpm 10+.

```bash
git clone https://github.com/konikc/pulse-messenger.git
cd pulse-messenger
pnpm install
pnpm dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000).

### Android

```bash
PULSE_APP_URL=https://pulse-messenger-chi.vercel.app pnpm android:sync
pnpm android:open
```

Для локальной release-сборки задайте `PULSE_ANDROID_KEYSTORE_FILE`, `PULSE_ANDROID_KEYSTORE_PASSWORD`, `PULSE_ANDROID_KEY_ALIAS` и `PULSE_ANDROID_KEY_PASSWORD`, затем запустите `android/gradlew assembleRelease`.

### Windows и Linux

Для desktop-разработки установите системные зависимости [Tauri 2](https://tauri.app/start/prerequisites/), Rust и запустите:

```bash
pnpm desktop:dev
```

Production-пакеты:

```bash
pnpm desktop:build
```

## Автоматические релизы

Workflow `.github/workflows/release.yml` запускается для тегов `v*` и собирает:

- подписанный universal APK для Android;
- NSIS `.exe` для Windows;
- `.AppImage` и `.deb` для Linux.

Для Android-подписи в GitHub Actions должны быть настроены secrets:

- `PULSE_ANDROID_KEYSTORE_BASE64`
- `PULSE_ANDROID_KEYSTORE_PASSWORD`
- `PULSE_ANDROID_KEY_ALIAS`
- `PULSE_ANDROID_KEY_PASSWORD`

Keystore и его пароли нельзя добавлять в Git. Храните отдельную резервную копию: без исходного ключа невозможно подписывать совместимые обновления Android-приложения.

## Конфигурация native URL

Нативные приложения по умолчанию открывают:

```text
https://pulse-messenger-chi.vercel.app
```

Для Android адрес можно переопределить переменной `PULSE_APP_URL` перед `pnpm android:sync`. Desktop URL задаётся в `src-tauri/tauri.conf.json`.

## Участие в разработке

1. Создайте отдельную ветку.
2. Внесите небольшое, сфокусированное изменение.
3. Выполните `pnpm lint` и `pnpm build`.
4. Откройте Pull Request с описанием результата.

Перед использованием и распространением проверьте условия лицензирования репозитория; отдельный файл лицензии пока не добавлен.

<div align="center">
  <sub>Сделано для общения без лишнего шума.</sub>
</div>
