import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
  embed,
} from 'ai'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages, selectedPaperIds }: { messages: UIMessage[]; selectedPaperIds?: string[] } = await req.json()

  // Get the last user message for RAG
  const lastMessage = messages[messages.length - 1]
  const userQuery = lastMessage?.parts
    ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('') || ''

  // Generate embedding for the query
  const { embedding } = await embed({
    model: 'openai/text-embedding-3-small',
    value: userQuery,
  })

  // Search for relevant paper chunks
  const supabase = await createClient()
  const { data: chunks, error } = await supabase.rpc('match_paper_chunks', {
    query_embedding: JSON.stringify(embedding),
    match_threshold: 0.5,
    match_count: 6,
    filter_paper_ids: selectedPaperIds?.length ? selectedPaperIds : null,
  })

  if (error) {
    console.error('Error searching paper chunks:', error)
  }

  // Build context from retrieved chunks
  const context = chunks?.length
    ? chunks
        .map(
          (chunk: {
            content: string
            paper_title: string
            paper_authors: string
            paper_year: number
            similarity: number
          }) =>
            `[${chunk.paper_title} (${chunk.paper_authors}, ${chunk.paper_year})]:\n${chunk.content}`
        )
        .join('\n\n---\n\n')
    : 'No relevant papers found in the database. Please ingest some papers first.'

  const systemPrompt = `You are NormLit, a research literature assistant for a cognitive neuroscience lab. Your role is to help researchers understand and synthesize information from their paper library.

IMPORTANT GUIDELINES:
1. Base your answers ONLY on the provided paper excerpts below. Do not make up information.
2. Always cite your sources using the format [Author, Year] when referencing information from papers.
3. If the provided context doesn't contain enough information to answer the question, say so clearly.
4. When comparing papers, highlight both similarities and differences in findings, methods, or conclusions.
5. Be concise but thorough. Researchers value precision.

RETRIEVED PAPER EXCERPTS:
${context}

Now answer the user's question based on these excerpts.`

  const result = streamText({
    model: 'openai/gpt-4o',
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
