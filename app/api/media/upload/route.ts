import { NextResponse } from 'next/server'
import { requireUserId } from '@/lib/auth/require-user'
import { putFile } from '@/lib/storage/local'

const allowedTypes = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'audio/webm', 'audio/ogg', 'audio/mp4', 'application/pdf',
])

export async function POST(request: Request) {
  try {
    const userId = await requireUserId()
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 })
    if (!allowedTypes.has(file.type)) return NextResponse.json({ error: 'Этот формат файла не поддерживается' }, { status: 415 })
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: 'Максимальный размер файла — 20 МБ' }, { status: 413 })

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const pathname = `pulse/${userId}/${crypto.randomUUID()}-${safeName}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await putFile(pathname, buffer, file.type)

    return NextResponse.json({ pathname, name: file.name, type: file.type, size: file.size })
  } catch {
    return NextResponse.json({ error: 'Не удалось загрузить файл' }, { status: 500 })
  }
}
