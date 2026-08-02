import { createHash } from 'node:crypto'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Self-hosted media storage on the local filesystem (no Vercel Blob).
// Configure a persistent directory on your VPS via UPLOAD_DIR.
// Defaults to <project>/data/uploads for local/dev use.
function resolveUploadDir() {
  // Resolved lazily (per request) so the build tracer never walks the whole
  // project from a module-eval process.cwd() call.
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR
  return path.join(process.cwd(), 'data', 'uploads')
}

function resolveSafePath(pathname: string) {
  const uploadDir = resolveUploadDir()
  // Prevent path traversal — only allow the "pulse/..." namespace.
  const normalized = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '')
  if (!normalized.startsWith('pulse/') && !normalized.startsWith('pulse\\')) {
    throw new Error('Invalid storage path')
  }
  const full = path.join(uploadDir, normalized)
  if (!full.startsWith(path.resolve(uploadDir))) throw new Error('Invalid storage path')
  return full
}

export async function putFile(pathname: string, data: Buffer, contentType: string) {
  const full = resolveSafePath(pathname)
  await mkdir(path.dirname(full), { recursive: true })
  await writeFile(full, data)
  // Store content type alongside the file so reads can serve it back.
  await writeFile(`${full}.meta`, JSON.stringify({ contentType }), 'utf8')
  return { pathname }
}

export async function getFile(pathname: string) {
  const full = resolveSafePath(pathname)
  try {
    const [data, info] = await Promise.all([readFile(full), stat(full)])
    let contentType = 'application/octet-stream'
    try {
      const meta = JSON.parse(await readFile(`${full}.meta`, 'utf8')) as { contentType?: string }
      if (meta.contentType) contentType = meta.contentType
    } catch {
      // meta file is optional
    }
    const etag = `"${createHash('sha1').update(data).digest('hex')}-${info.size}"`
    return { data, contentType, etag }
  } catch {
    return null
  }
}
