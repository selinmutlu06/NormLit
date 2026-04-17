export interface Paper {
  id: string
  title: string
  authors: string
  year: number | null
  doi: string | null
  abstract: string | null
  created_at: string
}

export interface PaperChunk {
  id: string
  paper_id: string
  content: string
  chunk_index: number
  embedding: number[] | null
  created_at: string
}

export interface MatchedChunk {
  id: string
  paper_id: string
  content: string
  chunk_index: number
  similarity: number
  paper_title: string
  paper_authors: string
  paper_year: number | null
}

export interface CompareResult {
  supporting: MatchedChunk[]
  contradicting: MatchedChunk[]
  nuancing: MatchedChunk[]
}
