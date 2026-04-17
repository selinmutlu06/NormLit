-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Papers table: stores metadata about research papers
CREATE TABLE IF NOT EXISTS papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  year INTEGER,
  doi TEXT,
  abstract TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paper chunks table: stores chunked text with embeddings for RAG
CREATE TABLE IF NOT EXISTS paper_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimension
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index for fast vector similarity search
CREATE INDEX IF NOT EXISTS paper_chunks_embedding_idx 
ON paper_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index on paper_id for faster joins
CREATE INDEX IF NOT EXISTS paper_chunks_paper_id_idx ON paper_chunks(paper_id);

-- Function to search for similar chunks using cosine similarity
CREATE OR REPLACE FUNCTION match_paper_chunks(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 6,
  filter_paper_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  paper_id UUID,
  content TEXT,
  chunk_index INTEGER,
  similarity FLOAT,
  paper_title TEXT,
  paper_authors TEXT,
  paper_year INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.id,
    pc.paper_id,
    pc.content,
    pc.chunk_index,
    1 - (pc.embedding <=> query_embedding) AS similarity,
    p.title AS paper_title,
    p.authors AS paper_authors,
    p.year AS paper_year
  FROM paper_chunks pc
  JOIN papers p ON pc.paper_id = p.id
  WHERE 
    1 - (pc.embedding <=> query_embedding) > match_threshold
    AND (filter_paper_ids IS NULL OR pc.paper_id = ANY(filter_paper_ids))
  ORDER BY pc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
