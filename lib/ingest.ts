import { PDFParse } from 'pdf-parse'
import { basename } from 'path'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOpenAIApiKey } from '@/lib/env'

const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 200
const EMBEDDING_MODEL = 'text-embedding-3-small'

export interface PaperMetadata {
  title: string
  authors: string
  year?: number
  doi?: string
  abstract?: string
}

export function extractMetadataFromFilename(filename: string): PaperMetadata {
  const name = basename(filename, '.pdf')

  const match = name.match(/^(.+?)\s*\((\d{4})\)\s*[-–]\s*(.+)$/)
  if (match) {
    return {
      authors: match[1].trim(),
      year: parseInt(match[2], 10),
      title: match[3].trim(),
    }
  }

  const match2 = name.match(/^(.+?)\s*[-–]\s*(.+?)\s*\((\d{4})\)$/)
  if (match2) {
    return {
      authors: match2[1].trim(),
      title: match2[2].trim(),
      year: parseInt(match2[3], 10),
    }
  }

  return {
    title: name,
    authors: 'Unknown',
  }
}

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer })
  try {
    const result = await parser.getText()
    return result.text
  } finally {
    await parser.destroy()
  }
}

export function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const chunks: string[] = []
  let start = 0

  const cleanText = text.replace(/\s+/g, ' ').trim()

  while (start < cleanText.length) {
    const end = Math.min(start + chunkSize, cleanText.length)
    let chunk = cleanText.slice(start, end)

    if (end < cleanText.length) {
      const lastPeriod = chunk.lastIndexOf('. ')
      const lastQuestion = chunk.lastIndexOf('? ')
      const lastExclaim = chunk.lastIndexOf('! ')
      const lastBoundary = Math.max(lastPeriod, lastQuestion, lastExclaim)

      if (lastBoundary > chunkSize * 0.5) {
        chunk = chunk.slice(0, lastBoundary + 1)
      }
    }

    if (chunk.trim().length > 50) {
      chunks.push(chunk.trim())
    }

    start = start + chunk.length - overlap
    if (start >= cleanText.length - overlap) break
  }

  return chunks
}

async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const openaiApiKey = getOpenAIApiKey()
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY is required for embeddings.')
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI embeddings failed: ${error}`)
  }

  const data = await response.json()
  return data.data.map((item: { embedding: number[] }) => item.embedding)
}

export interface IngestResult {
  paperId: string
  title: string
  chunkCount: number
}

export async function ingestPdfBuffer(
  buffer: Buffer,
  filename: string,
): Promise<IngestResult> {
  const metadata = extractMetadataFromFilename(filename)
  const text = await extractTextFromPdfBuffer(buffer)

  if (!text.trim()) {
    throw new Error('Could not extract text from this PDF. Try a text-based PDF.')
  }

  const abstractMatch = text.match(
    /abstract[:\s]*(.{100,500}?)(?=\n\n|introduction|1\.|keywords)/i,
  )
  if (abstractMatch) {
    metadata.abstract = abstractMatch[1].trim()
  }

  const chunks = chunkText(text)
  if (chunks.length === 0) {
    throw new Error('PDF text was too short to create searchable chunks.')
  }

  const supabase = createAdminClient()

  const { data: paper, error: paperError } = await supabase
    .from('papers')
    .insert({
      title: metadata.title,
      authors: metadata.authors,
      year: metadata.year ?? null,
      doi: metadata.doi ?? null,
      abstract: metadata.abstract ?? null,
    })
    .select()
    .single()

  if (paperError || !paper) {
    throw new Error(paperError?.message ?? 'Failed to save paper metadata.')
  }

  const paperChunks: {
    paper_id: string
    content: string
    chunk_index: number
    embedding: string
  }[] = []

  const batchSize = 20
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)
    const embeddings = await generateEmbeddings(batch)

    for (let j = 0; j < batch.length; j++) {
      paperChunks.push({
        paper_id: paper.id,
        content: batch[j],
        chunk_index: i + j,
        embedding: JSON.stringify(embeddings[j]),
      })
    }
  }

  const { error: chunksError } = await supabase.from('paper_chunks').insert(paperChunks)

  if (chunksError) {
    await supabase.from('papers').delete().eq('id', paper.id)
    throw new Error(chunksError.message)
  }

  return {
    paperId: paper.id,
    title: metadata.title,
    chunkCount: chunks.length,
  }
}
