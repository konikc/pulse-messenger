-- Pulse Messenger — initial schema.
-- Mirrors lib/db/schema.ts. Safe to run repeatedly (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS "profiles" (
  "user_id" uuid PRIMARY KEY,
  "username" text NOT NULL,
  "display_name" text NOT NULL,
  "avatar_url" text,
  "avatar_emoji" text,
  "bio" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "conversations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "kind" text NOT NULL,
  "title" text,
  "avatar_url" text,
  "created_by" uuid NOT NULL,
  "e2ee_enabled" boolean NOT NULL DEFAULT false,
  "disappearing_seconds" integer,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "conversation_members" (
  "conversation_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role" text NOT NULL DEFAULT 'member',
  "joined_at" timestamptz NOT NULL DEFAULT now(),
  "muted_until" timestamptz,
  CONSTRAINT "conversation_members_pk" PRIMARY KEY ("conversation_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversation_id" uuid NOT NULL,
  "sender_id" uuid NOT NULL,
  "kind" text NOT NULL DEFAULT 'text',
  "body" text,
  "encrypted_payload" jsonb,
  "reply_to_id" uuid,
  "expires_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "edited_at" timestamptz
);

CREATE TABLE IF NOT EXISTS "message_reactions" (
  "message_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "reaction" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "message_reactions_pk" PRIMARY KEY ("message_id", "user_id", "reaction")
);

-- Helpful indexes for common lookups.
CREATE INDEX IF NOT EXISTS "messages_conversation_created_idx"
  ON "messages" ("conversation_id", "created_at");
CREATE INDEX IF NOT EXISTS "conversation_members_user_idx"
  ON "conversation_members" ("user_id");
