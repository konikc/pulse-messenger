import { NextResponse } from 'next/server'
import { and, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { conversationMembers, conversations, messages, profiles } from '@/lib/db/schema'
import { requireUserId } from '@/lib/auth/require-user'

const createSchema = z.object({ username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,24}$/) })

export async function GET() {
  try {
    const userId = await requireUserId()
    const rows = await db.select({
      id: conversations.id,
      kind: conversations.kind,
      title: conversations.title,
      updatedAt: conversations.updatedAt,
      latestMessage: sql<string | null>`(select body from messages where conversation_id = ${conversations.id} order by created_at desc limit 1)`,
      latestAt: sql<Date | null>`(select created_at from messages where conversation_id = ${conversations.id} order by created_at desc limit 1)`,
    }).from(conversationMembers).innerJoin(conversations, eq(conversationMembers.conversationId, conversations.id)).where(eq(conversationMembers.userId, userId)).orderBy(desc(conversations.updatedAt))
    return NextResponse.json({ conversations: rows })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId()
    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Некорректный username' }, { status: 400 })
    const recipient = await db.query.profiles.findFirst({ where: eq(profiles.username, parsed.data.username) })
    if (!recipient || recipient.userId === userId) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })

    const existing = await db.select({ id: conversations.id }).from(conversations)
      .innerJoin(conversationMembers, eq(conversations.id, conversationMembers.conversationId))
      .where(and(eq(conversations.kind, 'direct'), eq(conversationMembers.userId, userId), sql`exists (select 1 from conversation_members cm where cm.conversation_id = ${conversations.id} and cm.user_id = ${recipient.userId})`)).limit(1)
    if (existing[0]) return NextResponse.json({ id: existing[0].id })

    const id = await db.transaction(async (tx) => {
      const [conversation] = await tx.insert(conversations).values({ kind: 'direct', createdBy: userId, title: recipient.displayName }).returning({ id: conversations.id })
      await tx.insert(conversationMembers).values([
        { conversationId: conversation.id, userId, role: 'owner' },
        { conversationId: conversation.id, userId: recipient.userId, role: 'member' },
      ])
      return conversation.id
    })
    return NextResponse.json({ id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Не удалось создать чат' }, { status: 500 })
  }
}
