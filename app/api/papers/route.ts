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
      const missingTable =
        error.code === 'PGRST205' ||
        error.message.includes('papers') ||
        error.message.includes('schema cache')
      return NextResponse.json(
        {
          error: missingTable
            ? 'Database tables not found. Run the setup SQL in Supabase (see banner for copy button) or run: npm run db:setup'
            : 'Failed to fetch papers.',
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
