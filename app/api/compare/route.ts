import { consumeStream, streamText, embed } from 'ai'
import { NextResponse } from 'next/server'
import { getChatModel, embeddingModel } from '@/lib/ai'
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
    const { paperIds, comparisonType }: { paperIds: string[]; comparisonType: string } =
      await req.json()

    if (!paperIds || paperIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 papers required for comparison' },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    const { data: papers, error: papersError } = await supabase
      .from('papers')
      .select('*')
      .in('id', paperIds)

    if (papersError || !papers?.length) {
      return NextResponse.json({ error: 'Failed to fetch papers' }, { status: 500 })
    }

    const comparisonQueries: Record<string, string> = {
      findings: 'main findings, results, and conclusions',
      methods: 'methodologies, experimental designs, and procedures',
      contradictions: 'contradictory findings, disagreements, or conflicting results',
      synthesis: 'overall themes, patterns, and how findings relate to each other',
    }

    const queryTopic = comparisonQueries[comparisonType] || comparisonQueries.synthesis

    const { embedding } = await embed({
      model: embeddingModel,
      value: `Compare ${queryTopic} across studies`,
    })

    const { data: chunks, error: chunksError } = await supabase.rpc('match_paper_chunks', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 12,
      filter_paper_ids: paperIds,
    })

    if (chunksError) {
      console.error('Error searching paper chunks:', chunksError)
    }

    const paperChunks: Record<string, string[]> = {}
    chunks?.forEach(
      (chunk: {
        paper_id: string
        content: string
        paper_title: string
        paper_authors: string
        paper_year: number
      }) => {
        const key = `${chunk.paper_title} (${chunk.paper_authors}, ${chunk.paper_year})`
        if (!paperChunks[key]) {
          paperChunks[key] = []
        }
        paperChunks[key].push(chunk.content)
      },
    )

    const context =
      Object.entries(paperChunks).length > 0
        ? Object.entries(paperChunks)
            .map(([paper, excerpts]) => `## ${paper}\n\n${excerpts.join('\n\n')}`)
            .join('\n\n---\n\n')
        : 'No indexed excerpts were found for these papers. Upload or re-ingest them first.'

    const paperList = papers
      .map((p) => `- ${p.title} (${p.authors}, ${p.year})`)
      .join('\n')

    const systemPrompt = `You are NormLit, a research literature assistant specializing in comparative analysis of academic papers.

TASK: Compare the following ${papers.length} papers, focusing on their ${queryTopic}.

PAPERS BEING COMPARED:
${paperList}

GUIDELINES:
1. Structure your comparison clearly with headings for each aspect
2. Use citations [Author, Year] when referencing specific papers
3. Highlight both similarities and differences
4. If comparing findings, note any contradictions or inconsistencies
5. If comparing methods, discuss strengths and limitations of each approach
6. Be specific and cite evidence from the paper excerpts
7. End with a synthesis summarizing key insights from the comparison

RELEVANT EXCERPTS FROM PAPERS:
${context}`

    const result = streamText({
      model: getChatModel(),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Please compare these papers, focusing on their ${queryTopic}.`,
        },
      ],
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse({
      consumeSseStream: consumeStream,
    })
  } catch (error) {
    console.error('Compare API error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to compare papers.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
