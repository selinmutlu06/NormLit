/**
 * Paper Ingestion Script for NormLit
 *
 * Usage: npx tsx scripts/ingest-papers.ts ./path/to/papers
 */

import { readdir } from 'fs/promises'
import { join, basename } from 'path'
import { readFile } from 'fs/promises'
import { ingestPdfBuffer } from '../lib/ingest'

async function main() {
  const papersDir = process.argv[2]

  if (!papersDir) {
    console.log('Usage: npx tsx scripts/ingest-papers.ts ./path/to/papers')
    process.exit(1)
  }

  console.log('\n=== NormLit Paper Ingestion ===')
  console.log(`Papers directory: ${papersDir}`)

  const files = await readdir(papersDir)
  const pdfFiles = files.filter((f) => f.toLowerCase().endsWith('.pdf'))

  if (pdfFiles.length === 0) {
    console.log('No PDF files found.')
    process.exit(1)
  }

  console.log(`Found ${pdfFiles.length} PDF files\n`)

  let successCount = 0
  let errorCount = 0

  for (const file of pdfFiles) {
    try {
      const buffer = await readFile(join(papersDir, file))
      const result = await ingestPdfBuffer(buffer, file)
      console.log(`✓ ${basename(file)} → ${result.title} (${result.chunkCount} chunks)`)
      successCount++
    } catch (error) {
      console.error(`✗ ${file}:`, error instanceof Error ? error.message : error)
      errorCount++
    }
  }

  console.log(`\nDone: ${successCount} succeeded, ${errorCount} failed`)
}

main().catch(console.error)
