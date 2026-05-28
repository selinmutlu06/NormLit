import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/env'

export const runtime = 'nodejs'
export const maxDuration = 60

async function applySchemaWithPg(): Promise<void> {
  const { default: pg } = await import('pg')
  const sql = readFileSync(
    join(process.cwd(), 'scripts/001_create_schema.sql'),
    'utf8',
  )

  const connectionString =
    process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL

  let config: ConstructorParameters<typeof import('pg').Client>[0] | null = null

  if (connectionString) {
    const parsed = new URL(connectionString.replace('postgres://', 'https://'))
    config = {
      host: parsed.hostname,
      port: Number(parsed.port) === 6543 ? 5432 : Number(parsed.port || 5432),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace('/', '') || 'postgres',
      ssl: { rejectUnauthorized: false },
    }
  } else {
    const url = getSupabaseUrl()
    const password = process.env.POSTGRES_PASSWORD
    if (url && password) {
      const ref = url.replace('https://', '').replace('.supabase.co', '')
      config = {
        host: `db.${ref}.supabase.co`,
        port: 5432,
        user: 'postgres',
        password,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
      }
    }
  }

  if (!config) {
    throw new Error('Database connection not configured for setup.')
  }

  const client = new pg.Client(config)
  await client.connect()
  try {
    await client.query(sql)
  } finally {
    await client.end()
  }
}

export async function POST() {
  if (!getSupabaseUrl() || !getSupabaseServiceRoleKey()) {
    return NextResponse.json(
      { error: 'Supabase is not configured on the server.' },
      { status: 503 },
    )
  }

  try {
    await applySchemaWithPg()
    return NextResponse.json({ ok: true, message: 'Database schema applied.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Setup failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
