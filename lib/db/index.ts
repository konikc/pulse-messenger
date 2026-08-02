import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

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

export const pool = new Pool({
  connectionString: buildConnectionString(process.env.DATABASE_URL),
  ssl: { rejectUnauthorized: true },
})

export const db = drizzle(pool, { schema })
