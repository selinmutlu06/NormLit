import { NextResponse } from 'next/server'
import { assertIngestionConfig } from '@/lib/env'
import { ingestPdfBuffer } from '@/lib/ingest'

export const runtime = 'nodejs'
export const maxDuration = 120

const MAX_FILE_BYTES = 25 * 1024 * 1024

export async function POST(req: Request) {
  try {
    assertIngestionConfig()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Configuration error'
    return NextResponse.json({ error: message }, { status: 503 })
  }

  try {
    const formData = await req.formData()
    const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ error: 'No PDF files provided.' }, { status: 400 })
    }

    const results: Array<{
      filename: string
      paperId?: string
      title?: string
      chunkCount?: number
      error?: string
    }> = []

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        results.push({
          filename: file.name,
          error: 'Only PDF files are supported.',
        })
        continue
      }

      if (file.size > MAX_FILE_BYTES) {
        results.push({
          filename: file.name,
          error: 'File exceeds 25 MB limit.',
        })
        continue
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const ingested = await ingestPdfBuffer(buffer, file.name)
        results.push({
          filename: file.name,
          paperId: ingested.paperId,
          title: ingested.title,
          chunkCount: ingested.chunkCount,
        })
      } catch (error) {
        results.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Ingestion failed.',
        })
      }
    }

    const succeeded = results.filter((r) => r.paperId).length
    const failed = results.length - succeeded

    return NextResponse.json({
      results,
      summary: { total: results.length, succeeded, failed },
    })
  } catch (error) {
    console.error('Upload API error:', error)
    const message = error instanceof Error ? error.message : 'Upload failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
