/**
 * Apply NormLit schema to Supabase
 * Usage: node --env-file=.env.local scripts/apply-schema.mjs
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dirname, '001_create_schema.sql'), 'utf8')

function getConnectionConfig() {
  const nonPooling = process.env.POSTGRES_URL_NON_POOLING
  const pooled = process.env.POSTGRES_URL

  if (nonPooling) {
    return { connectionString: nonPooling, ssl: { rejectUnauthorized: false } }
  }

  if (pooled) {
    return { connectionString: pooled, ssl: { rejectUnauthorized: false } }
  }

  const host = process.env.POSTGRES_HOST
  const user = process.env.POSTGRES_USER
  const password = process.env.POSTGRES_PASSWORD
  const database = process.env.POSTGRES_DATABASE ?? 'postgres'

  if (host && user && password) {
    return {
      host,
      port: 5432,
      user,
      password,
      database,
      ssl: { rejectUnauthorized: false },
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const passwordOnly = process.env.POSTGRES_PASSWORD ?? process.env.SUPABASE_DB_PASSWORD

  if (supabaseUrl && passwordOnly) {
    const ref = supabaseUrl.replace('https://', '').replace('.supabase.co', '')
    return {
      host: `db.${ref}.supabase.co`,
      port: 5432,
      user: 'postgres',
      password: passwordOnly,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
    }
  }

  return null
}

const config = getConnectionConfig()
if (!config) {
  console.error('Missing database credentials in .env.local')
  process.exit(1)
}

const { default: pg } = await import('pg')
const client = new pg.Client(config)

try {
  await client.connect()
  await client.query(sql)
  console.log('✓ Schema applied successfully (papers, paper_chunks, match_paper_chunks).')
} catch (error) {
  console.error('Schema apply failed:', error.message)
  process.exit(1)
} finally {
  await client.end()
}
