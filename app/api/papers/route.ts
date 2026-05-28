import { createClient } from '@/lib/supabase/server'
import { getConfigStatus } from '@/lib/env'
import { NextResponse } from 'next/server'

export async function GET() {
  const config = getConfigStatus()

  if (!config.supabase) {
    return NextResponse.json(
      {
        error:
          'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.',
        config,
      },
      { status: 503 },
    )
  }

  try {
    const supabase = await createClient()

    const { data: papers, error } = await supabase
      .from('papers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching papers:', error)
      return NextResponse.json(
        {
          error:
            'Failed to fetch papers. Ensure the database schema is applied (see scripts/001_create_schema.sql).',
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(papers ?? [])
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch papers'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
