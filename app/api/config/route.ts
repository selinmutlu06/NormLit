import { NextResponse } from 'next/server'
import { getChatModelLabel } from '@/lib/ai'
import { getAnthropicApiKey, getConfigStatus, getOpenAIApiKey } from '@/lib/env'

export async function GET() {
  const config = getConfigStatus()

  let chatModel: string | null = null
  if (getAnthropicApiKey() || getOpenAIApiKey()) {
    try {
      chatModel = getChatModelLabel()
    } catch {
      chatModel = null
    }
  }

  return NextResponse.json({
    config,
    chatModel,
    ready:
      config.supabase &&
      config.openai &&
      (config.anthropic || config.openai),
  })
}
