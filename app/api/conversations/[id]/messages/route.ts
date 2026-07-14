import { NextResponse } from 'next/server'
import { and, asc, eq, gt } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { conversationMembers, conversations, messages } from '@/lib/db/schema'
import { requireUserId } from '@/lib/auth/require-user'

const messageSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('text'), body: z.string().trim().min(1).max(4000) }),
  z.object({
    kind: z.enum(['image', 'file', 'audio']),
    body: z.string().startsWith('pulse/'),
    metadata: z.object({ name: z.string().max(255), type: z.string().max(100), size: z.number().nonnegative().max(20 * 1024 * 1024) }),
  }),
])

async function isMember(conversationId: string, userId: string) {
  return Boolean(await db.query.conversationMembers.findFirst({ where: and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, userId)) }))
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId()
    const { id } = await params
    if (!(await isMember(id, userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const after = new URL(request.url).searchParams.get('after')
    const where = after ? and(eq(messages.conversationId, id), gt(messages.createdAt, new Date(after))) : eq(messages.conversationId, id)
    const rows = await db.select().from(messages).where(where).orderBy(asc(messages.createdAt)).limit(100)
    return NextResponse.json({ messages: rows, currentUserId: userId })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId()
    const { id } = await params
    if (!(await isMember(id, userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const parsed = messageSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Сообщение пустое или слишком длинное' }, { status: 400 })
    const [message] = await db.insert(messages).values({
      conversationId: id,
      senderId: userId,
      body: parsed.data.body,
      kind: parsed.data.kind,
      encryptedPayload: parsed.data.kind === 'text' ? null : parsed.data.metadata,
    }).returning()
    await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, id))
    return NextResponse.json({ message }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Не удалось отправить сообщение' }, { status: 500 })
  }
}
