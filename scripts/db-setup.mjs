// Applies every SQL file in ./drizzle (in filename order) to DATABASE_URL.
// Run on a fresh self-hosted database with: pnpm db:setup
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Pool } = pg
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const drizzleDir = path.join(root, 'drizzle')

function connectionString() {
  const raw = process.env.DATABASE_URL
  if (!raw) {
    console.error('DATABASE_URL is not set. Add it to your environment (see DEPLOY.md).')
    process.exit(1)
  }
  try {
    const url = new URL(raw)
    url.searchParams.delete('sslmode')
    url.searchParams.delete('channel_binding')
    return url.toString()
  } catch {
    return raw
  }
}

async function main() {
  const files = (await readdir(drizzleDir)).filter((f) => f.endsWith('.sql')).sort()
  if (files.length === 0) {
    console.error('No .sql files found in ./drizzle')
    process.exit(1)
  }
  const pool = new Pool({ connectionString: connectionString(), ssl: { rejectUnauthorized: true } })
  try {
    for (const file of files) {
      const sql = await readFile(path.join(drizzleDir, file), 'utf8')
      process.stdout.write(`Applying ${file}... `)
      await pool.query(sql)
      console.log('done')
    }
    console.log('Database schema is up to date.')
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
