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
    config = {
      connectionString,
      ssl: { rejectUnauthorized: false },
    }
  } else if (process.env.POSTGRES_HOST && process.env.POSTGRES_PASSWORD) {
    config = {
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      user: process.env.POSTGRES_USER ?? 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE ?? 'postgres',
      ssl: { rejectUnauthorized: false },
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
