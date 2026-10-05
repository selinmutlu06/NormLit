import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ContentImage } from "@/components/content-image"
import { ERPFigure } from "@/components/erp-figure"
import { SiteFooter, SiteHeader } from "@/components/site-chrome"

const FEATURES = [
  {
    title: "Chat with your papers",
    body: "Ask questions in plain language. Answers are synthesized from the papers you uploaded, with an inline citation for every claim.",
  },
  {
    title: "Search by meaning",
    body: "Find the passage that answers your question even when it uses different words. Narrow by year, author, or a hand-picked set of papers.",
  },
  {
    title: "Compare studies",
    body: "Select two or more papers and lay their methods, results, and contradictions side by side.",
  },
]

const METHOD = [
  {
    title: "Ingest",
    body: "PDFs are parsed, split into overlapping chunks, and embedded.",
    stack: "pdf-parse · OpenAI embeddings",
  },
  {
    title: "Retrieve",
    body: "Your question is embedded and matched against every chunk by cosine similarity.",
    stack: "Supabase · pgvector",
  },
  {
    title: "Answer",
    body: "The model writes from the retrieved passages only, citing author and year as it goes.",
    stack: "Claude",
  },
]

const COVERAGE = [
  { title: "EEG", body: "Event-related potentials, oscillations, connectivity" },
  { title: "fMRI", body: "BOLD imaging, resting state, task-based designs" },
  { title: "Behavioral", body: "Cognitive tasks, reaction times, accuracy" },
  { title: "Reviews", body: "Meta-analyses, systematic reviews, theory" },
]

