# Промпт для следующего ИИ (передача работы)

Скопируй весь текст ниже и отдай другому ИИ, если нужно продолжить.

---

Ты продолжаешь работу над проектом **Pulse Messenger** (Next.js 16 + Neon Auth + Drizzle + Capacitor (Android) + Tauri (Windows/Linux)). Предыдущий ИИ уже сделал часть работы. НЕ переделывай всё с нуля — доделай только оставшееся.

## Что УЖЕ исправлено (не трогай):
1. **Ошибка после шага никнейма/имени.** Причина была в `lib/db/schema.ts`: колонки `user_id`, `sender_id`, `created_by` были типа `uuid`, но Neon Auth (Better Auth) выдаёт строковые ID, а не UUID — вставка профиля падала. Все эти колонки переведены на `text`.
2. **Таблиц не было в БД.** Создан файл `lib/db/schema.sql` со всеми таблицами (profiles, conversations, conversation_members, messages, message_reactions). Его нужно один раз выполнить: `psql "$DATABASE_URL" -f lib/db/schema.sql`.
3. **Ошибка с APK (не устанавливался).** В `android/app/build.gradle` добавлен `signingConfigs.release` и подпись релизного APK через переменные окружения `PULSE_KEYSTORE_*`. versionName синхронизирован с package.json (0.1.5).
4. **Кривые надписи** в `components/auth/onboarding-form.tsx` (шапка «Последний шаг / Создайте профиль Pulse») выровнены через flex-col + leading.

## Что осталось сделать:
1. **Google-вход.** Код клиента верный (`authClient.signIn.social({ provider: 'google' })` в `components/auth/auth-form.tsx`). Но провайдер Google нужно настроить на стороне Neon Auth (в консоли Neon: Auth → Providers → Google, добавить Client ID/Secret и redirect URL `<APP_URL>/api/auth/callback/google`). Проверь, что переменные окружения заданы. Без настройки провайдера кнопка будет выдавать ошибку — это ожидаемо.
2. **Переменные окружения.** Приложение падает на старте, если не заданы: `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` (мин. 32 символа, `openssl rand -base64 32`). Для нативных сборок ещё `PULSE_APP_URL`. См. `.env.native.example` и `README.md` → раздел «Развёртывание на Beget».
3. **Проверь весь флоу регистрации до чатов** в браузере: sign-up email → onboarding (emoji + имя + username) → редирект на `/` → должен открыться `PulseApp`. Если БД не создана, будет ошибка — сначала выполни schema.sql.
4. **Сборка нативных файлов.** Linux/Windows собираются через Tauri (`pnpm desktop:build`), Android APK через Capacitor + Gradle (`pnpm android:sync && cd android && ./gradlew assembleRelease`). В окружении v0 нет Android SDK/Rust toolchain, поэтому реальные бинарники собираются в GitHub Actions (`.github/workflows/release.yml`) — запусти workflow по тегу `v0.1.5`, артефакты (APK, .exe, .AppImage, .deb) появятся в GitHub Release.

## Важно:
- Экономь токены, делай точечные правки.
- НЕ переписывай рабочие файлы целиком.
- Neon Auth ID = строка, а не UUID — везде используй `text`.
