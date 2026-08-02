import { AccessToken } from 'livekit-server-sdk'
import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireUserId } from '@/lib/auth/require-user'
import { db } from '@/lib/db'
import { conversationMembers, profiles } from '@/lib/db/schema'

const schema = z.object({ conversationId: z.string().uuid() })

export async function POST(request: Request) {
  try {
    const userId = await requireUserId()
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Некорректный звонок' }, { status: 400 })
    const member = await db.query.conversationMembers.findFirst({ where: and(eq(conversationMembers.conversationId, parsed.data.conversationId), eq(conversationMembers.userId, userId)) })
    if (!member) return NextResponse.json({ error: 'Нет доступа к звонку' }, { status: 403 })

    const url = process.env.LIVEKIT_URL
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    if (!url || !apiKey || !apiSecret) return NextResponse.json({ configured: false, error: 'LiveKit ещё не настроен' }, { status: 503 })

    const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) })
    const token = new AccessToken(apiKey, apiSecret, { identity: userId, name: profile?.displayName ?? 'Pulse user' })
    token.addGrant({ roomJoin: true, room: `pulse-${parsed.data.conversationId}`, canPublish: true, canSubscribe: true })
    return NextResponse.json({ configured: true, url, token: await token.toJwt() })
  } catch {
    return NextResponse.json({ error: 'Не удалось начать звонок' }, { status: 500 })
  }
}
