import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

type Db = ReturnType<typeof drizzle<typeof schema>>

// Neon (and most managed Postgres) require TLS. We configure `ssl` explicitly
// instead of relying on the connection string's `sslmode=require`, which newer
// `pg`/`pg-connection-string` versions emit a deprecation warning for. Stripping
// the SSL-related query params keeps the connection string clean and silences
// that warning while still connecting over TLS.
function buildConnectionString(raw: string | undefined) {
  if (!raw) throw new Error('DATABASE_URL is not set. See DEPLOY.md.')
  try {
    const url = new URL(raw)
    url.searchParams.delete('sslmode')
    url.searchParams.delete('channel_binding')
    return url.toString()
  } catch {
    // Not a parseable URL (e.g. a socket path) — use it as-is.
    return raw
  }
}

// The pool and drizzle instance are created lazily on first use so that
// `next build` can import route modules for page-data collection without a
// live DATABASE_URL. The connection is only established when a request runs.
let cachedPool: Pool | null = null
let cachedDb: Db | null = null

export function getPool(): Pool {
  if (!cachedPool) {
    cachedPool = new Pool({
      connectionString: buildConnectionString(process.env.DATABASE_URL),
      ssl: { rejectUnauthorized: true },
    })
  }
  return cachedPool
}

export function getDb(): Db {
  if (!cachedDb) cachedDb = drizzle(getPool(), { schema })
  return cachedDb
}

export const pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    const instance = getPool() as unknown as Record<string | symbol, unknown>
    const value = Reflect.get(instance, prop, receiver)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})

export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const instance = getDb() as unknown as Record<string | symbol, unknown>
    const value = Reflect.get(instance, prop, receiver)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})
