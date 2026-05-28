import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'
import { getAnthropicApiKey, getOpenAIApiKey } from '@/lib/env'

/** Embeddings stay on OpenAI to match pgvector(1536) in the database. */
export const embeddingModel = openai.embedding('text-embedding-3-small')

export function getChatModel(): LanguageModel {
  const preferred = process.env.CHAT_MODEL?.trim().toLowerCase()

  if (preferred === 'openai' || preferred === 'gpt-4o') {
    return openai('gpt-4o')
  }

  if (getAnthropicApiKey()) {
    return anthropic('claude-opus-4-7')
  }

  if (getOpenAIApiKey()) {
    return openai('gpt-4o')
  }

  throw new Error(
    'No chat provider configured. Add ANTHROPIC_API_KEY (Claude Opus 4.7) or OPENAI_API_KEY to .env.local.',
  )
}

export function getChatModelLabel(): string {
  const preferred = process.env.CHAT_MODEL?.trim().toLowerCase()
  if (preferred === 'openai' || preferred === 'gpt-4o') return 'GPT-4o'
  if (getAnthropicApiKey()) return 'Claude Opus 4.7'
  return 'GPT-4o'
}
