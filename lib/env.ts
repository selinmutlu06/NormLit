function firstDefined(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (value?.trim()) return value.trim()
  }
  return ''
}

export function getSupabaseUrl(): string {
  return firstDefined(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
  )
}

export function getSupabaseAnonKey(): string {
  return firstDefined(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_ANON_KEY,
  )
}

export function getSupabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? ''
}

export function getOpenAIApiKey(): string {
  return process.env.OPENAI_API_KEY?.trim() ?? ''
}

export function getAnthropicApiKey(): string {
  return process.env.ANTHROPIC_API_KEY?.trim() ?? ''
}

export function getConfigStatus(): {
  supabase: boolean
  openai: boolean
  anthropic: boolean
} {
  return {
    supabase: Boolean(getSupabaseUrl() && getSupabaseAnonKey()),
    openai: Boolean(getOpenAIApiKey()),
    anthropic: Boolean(getAnthropicApiKey()),
  }
}

export function assertSupabaseConfig(): void {
  if (!getSupabaseUrl() || !getSupabaseAnonKey()) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.',
    )
  }
}

export function assertIngestionConfig(): void {
  assertSupabaseConfig()
  if (!getSupabaseServiceRoleKey()) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for PDF uploads.',
    )
  }
  if (!getOpenAIApiKey()) {
    throw new Error(
      'OPENAI_API_KEY is required for embeddings during PDF ingestion.',
    )
  }
}

export function assertChatConfig(): void {
  assertSupabaseConfig()
  if (!getOpenAIApiKey()) {
    throw new Error(
      'OPENAI_API_KEY is required for semantic search embeddings.',
    )
  }
  if (!getAnthropicApiKey() && !getOpenAIApiKey()) {
    throw new Error(
      'Set ANTHROPIC_API_KEY (recommended for Claude Opus 4.7) or OPENAI_API_KEY for chat.',
    )
  }
}
