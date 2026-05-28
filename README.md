# NormLit - Research Literature Assistant

**Live app:** [https://v0-normlit-research-assistant.vercel.app](https://v0-normlit-research-assistant.vercel.app) · Chat: [/chat](https://v0-normlit-research-assistant.vercel.app/chat)

A RAG-powered research assistant for cognitive neuroscience labs. Chat with your paper library, get cited answers, and compare findings across studies.

## Features

- **Chat with Papers**: Ask questions in natural language and get answers synthesized from your paper library with inline citations
- **Semantic Search**: Find relevant passages using meaning, not just keywords
- **Paper Filtering**: Filter by year, author, or select specific papers to focus your search
- **Compare Findings**: Select multiple papers and compare methodologies, findings, or identify contradictions
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

- **Frontend**: Next.js 16, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Vercel AI SDK 6
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI**: Claude Opus 4.7 (chat), OpenAI text-embedding-3-small (embeddings)

## Setup

### 1. Environment Variables

Create a `.env.local` file with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI (embeddings for semantic search)
OPENAI_API_KEY=your_openai_api_key

# Anthropic (chat — Claude Opus 4.7)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 2. Database Setup

The database schema is automatically created when you run the app for the first time, or you can run the migration manually:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Papers table
CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  year INTEGER,
  doi TEXT,
  abstract TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paper chunks table with embeddings
CREATE TABLE paper_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Ingest Papers

**In the app:** Open `/chat` and drag PDFs into the sidebar upload zone.

**Or via CLI:** Place your PDF files in a directory and run the ingestion script:

```bash
npx tsx scripts/ingest-papers.ts ./path/to/papers
```

**Recommended file naming convention:**
- `Author (Year) - Title.pdf`
- `Smith et al. (2023) - Cognitive Processing.pdf`

The script will:
1. Extract text from each PDF
2. Parse metadata from the filename
3. Chunk the text into overlapping segments
4. Generate embeddings using OpenAI
5. Store everything in Supabase

### 4. Run the App

```bash
pnpm install
pnpm dev
```

## Usage

1. **Open the Chat**: Navigate to `/chat` to start asking questions
2. **Select Papers**: Use the sidebar to filter papers by year or search by title/author
3. **Ask Questions**: Type your question and the AI will search relevant chunks and synthesize an answer with citations
4. **Compare Papers**: Select 2+ papers and click "Compare Papers" to analyze findings, methods, or contradictions

## Project Structure

```
app/
  page.tsx          # Landing page
  chat/page.tsx     # Main chat interface
  api/
    chat/route.ts   # Chat API with RAG
    papers/route.ts # Papers list API
    compare/route.ts # Paper comparison API
components/
  chat-message.tsx  # Message rendering with citations
  paper-sidebar.tsx # Paper list with filtering
  compare-panel.tsx # Paper comparison dialog
lib/
  supabase/         # Supabase client setup
  types.ts          # TypeScript types
scripts/
  ingest-papers.ts  # PDF ingestion script
  001_create_schema.sql # Database schema
```

## License

MIT