const PROTOCOL = ["Overview", "Participant preparation", "Cap setup", "Gel application", "Recording", "Cleanup"]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-16 lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-24">
            <div className="lg:col-span-6">
              <p className="text-sm text-muted-foreground">A research assistant for cognitive neuroscience labs</p>
              <h1 className="mt-6 font-serif text-[2.75rem] font-normal leading-[1.04] tracking-[-0.02em] text-foreground sm:text-6xl lg:text-[4.1rem]">
                Ask your library a question. Get an answer you can <em className="text-accent">cite.</em>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
                NormLit reads the papers you upload and answers across all of them, tying each claim back to the
                study it came from. Compare methods, surface contradictions, and keep your EEG protocol one click away.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Link
                  href="/chat"
                  className="group inline-flex h-11 items-center gap-2 rounded-sm bg-primary px-5 text-[15px] font-medium text-primary-foreground transition-opacity hover:opacity-85"
                >
                  Open NormLit
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/eeg-guide"
                  className="text-[15px] text-foreground underline decoration-foreground/30 underline-offset-[6px] transition-colors hover:decoration-accent"
                >
                  Read the EEG protocol
                </Link>
              </div>
            </div>

            <figure className="lg:col-span-6 lg:pl-6">
              <div className="rounded-sm border bg-card p-4 sm:p-6">
                <ERPFigure />
              </div>
              <figcaption className="mt-3 text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Fig. 1.</span> Grand-average ERP at Cz for
                norm-consistent and norm-violating sentences. Illustrative waveform; negative is plotted up.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* 1. Features */}
        <section id="features" className="scroll-mt-14 border-b">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-12 lg:py-28">
            <SectionHeading number="1" title="What it does" className="lg:col-span-4" />
            <div className="lg:col-span-8">
              <ol className="divide-y border-y">
                {FEATURES.map((f, i) => (
                  <li key={f.title} className="grid gap-2 py-7 sm:grid-cols-[3rem_1fr] sm:gap-6">
                    <span className="font-mono text-sm text-muted-foreground">1.{i + 1}</span>
                    <div>
                      <h3 className="font-serif text-2xl font-normal tracking-tight">{f.title}</h3>
                      <p className="mt-2 max-w-xl leading-relaxed text-muted-foreground">{f.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <figure className="mt-14">
                <div className="rounded-sm border bg-card">
                  <div className="border-b px-5 py-4 sm:px-7">
                    <p className="font-mono text-xs text-muted-foreground">Question</p>
                    <p className="mt-1.5 font-serif text-xl">What does the N400 index during sentence comprehension?</p>
                  </div>
                  <div className="px-5 py-5 sm:px-7">
                    <p className="font-mono text-xs text-muted-foreground">Answer</p>
                    <p className="mt-1.5 leading-relaxed">
                      Most accounts treat the N400 as a marker of meaning access: its amplitude grows when a word is
                      harder to integrate with the preceding context <Cite>Kutas &amp; Federmeier, 2011</Cite>. In the
                      original work, semantically anomalous sentence endings produced a larger negativity peaking near
                      400 ms than expected endings <Cite>Kutas &amp; Hillyard, 1980</Cite>.
                    </p>
                  </div>
                </div>
                <figcaption className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Fig. 2.</span> An answer with inline citations.
                  Illustrative example.
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 2. Method */}
        <section id="method" className="scroll-mt-14 border-b bg-card">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-12 lg:py-28">
            <div className="lg:col-span-4">
              <SectionHeading number="2" title="Method" />
              <p className="mt-5 max-w-sm leading-relaxed text-muted-foreground">
                Retrieval-augmented generation. The model only sees passages pulled from your library, so every
                answer can be traced to a source.
              </p>
            </div>
            <ol className="lg:col-span-8">
              {METHOD.map((step, i) => (
                <li
                  key={step.title}
                  className="grid gap-2 border-t py-7 last:border-b sm:grid-cols-[3rem_1fr_auto] sm:items-baseline sm:gap-6"
                >
                  <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
                  <div>
                    <h3 className="font-serif text-2xl font-normal tracking-tight">{step.title}</h3>
                    <p className="mt-2 max-w-md leading-relaxed text-muted-foreground">{step.body}</p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground sm:text-right">{step.stack}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 3. Coverage */}
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-12 lg:py-28">
            <SectionHeading number="3" title="Built for the literature you read" className="lg:col-span-4" />
            <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-8">
              {COVERAGE.map((c) => (
                <div key={c.title} className="border-t pt-4">
                  <dt className="font-serif text-2xl tracking-tight">{c.title}</dt>
                  <dd className="mt-1.5 text-muted-foreground">{c.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 4. EEG protocol */}
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-12 lg:py-28">
            <div className="lg:col-span-5">
              <SectionHeading number="4" title="The EEG protocol, written down" />
              <p className="mt-5 leading-relaxed text-muted-foreground">
                A step-by-step guide to running a session on the BioSemi ActiveTwo, condensed from a hundred-page lab
                packet. Check off steps as you go.
              </p>
              <ol className="mt-8 border-t">
                {PROTOCOL.map((item, i) => (
                  <li key={item} className="flex items-baseline gap-4 border-b py-2.5 text-[15px]">
                    <span className="w-6 font-mono text-xs text-muted-foreground">{toRoman(i + 1)}</span>
                    {item}
                  </li>
                ))}
              </ol>
              <Link
                href="/eeg-guide"
                className="group mt-8 inline-flex items-center gap-2 text-[15px] font-medium underline decoration-foreground/30 underline-offset-[6px] hover:decoration-accent"
              >
                Open the protocol
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <figure className="lg:col-span-6 lg:col-start-7">
              <div className="relative aspect-square rounded-sm border bg-white">
                <ContentImage mediaKey="eeg1020" fill objectFit="contain" className="absolute inset-0 m-6" />
              </div>
              <figcaption className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Fig. 3.</span> The international 10–20 electrode
                system. Wikimedia Commons, public domain.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Closing */}
        <section>
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20 sm:flex-row sm:items-end sm:justify-between lg:py-24">
            <h2 className="max-w-xl font-serif text-4xl font-normal leading-tight tracking-tight sm:text-5xl">
              Start with one paper.
            </h2>
            <Link
              href="/chat"
              className="group inline-flex h-11 w-fit items-center gap-2 rounded-sm bg-primary px-5 text-[15px] font-medium text-primary-foreground transition-opacity hover:opacity-85"
            >
              Upload a PDF
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

function SectionHeading({ number, title, className }: { number: string; title: string; className?: string }) {
  return (
    <div className={className}>
      <div className="rule-lead pt-4">
        <span className="font-mono text-xs text-muted-foreground">§{number}</span>
      </div>
      <h2 className="mt-3 font-serif text-3xl font-normal leading-tight tracking-tight sm:text-4xl">{title}</h2>
    </div>
  )
}

function Cite({ children }: { children: React.ReactNode }) {
  return <span className="whitespace-nowrap text-[0.9em] text-accent">[{children}]</span>
}

function toRoman(n: number) {
  return ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][n - 1]
}
