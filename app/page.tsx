import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BookOpen, MessageSquare, GitCompare, Search, Brain, Activity, FileText, Database, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { EEGWaveform, BrainTopoMap, InlineWaveform } from "@/components/eeg-waveform"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded bg-primary">
              <Brain className="size-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-semibold">NormLit</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/eeg-guide" className="text-muted-foreground hover:text-foreground transition-colors">
                EEG Guide
              </Link>
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
            </nav>
            <ThemeToggle />
            <Button asChild>
              <Link href="/chat">
                Open App
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative overflow-hidden border-b border-border">
          {/* Background grid */}
          <div className="absolute inset-0 bg-grid opacity-50" />
          
          <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground mb-6">
                  <Activity className="size-3.5" />
                  <span>Built for Cognitive Neuroscience</span>
                </div>
                <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
                  Research Literature
                  <br />
                  <span className="text-accent">Intelligence</span>
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty max-w-lg">
                  Ask questions across your paper library, compare findings between EEG studies, 
                  and get cited answers grounded in the literature.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href="/chat">
                      Start Exploring
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="#features">
                      View Features
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Hero visual - EEG + Stats */}
              <div className="relative lg:pl-8">
                <EEGWaveform channels={4} animated className="shadow-lg" />
                
                {/* Floating stat cards */}
                <div className="absolute -left-4 top-1/4 rounded-lg border border-border bg-card p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-chart-1" />
                    <span className="font-mono text-xs text-muted-foreground">Papers</span>
                  </div>
                  <p className="font-serif text-2xl font-bold text-foreground">247</p>
                </div>
                
                <div className="absolute -right-2 bottom-1/4 rounded-lg border border-border bg-card p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Database className="size-4 text-chart-2" />
                    <span className="font-mono text-xs text-muted-foreground">Embeddings</span>
                  </div>
                  <p className="font-serif text-2xl font-bold text-foreground">12.4k</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
            <div className="text-center mb-16">
              <p className="font-mono text-sm text-accent uppercase tracking-wider mb-2">Features</p>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Accelerate Your Research
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                NormLit uses RAG to ground every answer in your paper library, providing 
                citations and letting you trace claims back to their source.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={<MessageSquare className="size-5" />}
                title="Chat with Papers"
                description="Ask questions in natural language and get answers synthesized from your entire paper library with inline citations."
                visual={<InlineWaveform color="var(--chart-1)" className="mt-4 opacity-60" />}
              />
              <FeatureCard
                icon={<Search className="size-5" />}
                title="Semantic Search"
                description="Find relevant passages across all your papers using meaning, not just keywords. Filter by year or specific papers."
                visual={<InlineWaveform color="var(--chart-2)" className="mt-4 opacity-60" />}
              />
              <FeatureCard
                icon={<GitCompare className="size-5" />}
                title="Compare Findings"
                description="Select multiple papers and ask the AI to compare methodologies, findings, or highlight contradictions."
                visual={<InlineWaveform color="var(--chart-3)" className="mt-4 opacity-60" />}
              />
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <p className="font-mono text-sm text-accent uppercase tracking-wider mb-2">How It Works</p>
                <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  Retrieval-Augmented Generation
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Every answer is grounded in your actual papers using vector similarity search 
                  and semantic embeddings.
                </p>
                
                <div className="mt-8 space-y-6">
                  <StepItem
                    number="01"
                    title="Ingest & Embed"
                    description="PDFs are chunked and converted to vector embeddings using OpenAI, stored in Supabase with pgvector."
                  />
                  <StepItem
                    number="02"
                    title="Semantic Retrieval"
                    description="Your questions are embedded and matched against the paper chunks using cosine similarity."
                  />
                  <StepItem
                    number="03"
                    title="Synthesize & Cite"
                    description="The LLM generates answers using retrieved context, with citations to specific papers."
                  />
                </div>
              </div>
              
              <div className="relative">
                <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs text-muted-foreground">Electrode Montage</span>
                    <span className="font-mono text-xs text-accent">10-20 System</span>
                  </div>
                  <BrainTopoMap className="w-48 h-48 mx-auto" />
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                    {[
                      { band: "Delta", hz: "0.5-4", color: "bg-eeg-delta" },
                      { band: "Theta", hz: "4-8", color: "bg-eeg-theta" },
                      { band: "Alpha", hz: "8-13", color: "bg-eeg-alpha" },
                      { band: "Beta", hz: "13-30", color: "bg-eeg-beta" },
                    ].map(({ band, hz, color }) => (
                      <div key={band} className="text-center">
                        <div className={`size-3 rounded-full mx-auto mb-1 ${color}`} />
                        <p className="font-mono text-xs font-medium text-foreground">{band}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{hz} Hz</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Paper Types Section */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
            <div className="text-center mb-12">
              <p className="font-mono text-sm text-accent uppercase tracking-wider mb-2">Supported Research</p>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                All Your Neuroscience Literature
              </h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "EEG Studies", icon: Activity, desc: "Event-related potentials, oscillations, connectivity" },
                { title: "fMRI Research", icon: Brain, desc: "BOLD imaging, resting state, task-based" },
                { title: "Behavioral", icon: FileText, desc: "Cognitive tasks, reaction times, accuracy" },
                { title: "Reviews", icon: BookOpen, desc: "Meta-analyses, systematic reviews, theories" },
              ].map(({ title, icon: Icon, desc }) => (
                <div key={title} className="rounded-lg border border-border bg-card p-4 hover:border-accent/50 transition-colors">
                  <Icon className="size-5 text-accent mb-3" />
                  <h3 className="font-serif font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EEG Guide Section */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border shadow-lg">
                  <Image
                    src="/images/research-lab.jpg"
                    alt="Neuroscience research laboratory with EEG equipment"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Zap className="size-4 text-accent" />
                      <span className="font-medium">Interactive Protocol Guide</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 rounded-lg border border-border bg-card p-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Activity className="size-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">BioSemi</p>
                      <p className="font-mono text-sm font-semibold">64 ch</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm text-accent mb-4">
                  <Zap className="size-3.5" />
                  <span>New Feature</span>
                </div>
                <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  Complete EEG Study Guide
                </h2>
                <p className="mt-4 text-muted-foreground">
                  A comprehensive, step-by-step protocol for conducting EEG studies with the 
                  BioSemi ActiveTwo system. From participant preparation to cleanup.
                </p>
                
                <div className="mt-6 space-y-3">
                  {[
                    "Cap setup and electrode placement",
                    "Gel application and impedance checking",
                    "Recording best practices",
                    "Artifact troubleshooting",
                    "Post-session cleanup protocols",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-accent" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <Button asChild size="lg">
                    <Link href="/eeg-guide">
                      View EEG Guide
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl text-balance">
                Ready to Explore Your Literature?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Start chatting with your papers today. Upload your PDFs and let AI help you 
                navigate your research library.
              </p>
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link href="/chat">
                    Open NormLit
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-6 rounded bg-primary">
                <Brain className="size-4 text-primary-foreground" />
              </div>
              <span className="font-serif text-sm text-muted-foreground">NormLit</span>
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
  visual,
}: {
  icon: React.ReactNode
  title: string
  description: string
  visual?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 hover:border-accent/50 transition-colors">
      <div className="flex size-10 items-center justify-center rounded bg-accent/10 text-accent">
        {icon}
      </div>
      <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      {visual}
    </div>
  )
}

function StepItem({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 flex items-center justify-center size-10 rounded border border-border bg-card font-mono text-sm font-medium text-muted-foreground">
        {number}
      </div>
      <div>
        <h3 className="font-serif font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
