import Link from "next/link"
import { ArrowRight, BookOpen, MessageSquare, GitCompare, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="size-6 text-foreground" />
            <span className="font-serif text-xl font-semibold">NormLit</span>
          </div>
          <div className="flex items-center gap-4">
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
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
              Your Research Literature Assistant
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl text-pretty">
              Ask questions across your paper library, compare findings between studies, 
              and get cited answers grounded in the literature. Built for cognitive 
              neuroscience labs.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/chat">
                  Start Chatting
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="#features">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Accelerate Your Research
              </h2>
              <p className="mt-4 text-muted-foreground">
                NormLit uses RAG to ground every answer in your paper library, providing 
                citations and letting you trace claims back to their source.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon={<MessageSquare className="size-6" />}
                title="Chat with Your Papers"
                description="Ask questions in natural language and get answers synthesized from your entire paper library with inline citations."
              />
              <FeatureCard
                icon={<Search className="size-6" />}
                title="Semantic Search"
                description="Find relevant passages across all your papers using meaning, not just keywords. Filter by year, author, or specific papers."
              />
              <FeatureCard
                icon={<GitCompare className="size-6" />}
                title="Compare Findings"
                description="Select multiple papers and ask the AI to compare methodologies, findings, or highlight contradictions."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                How It Works
              </h2>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <StepCard
                step="01"
                title="Ingest Papers"
                description="Run the ingestion script to chunk your PDFs and create embeddings stored in Supabase with pgvector."
              />
              <StepCard
                step="02"
                title="Ask Questions"
                description="Chat naturally about your papers. The RAG system retrieves relevant chunks and the LLM synthesizes answers."
              />
              <StepCard
                step="03"
                title="Cite & Compare"
                description="Every answer includes citations. Select papers in the sidebar to compare specific findings."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl text-balance">
                Ready to Explore Your Literature?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Start chatting with your papers today. No complex setup required.
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
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-muted-foreground" />
              <span className="font-serif text-sm text-muted-foreground">NormLit</span>
            </div>
            <p className="text-sm text-muted-foreground">
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
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-foreground">
        {icon}
      </div>
      <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string
  title: string
  description: string
}) {
  return (
    <div className="relative">
      <div className="font-mono text-5xl font-bold text-muted-foreground/20">{step}</div>
      <h3 className="mt-2 font-serif text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
