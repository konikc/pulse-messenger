<div align="center">
  <img src="public/icon.svg" width="104" alt="Логотип Pulse" />
  <h1>Pulse</h1>
  <p><strong>Мягкий, быстрый и приватный мессенджер для важных разговоров.</strong></p>

  [![Beta](https://img.shields.io/badge/release-v0.1.0_beta-168365?style=flat-square)](https://github.com/konikc/pulse-messenger/releases/latest)
  [![Next.js](https://img.shields.io/badge/Next.js-16-17231f?style=flat-square)](https://nextjs.org)
  [![Platforms](https://img.shields.io/badge/platforms-Web%20%7C%20Android%20%7C%20Windows%20%7C%20Linux-eaf5f0?style=flat-square)](#установка)
</div>

> Pulse `v0.1.0` — открытая beta. Нативные пакеты пока не подписаны сертификатами, поэтому Android, Windows или Linux могут показать предупреждение при установке.

## О Pulse

Pulse объединяет личные чаты, медиа, реакции и защищённые аудио- и видеокомнаты в спокойном интерфейсе без визуального шума. Web-приложение работает на Next.js и Neon, а приложения Android, Windows и Linux подключаются к тому же защищённому HTTPS-сервису, поэтому история доступна на всех устройствах.

## Возможности v0.1.0 beta

| Возможность | Статус | Примечание |
|---|:---:|---|
| Уникальные username | Готово | Проверка формата и уникальности на сервере |
| Личные сообщения | Готово | Синхронизация, состояния загрузки и ошибок |
| Emoji и реакции | Готово | Быстрые реакции с общим счётчиком |
| Фото, аудио и файлы | Готово | Приватная выдача медиа только участникам чата |
| Аудио- и видеозвонки | Beta | Комнаты LiveKit; нужны серверные credentials |
| Аватар-emoji или фото | Beta | Emoji готов, загрузка фотографии развивается |
| Автопроверка обновлений | Готово | Проверка GitHub Releases и пакет для текущей ОС |
| Android / Windows / Linux | Beta | Unsigned установщики из GitHub Releases |

### Roadmap

Следующие функции не выдаются за готовые и будут добавляться поэтапно:

- группы, каналы, роли владельца и администраторов;
- настоящие end-to-end encrypted секретные чаты и исчезающие сообщения;
- запись голосового сообщения прямо из приложения и фирменные звуки событий;
- Google OAuth и регистрация по номеру телефона через SMS-провайдера;
- подписанные установщики и фоновая установка обновлений.

## Установка

Откройте [последний GitHub Release](https://github.com/konikc/pulse-messenger/releases/latest) и выберите пакет:

| Платформа | Файл | Установка |
|---|---|---|
| Android | `Pulse-*-android-unsigned.apk` | Разрешите установку из выбранного браузера, затем откройте APK |
| Windows | `.exe` | Запустите NSIS-установщик и подтвердите предупреждение SmartScreen для beta |
| Linux | `.AppImage` | Разрешите запуск файла и откройте его |
| Debian / Ubuntu | `.deb` | Установите пакет стандартным менеджером пакетов |

Проверить целостность загрузки можно по `SHA256SUMS.txt` из того же релиза.

## Технологии

- Next.js 16, React 19 и TypeScript;
- Tailwind CSS 4 и shadcn/ui;
- Neon Postgres, Drizzle ORM и Neon Auth;
- LiveKit для аудио- и видеокомнат;
- Vercel Blob для медиа;
- Capacitor 8 для Android;
- Tauri 2 для Windows и Linux;
- GitHub Actions и GitHub Releases для дистрибуции.

## Локальный запуск

Требуются Node.js 24 и pnpm 10.

```bash
pnpm install
pnpm dev
```

Создайте `.env.development.local` и задайте только необходимые переменные:

```dotenv
DATABASE_URL=
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=
BLOB_READ_WRITE_TOKEN=
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXT_PUBLIC_APP_VERSION=0.1.0
```

Не коммитьте секреты. Для production они задаются через Vercel Integrations и Vars.

## Нативные сборки

Нативные приложения являются web-shell клиентами и загружают production-версию Pulse по HTTPS.

```bash
PULSE_APP_URL=https://your-pulse.example pnpm android:sync
cd android && ./gradlew assembleRelease

PULSE_APP_URL=https://your-pulse.example pnpm desktop:build
```

Для автоматической публикации добавьте repository variable `PULSE_APP_URL`. Push тега `v*` запускает `.github/workflows/release.yml`, собирает APK, EXE, AppImage и DEB, создаёт checksums и публикует prerelease.

## Безопасность

- каждый API-запрос требует действующую сессию;
- доступ к сообщениям и медиа проверяется через членство в разговоре;
- username проверяется сервером и защищён уникальным индексом базы;
- нативные production-клиенты запрещают cleartext HTTP;
- камера и микрофон запрашиваются только после явного действия пользователя;
- секреты Neon, Blob и LiveKit не попадают в клиентские бинарники.

Важно: надпись «защищённый разговор» в beta означает защищённую передачу и контроль доступа. Полноценное E2EE для секретных чатов находится в roadmap.

## Структура

```text
app/                 Next.js страницы и API
components/          интерфейс Pulse, звонки и обновления
lib/                 auth, Neon/Drizzle и общие утилиты
android/             проект Capacitor Android
src-tauri/           приложение Windows/Linux
.github/workflows/   автоматическая сборка релизов
```

## Участие в разработке

Создайте отдельную ветку, внесите небольшое сфокусированное изменение и откройте Pull Request. Перед отправкой выполните:

```bash
pnpm lint
pnpm build
```

## Лицензия

Лицензия пока не выбрана. До появления файла `LICENSE` исходный код защищён авторским правом владельца репозитория.
