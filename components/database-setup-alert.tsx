'use client'

import Link from 'next/link'
import { AlertCircle, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

const SETUP_SQL = `-- Run in Supabase → SQL Editor → New query
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  year INTEGER,
  doi TEXT,
  abstract TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paper_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS paper_chunks_paper_id_idx ON paper_chunks(paper_id);

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
$$;`

interface DatabaseSetupAlertProps {
  message?: string
  details?: string
}

export function DatabaseSetupAlert({ message, details }: DatabaseSetupAlertProps) {
  const [copied, setCopied] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applyResult, setApplyResult] = useState<string | null>(null)

  const runAutoSetup = async () => {
    setApplying(true)
    setApplyResult(null)
    try {
      const res = await fetch('/api/setup', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setApplyResult(data.error ?? 'Auto-setup failed. Use manual SQL below.')
        return
      }
      setApplyResult('Database ready! Refreshing…')
      window.location.reload()
    } catch {
      setApplyResult('Auto-setup failed. Use manual SQL below.')
    } finally {
      setApplying(false)
    }
  }

  const copySql = async () => {
    await navigator.clipboard.writeText(SETUP_SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>Database setup required</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          {message ??
            'Your Supabase database is missing the papers tables. Run the schema SQL once, then refresh.'}
        </p>
        {details && (
          <p className="font-mono text-xs opacity-90">{details}</p>
        )}
        {applyResult && (
          <p className="text-sm">{applyResult}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={runAutoSetup}
            disabled={applying}
          >
            {applying ? 'Setting up…' : 'Auto-setup database'}
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link
              href="https://supabase.com/dashboard/project/swvxdjupdbobjbvxtlpe/sql/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 size-4" />
              Open Supabase SQL Editor
            </Link>
          </Button>
          <Button variant="secondary" size="sm" onClick={copySql}>
            {copied ? (
              <Check className="mr-2 size-4" />
            ) : (
              <Copy className="mr-2 size-4" />
            )}
            Copy setup SQL
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
