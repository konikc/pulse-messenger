import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { conversationMembers, messageReactions, messages } from '@/lib/db/schema'
import { requireUserId } from '@/lib/auth/require-user'

const schema = z.object({ reaction: z.string().trim().min(1).max(16) })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId()
    const { id } = await params
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Некорректная реакция' }, { status: 400 })
    const message = await db.query.messages.findFirst({ where: eq(messages.id, id) })
    if (!message) return NextResponse.json({ error: 'Сообщение не найдено' }, { status: 404 })
    const member = await db.query.conversationMembers.findFirst({ where: and(eq(conversationMembers.conversationId, message.conversationId), eq(conversationMembers.userId, userId)) })
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await db.insert(messageReactions).values({ messageId: id, userId, reaction: parsed.data.reaction }).onConflictDoNothing()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Не удалось добавить реакцию' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId()
    const { id } = await params
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Некорректная реакция' }, { status: 400 })
    await db.delete(messageReactions).where(and(eq(messageReactions.messageId, id), eq(messageReactions.userId, userId), eq(messageReactions.reaction, parsed.data.reaction)))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Не удалось удалить реакцию' }, { status: 500 })
  }
}
