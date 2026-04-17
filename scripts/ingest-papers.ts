/**
 * Paper Ingestion Script for NormLit
 * 
 * This script reads PDF files from a directory, extracts text, chunks it,
 * generates embeddings, and stores everything in Supabase.
 * 
 * Usage:
 *   npx tsx scripts/ingest-papers.ts ./path/to/papers
 * 
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 *   - OPENAI_API_KEY in .env (for embeddings)
 *   - pdf-parse package for PDF extraction
 */

import { createClient } from "@supabase/supabase-js"
import { readdir, readFile } from "fs/promises"
import { join, basename } from "path"

// PDF parsing - we'll use pdf-parse
import pdf from "pdf-parse"

// Configuration
const CHUNK_SIZE = 1000 // characters per chunk
const CHUNK_OVERLAP = 200 // overlap between chunks
const EMBEDDING_MODEL = "text-embedding-3-small"
const EMBEDDING_DIMENSIONS = 1536

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openaiApiKey = process.env.OPENAI_API_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

if (!openaiApiKey) {
  console.error("Missing OPENAI_API_KEY for embeddings")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface PaperMetadata {
  title: string
  authors: string
  year?: number
  doi?: string
  abstract?: string
}

/**
 * Extract metadata from PDF filename or content
 * Format expected: "Author et al. (Year) - Title.pdf" or similar
 */
function extractMetadataFromFilename(filename: string): PaperMetadata {
  const name = basename(filename, ".pdf")
  
  // Try to parse "Author (Year) - Title" format
  const match = name.match(/^(.+?)\s*\((\d{4})\)\s*[-–]\s*(.+)$/)
  if (match) {
    return {
      authors: match[1].trim(),
      year: parseInt(match[2]),
      title: match[3].trim(),
    }
  }
  
  // Try to parse "Author - Title (Year)" format
  const match2 = name.match(/^(.+?)\s*[-–]\s*(.+?)\s*\((\d{4})\)$/)
  if (match2) {
    return {
      authors: match2[1].trim(),
      title: match2[2].trim(),
      year: parseInt(match2[3]),
    }
  }

  // Fallback: use filename as title
  return {
    title: name,
    authors: "Unknown",
  }
}

/**
 * Extract text from PDF file
 */
async function extractTextFromPdf(filePath: string): Promise<string> {
  const dataBuffer = await readFile(filePath)
  const data = await pdf(dataBuffer)
  return data.text
}

/**
 * Split text into overlapping chunks
 */
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = []
  let start = 0
  
  // Clean up the text
  const cleanText = text
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
  
  while (start < cleanText.length) {
    const end = Math.min(start + chunkSize, cleanText.length)
    let chunk = cleanText.slice(start, end)
    
    // Try to end at a sentence boundary
    if (end < cleanText.length) {
      const lastPeriod = chunk.lastIndexOf(". ")
      const lastQuestion = chunk.lastIndexOf("? ")
      const lastExclaim = chunk.lastIndexOf("! ")
      const lastBoundary = Math.max(lastPeriod, lastQuestion, lastExclaim)
      
      if (lastBoundary > chunkSize * 0.5) {
        chunk = chunk.slice(0, lastBoundary + 1)
      }
    }
    
    if (chunk.trim().length > 50) { // Only add non-trivial chunks
      chunks.push(chunk.trim())
    }
    
    start = start + chunk.length - overlap
    if (start >= cleanText.length - overlap) break
  }
  
  return chunks
}

/**
 * Generate embeddings using OpenAI API
 */
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return data.data.map((item: { embedding: number[] }) => item.embedding)
}

/**
 * Ingest a single paper
 */
async function ingestPaper(filePath: string): Promise<void> {
  console.log(`\nProcessing: ${basename(filePath)}`)
  
  // Extract metadata
  const metadata = extractMetadataFromFilename(filePath)
  console.log(`  Title: ${metadata.title}`)
  console.log(`  Authors: ${metadata.authors}`)
  if (metadata.year) console.log(`  Year: ${metadata.year}`)
  
  // Extract text from PDF
  console.log("  Extracting text...")
  const text = await extractTextFromPdf(filePath)
  console.log(`  Extracted ${text.length} characters`)
  
  // Try to extract abstract (first ~500 chars after "Abstract")
  const abstractMatch = text.match(/abstract[:\s]*(.{100,500}?)(?=\n\n|introduction|1\.|keywords)/i)
  if (abstractMatch) {
    metadata.abstract = abstractMatch[1].trim()
  }
  
  // Chunk the text
  console.log("  Chunking text...")
  const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP)
  console.log(`  Created ${chunks.length} chunks`)
  
  // Insert paper metadata
  const { data: paper, error: paperError } = await supabase
    .from("papers")
    .insert({
      title: metadata.title,
      authors: metadata.authors,
      year: metadata.year,
      doi: metadata.doi,
      abstract: metadata.abstract,
    })
    .select()
    .single()
  
  if (paperError) {
    console.error(`  Error inserting paper: ${paperError.message}`)
    return
  }
  
  console.log(`  Paper ID: ${paper.id}`)
  
  // Generate embeddings in batches
  console.log("  Generating embeddings...")
  const batchSize = 20 // OpenAI allows up to 2048 inputs, but we'll be conservative
  const paperChunks: { paper_id: string; content: string; chunk_index: number; embedding: string }[] = []
  
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
    
    console.log(`  Generated embeddings for chunks ${i + 1}-${Math.min(i + batchSize, chunks.length)}`)
  }
  
  // Insert chunks
  console.log("  Storing chunks...")
  const { error: chunksError } = await supabase
    .from("paper_chunks")
    .insert(paperChunks)
  
  if (chunksError) {
    console.error(`  Error inserting chunks: ${chunksError.message}`)
    return
  }
  
  console.log(`  ✓ Successfully ingested ${chunks.length} chunks`)
}

/**
 * Main function
 */
async function main() {
  const papersDir = process.argv[2]
  
  if (!papersDir) {
    console.log("Usage: npx tsx scripts/ingest-papers.ts ./path/to/papers")
    console.log("\nThis script will:")
    console.log("  1. Read all PDF files from the specified directory")
    console.log("  2. Extract text and metadata from each PDF")
    console.log("  3. Chunk the text into overlapping segments")
    console.log("  4. Generate embeddings using OpenAI")
    console.log("  5. Store everything in Supabase")
    console.log("\nFile naming convention (optional but recommended):")
    console.log('  "Author (Year) - Title.pdf"')
    console.log('  "Smith et al. (2023) - Cognitive Processing.pdf"')
    process.exit(1)
  }
  
  console.log(`\n=== NormLit Paper Ingestion ===`)
  console.log(`Papers directory: ${papersDir}`)
  
  // Read directory
  const files = await readdir(papersDir)
  const pdfFiles = files.filter(f => f.toLowerCase().endsWith(".pdf"))
  
  if (pdfFiles.length === 0) {
    console.log("No PDF files found in the specified directory")
    process.exit(1)
  }
  
  console.log(`Found ${pdfFiles.length} PDF files`)
  
  // Process each file
  let successCount = 0
  let errorCount = 0
  
  for (const file of pdfFiles) {
    try {
      await ingestPaper(join(papersDir, file))
      successCount++
    } catch (error) {
      console.error(`  Error processing ${file}:`, error)
      errorCount++
    }
  }
  
  console.log(`\n=== Ingestion Complete ===`)
  console.log(`Successfully processed: ${successCount} papers`)
  if (errorCount > 0) {
    console.log(`Errors: ${errorCount} papers`)
  }
}

main().catch(console.error)
