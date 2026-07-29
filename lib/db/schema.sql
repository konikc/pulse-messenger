-- Pulse Messenger — схема базы данных (PostgreSQL / Neon).
-- Запустите один раз перед первым стартом: psql "$DATABASE_URL" -f lib/db/schema.sql
-- user_id хранится как TEXT, потому что Neon Auth (Better Auth) выдаёт строковые идентификаторы,
-- а не UUID. Это и была причина ошибки сразу после шага с никнеймом.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS profiles (
  user_id       TEXT PRIMARY KEY,
  username      TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  avatar_emoji  TEXT,
  bio           TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT profiles_username_unique UNIQUE (username)
);

CREATE TABLE IF NOT EXISTS conversations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind                  TEXT NOT NULL,
  title                 TEXT,
  avatar_url            TEXT,
  created_by            TEXT NOT NULL,
  e2ee_enabled          BOOLEAN NOT NULL DEFAULT false,
  disappearing_seconds  INTEGER,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id          TEXT NOT NULL,
  role             TEXT NOT NULL DEFAULT 'member',
  joined_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  muted_until      TIMESTAMPTZ,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id    UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id          TEXT NOT NULL,
  kind               TEXT NOT NULL DEFAULT 'text',
  body               TEXT,
  encrypted_payload  JSONB,
  reply_to_id        UUID,
  expires_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS messages_conversation_created_idx
  ON messages (conversation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS message_reactions (
  message_id  UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL,
  reaction    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id, reaction)
);
