import {
  consumeStream,
  convertToModelMessages,
  embed,
  streamText,
  type UIMessage,
} from 'ai'
import { NextResponse } from 'next/server'
import { embeddingModel, getChatModel } from '@/lib/ai'
import { assertChatConfig } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    assertChatConfig()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Configuration error'
    return NextResponse.json({ error: message }, { status: 503 })
  }

  try {
    const {
      messages,
      selectedPaperIds,
    }: { messages: UIMessage[]; selectedPaperIds?: string[] } = await req.json()

    const lastMessage = messages[messages.length - 1]
    const userQuery =
      lastMessage?.parts
        ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('') || ''

    if (!userQuery.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 })
    }

    const { embedding } = await embed({
      model: embeddingModel,
      value: userQuery,
    })

    const supabase = await createClient()
    const { data: chunks, error } = await supabase.rpc('match_paper_chunks', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 6,
      filter_paper_ids: selectedPaperIds?.length ? selectedPaperIds : null,
    })

    if (error) {
      console.error('Error searching paper chunks:', error)
    }

    const context = chunks?.length
      ? chunks
          .map(
            (chunk: {
              content: string
              paper_title: string
              paper_authors: string
              paper_year: number
            }) =>
              `[${chunk.paper_title} (${chunk.paper_authors}, ${chunk.paper_year})]:\n${chunk.content}`,
          )
          .join('\n\n---\n\n')
      : 'No relevant papers found in the database. Upload PDFs in the sidebar, or run the ingestion script, then try again.'

    const systemPrompt = `You are NormLit, a research literature assistant for a cognitive neuroscience lab. Your role is to help researchers understand and synthesize information from their paper library.

IMPORTANT GUIDELINES:
1. Base your answers ONLY on the provided paper excerpts below when they are relevant. Do not invent study results.
2. Always cite your sources using the format [Author, Year] when referencing information from papers.
3. If the provided context doesn't contain enough information to answer the question, say so clearly and suggest uploading more papers.
4. When comparing papers, highlight both similarities and differences in findings, methods, or conclusions.
5. Be concise but thorough. Researchers value precision.

RETRIEVED PAPER EXCERPTS:
${context}

Now answer the user's question based on these excerpts.`

    const result = streamText({
      model: getChatModel(),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      consumeSseStream: consumeStream,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to generate a response.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
