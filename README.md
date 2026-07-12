# NormLit

Research literature intelligence for cognitive neuroscience labs. Chat with your paper library, get cited answers, compare findings across studies. Live at [v0-normlit-research-assistant-djiy.vercel.app](https://v0-normlit-research-assistant-djiy.vercel.app/).

In a cognitive neuroscience lab, literature review is brutal. You cross-reference dozens of papers by hand. You hunt for the one paragraph that answers your question. You parse hundred-page equipment manuals just to run a single EEG session. The science is fascinating. The paperwork is not.

NormLit is the tool I wished my team had.

<br>

## Where it started

I built NormLit during Duke's Cognitive Neuroscience Research Internship (CNRI), where I ran EEG research on how the brain processes social norm violations using the N400 ERP component. Watching my team burn hours manually cross-referencing literature and parsing a 100-page EEG instruction packet, I wanted to build something that made that grind disappear.

NormLit uses RAG and vector embeddings to ground every answer in your uploaded papers, with inline citations you can trace back to the source.

**Fig. 1. The lab.** Setting up the BioSemi ActiveTwo during CNRI, the work that inspired NormLit.

<img src="docs/images/cnri-lab-setup.png" alt="EEG lab setup at Duke CNRI, BioSemi ActiveTwo system" width="100%" />

**Fig. 2. The research.** CNRI poster on social and masculinity norms.

<img src="docs/images/cnri-research-poster.png" alt="CNRI research poster on social and masculinity norms EEG study" width="100%" />

<br>

## What it does

Ask questions in natural language and get answers synthesized from your library with inline citations. Search finds passages by meaning rather than keywords, filterable by year, author, or specific papers. Select multiple papers and compare methodologies, results, or contradictions side by side.

**Fig. 3. The chat.** Paper upload sidebar, cited answers.

<img src="docs/images/app-chat.png" alt="NormLit chat interface with paper upload sidebar" width="100%" />

<br>

## Built for the lab, not just the literature

NormLit ships with a complete EEG Study Guide, a step-by-step BioSemi ActiveTwo protocol born from that same 100-page instruction packet. Participant prep, cap setup, gel application, recording, cleanup. It lives at [/eeg-guide](https://v0-normlit-research-assistant-djiy.vercel.app/eeg-guide).

**Fig. 4. The guide.**

<img src="docs/images/app-eeg-guide.png" alt="NormLit EEG Study Guide, BioSemi ActiveTwo protocol" width="100%" />

<br>

## How it works

| Step | What happens |
|------|--------------|
| Ingest | PDFs are chunked and embedded with OpenAI text-embedding-3-small |
| Store | Vectors live in Supabase PostgreSQL via pgvector |
| Retrieve | Your question is embedded and matched with cosine similarity |
| Answer | Claude Opus 4.8 synthesizes a response with paper citations |

| Layer | Tools |
|-------|-------|
| Frontend | Next.js 16, React, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, Vercel AI SDK 6 |
| Database | Supabase (PostgreSQL + pgvector) |
| AI | Claude Opus 4.8 (chat), OpenAI embeddings (search) |
| Deploy | Vercel |

<br>

## Quick start

```bash
git clone https://github.com/selinmutlu06/NormLit.git
cd NormLit
pnpm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

```bash
pnpm dev
```

Open [localhost:3000/chat](http://localhost:3000/chat), drop PDFs into the sidebar, and start asking questions. Bulk ingestion runs from the CLI with `npx tsx scripts/ingest-papers.ts ./path/to/papers`, naming convention `Author (Year) - Title.pdf`.

```
app/
  page.tsx              landing page
  chat/page.tsx         RAG chat interface
  eeg-guide/page.tsx    BioSemi EEG protocol guide
  api/
    chat/route.ts       chat + retrieval
    papers/route.ts     paper library
    compare/route.ts    cross-paper comparison
components/
  chat-message.tsx      citations rendering
  paper-sidebar.tsx     upload + filter
  compare-panel.tsx     paper comparison
lib/supabase/           DB client
scripts/                PDF ingestion pipeline
docs/images/            screenshots + lab photos
```

<br>

<sub>Built at Duke CNRI, for researchers who'd rather do science than paperwork. MIT License.</sub>
