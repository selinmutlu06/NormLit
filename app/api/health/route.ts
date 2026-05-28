import { NextResponse } from 'next/server'
import { getConfigStatus, getSupabaseUrl } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const config = getConfigStatus()
  let supabaseReachable = false
  let supabaseError: string | null = null
  let papersTable = false

  if (config.supabase) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.from('papers').select('id').limit(1)
      if (error) {
        supabaseError = `${error.code ?? 'error'}: ${error.message}`
        papersTable = !error.message.includes('papers') && error.code !== 'PGRST205'
      } else {
        supabaseReachable = true
        papersTable = true
      }
    } catch (error) {
      supabaseError = error instanceof Error ? error.message : 'Unknown error'
    }
  }

  return NextResponse.json({
    config,
    supabaseHost: getSupabaseUrl() || null,
    supabaseReachable,
    papersTable,
    supabaseError,
  })
}
