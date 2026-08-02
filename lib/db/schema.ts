import { boolean, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  userId: uuid('user_id').primaryKey(),
  username: text('username').notNull(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  avatarEmoji: text('avatar_emoji'),
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  kind: text('kind').notNull(),
  title: text('title'),
  avatarUrl: text('avatar_url'),
  createdBy: uuid('created_by').notNull(),
  e2eeEnabled: boolean('e2ee_enabled').notNull().default(false),
  disappearingSeconds: integer('disappearing_seconds'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const conversationMembers = pgTable('conversation_members', {
  conversationId: uuid('conversation_id').notNull(),
  userId: uuid('user_id').notNull(),
  role: text('role').notNull().default('member'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  mutedUntil: timestamp('muted_until', { withTimezone: true }),
}, (table) => [primaryKey({ columns: [table.conversationId, table.userId] })])

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull(),
  senderId: uuid('sender_id').notNull(),
  kind: text('kind').notNull().default('text'),
  body: text('body'),
  encryptedPayload: jsonb('encrypted_payload'),
  replyToId: uuid('reply_to_id'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  editedAt: timestamp('edited_at', { withTimezone: true }),
})

export const messageReactions = pgTable('message_reactions', {
  messageId: uuid('message_id').notNull(),
  userId: uuid('user_id').notNull(),
  reaction: text('reaction').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.messageId, table.userId, table.reaction] })])
