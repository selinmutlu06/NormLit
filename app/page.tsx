import Link from "next/link"
import { ContentImage } from "@/components/content-image"
import {
  ArrowRight,
  BookOpen,
  MessageSquare,
  GitCompare,
  Search,
  Brain,
  Activity,
  FileText,
  Database,
  Zap,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { EEGWaveform, BrainTopoMap, InlineWaveform } from "@/components/eeg-waveform"
import { Reveal } from "@/components/reveal"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-sm transition-transform group-hover:scale-105">
              <Brain className="size-5 text-primary-foreground" />
            </span>
            <span className="font-sans text-xl font-semibold tracking-tight">NormLit</span>
          </Link>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-6 text-sm md:flex">
              <Link href="/eeg-guide" className="text-muted-foreground transition-colors hover:text-foreground">
                EEG Guide
              </Link>
              <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
                Features
              </Link>
              <Link href="#how" className="text-muted-foreground transition-colors hover:text-foreground">
                How it works
              </Link>
            </nav>
            <ThemeToggle />
            <Button asChild className="shadow-sm">
              <Link href="/chat">
                Open App
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div className="aurora" aria-hidden />
          <div className="absolute inset-0 bg-grid-fade opacity-60" aria-hidden />

          <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-32">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-accent" />
                  </span>
                  <span>Built for cognitive neuroscience</span>
                </div>
                <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                  Research literature,
                  <br />
                  <span className="text-gradient">answered with citations</span>
                </h1>
                <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
                  Ask questions across your paper library, compare findings between EEG studies,
                  and get answers grounded in the literature, with every claim traceable to its source.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="glow-accent">
                    <Link href="/chat">
                      Start exploring
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="backdrop-blur-sm">
                    <Link href="#features">View features</Link>
                  </Button>
                </div>
                <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t pt-6">
                  {[
                    { value: "RAG", label: "Grounded answers" },
                    { value: "10-20", label: "EEG protocol" },
                    { value: "pgvector", label: "Semantic search" },
                  ].map(({ value, label }) => (
                    <div key={label}>
                      <dt className="font-mono text-lg font-semibold text-foreground">{value}</dt>
                      <dd className="mt-0.5 text-xs text-muted-foreground">{label}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              {/* Hero visual */}
              <Reveal delay={120}>
                <div className="space-y-4 lg:pl-4">
                  <div className="animate-float">
                    <EEGWaveform channels={4} animated className="shadow-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="card-interactive rounded-xl border bg-card p-3.5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-chart-1" />
                        <span className="font-mono text-xs text-muted-foreground">Your library</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">Upload PDFs to build your corpus</p>
                    </div>
                    <div className="card-interactive rounded-xl border bg-card p-3.5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Database className="size-4 text-chart-2" />
                        <span className="font-mono text-xs text-muted-foreground">Semantic search</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">Cited answers from your papers</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <Reveal className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-2 font-mono text-sm uppercase tracking-wider text-accent">Features</p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Accelerate your research
              </h2>
              <p className="mt-4 text-muted-foreground">
                NormLit grounds every answer in your paper library, providing citations and letting
                you trace claims back to their source.
              </p>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: <MessageSquare className="size-5" />,
                  title: "Chat with papers",
                  description:
                    "Ask questions in natural language and get answers synthesized from your entire library with inline citations.",
                  color: "var(--chart-1)",
                },
                {
                  icon: <Search className="size-5" />,
                  title: "Semantic search",
                  description:
                    "Find relevant passages across all your papers by meaning, not just keywords. Filter by year or specific papers.",
                  color: "var(--chart-2)",
                },
                {
                  icon: <GitCompare className="size-5" />,
                  title: "Compare findings",
                  description:
                    "Select multiple papers and ask the AI to compare methodologies, findings, or highlight contradictions.",
                  color: "var(--chart-3)",
                },
              ].map((card, i) => (
                <Reveal key={card.title} delay={i * 100}>
                  <FeatureCard {...card} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section id="how" className="border-b bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <p className="mb-2 font-mono text-sm uppercase tracking-wider text-accent">How it works</p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  Retrieval-augmented generation
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Every answer is grounded in your actual papers using vector similarity search and
                  semantic embeddings.
                </p>

                <div className="mt-8 space-y-2">
                  <StepItem
                    number="01"
                    title="Ingest & embed"
                    description="PDFs are chunked and converted to vector embeddings using OpenAI, stored in Supabase with pgvector."
                  />
                  <StepItem
                    number="02"
                    title="Semantic retrieval"
                    description="Your questions are embedded and matched against the paper chunks using cosine similarity."
                  />
                  <StepItem
                    number="03"
                    title="Synthesize & cite"
                    description="The model generates answers using retrieved context, with citations to specific papers."
                    last
                  />
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="spotlight-border card-interactive rounded-2xl border bg-card p-6 shadow-lg">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">Electrode montage</span>
                    <span className="font-mono text-xs text-accent">10-20 System</span>
                  </div>
                  <BrainTopoMap className="mx-auto h-48 w-48" />
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                    {[
                      { band: "Delta", hz: "0.5-4", color: "bg-eeg-delta" },
                      { band: "Theta", hz: "4-8", color: "bg-eeg-theta" },
                      { band: "Alpha", hz: "8-13", color: "bg-eeg-alpha" },
                      { band: "Beta", hz: "13-30", color: "bg-eeg-beta" },
                    ].map(({ band, hz, color }) => (
                      <div key={band}>
                        <div className={`mx-auto mb-1 size-3 rounded-full ${color}`} />
                        <p className="font-mono text-xs font-medium text-foreground">{band}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{hz} Hz</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Paper types */}
        <section className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <Reveal className="mb-12 text-center">
              <p className="mb-2 font-mono text-sm uppercase tracking-wider text-accent">Supported research</p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                All your neuroscience literature
              </h2>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "EEG studies", icon: Activity, desc: "Event-related potentials, oscillations, connectivity" },
                { title: "fMRI research", icon: Brain, desc: "BOLD imaging, resting state, task-based" },
                { title: "Behavioral", icon: FileText, desc: "Cognitive tasks, reaction times, accuracy" },
                { title: "Reviews", icon: BookOpen, desc: "Meta-analyses, systematic reviews, theories" },
              ].map(({ title, icon: Icon, desc }, i) => (
                <Reveal key={title} delay={i * 80}>
                  <div className="card-interactive group h-full rounded-xl border bg-card p-5">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* EEG Guide */}
        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <Reveal className="order-2 space-y-4 lg:order-1">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border shadow-lg">
                  <ContentImage mediaKey="eeg1020" fill className="absolute inset-0 bg-muted/30 object-contain p-4" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Zap className="size-4 text-accent" />
                      <span className="font-medium">Interactive protocol guide</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                    <Activity className="size-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">10-20 electrode system</p>
                    <p className="font-mono text-sm font-semibold">Standard EEG montage</p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120} className="order-1 lg:order-2">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  Complete EEG study guide
                </h2>
                <p className="mt-4 text-muted-foreground">
                  A comprehensive, step-by-step protocol for conducting EEG studies with the BioSemi
                  ActiveTwo system. From participant preparation to cleanup.
                </p>

                <ul className="mt-6 space-y-3">
                  {[
                    "Cap setup and electrode placement",
                    "Gel application and impedance checking",
                    "Recording best practices",
                    "Artifact troubleshooting",
                    "Post-session cleanup protocols",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                        <Sparkles className="size-3" />
                      </span>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button asChild size="lg">
                    <Link href="/eeg-guide">
                      View EEG guide
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden">
          <div className="aurora" aria-hidden />
          <div className="absolute inset-0 bg-grid-fade opacity-40" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-28">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Ready to explore your literature?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Start chatting with your papers today. Drop PDFs in the chat sidebar and get cited
                answers powered by Claude Opus 4.8.
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="glow-accent">
                  <Link href="/chat">
                    Open NormLit
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded bg-gradient-to-br from-primary to-accent">
                <Brain className="size-4 text-primary-foreground" />
              </span>
              <span className="text-sm text-muted-foreground">NormLit</span>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              Built for cognitive neuroscience research
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  return (
    <div className="spotlight-border card-interactive h-full rounded-2xl border bg-card p-6">
      <div
        className="flex size-11 items-center justify-center rounded-xl text-accent"
        style={{ backgroundColor: `color-mix(in oklch, ${color} 14%, transparent)`, color }}
      >
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <InlineWaveform color={color} className="mt-4 opacity-60" />
    </div>
  )
}

function StepItem({
  number,
  title,
  description,
  last,
}: {
  number: string
  title: string
  description: string
  last?: boolean
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card font-mono text-sm font-medium text-accent">
          {number}
        </div>
        {!last && <div className="mt-1 w-px flex-1 bg-gradient-to-b from-border to-transparent" />}
      </div>
      <div className="pb-6">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
