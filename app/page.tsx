import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ContentImage } from "@/components/content-image"
import { ERPFigure } from "@/components/erp-figure"
import { SiteFooter, SiteHeader } from "@/components/site-chrome"

const FEATURES = [
  {
    title: "Ask questions",
    body: "Get answers pulled from your papers, with a citation for every claim.",
  },
  {
    title: "Search by meaning",
    body: "Find the right passage even if it uses different words. Filter by year or paper.",
  },
  {
    title: "Compare papers",
    body: "Pick two or more papers and see how their methods and results differ.",
  },
]

const STEPS = [
  { title: "Upload", body: "Your PDFs are split into sections and indexed." },
  { title: "Search", body: "Your question is matched to the most relevant sections." },
  { title: "Answer", body: "Claude writes an answer from those sections and cites each one." },
]

const GUIDE_SECTIONS = ["Overview", "Preparation", "Cap setup", "Gel application", "Recording", "Cleanup"]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-16 lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-24">
            <div className="lg:col-span-6">
              <h1 className="font-serif text-5xl font-normal leading-[1.05] tracking-tight text-foreground sm:text-6xl">
                Chat with your research papers.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Upload PDFs, ask questions, and get answers that cite the exact paper they came from.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Link
                  href="/chat"
                  className="inline-flex h-11 items-center gap-2 rounded-sm bg-primary px-5 text-[15px] font-medium text-primary-foreground transition-opacity hover:opacity-85"
                >
                  Open NormLit
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/eeg-guide"
                  className="text-[15px] text-foreground underline decoration-foreground/30 underline-offset-[6px] hover:decoration-foreground"
                >
                  EEG guide
                </Link>
              </div>
            </div>

            <figure className="lg:col-span-6 lg:pl-6">
              <div className="rounded-sm border bg-card p-4 sm:p-6">
                <ERPFigure />
              </div>
              <figcaption className="mt-3 text-sm text-muted-foreground">
                Example: the N400 response to sentences that break a social norm.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-14 border-b">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-12 lg:py-24">
            <h2 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl lg:col-span-4">What it does</h2>
            <div className="lg:col-span-8">
              <ul className="divide-y border-y">
                {FEATURES.map((f) => (
                  <li key={f.title} className="py-6">
                    <h3 className="text-lg font-medium">{f.title}</h3>
                    <p className="mt-1 max-w-xl leading-relaxed text-muted-foreground">{f.body}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-12 rounded-sm border bg-card">
                <div className="border-b px-5 py-4 sm:px-7">
                  <p className="text-sm text-muted-foreground">Question</p>
                  <p className="mt-1 text-lg font-medium">What does the N400 measure?</p>
                </div>
                <div className="px-5 py-5 sm:px-7">
                  <p className="text-sm text-muted-foreground">Answer</p>
                  <p className="mt-1 leading-relaxed">
                    The N400 is a brain response that gets bigger when a word is hard to fit into its context{" "}
                    <Cite>Kutas &amp; Federmeier, 2011</Cite>. It was first found using sentences with unexpected
                    endings <Cite>Kutas &amp; Hillyard, 1980</Cite>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-14 border-b bg-card">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-12 lg:py-24">
            <h2 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl lg:col-span-4">How it works</h2>
            <ol className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
              {STEPS.map((step, i) => (
                <li key={step.title} className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">{i + 1}</p>
                  <h3 className="mt-1 text-lg font-medium">{step.title}</h3>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* EEG guide */}
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-12 lg:py-24">
            <div className="lg:col-span-5">
              <h2 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl">EEG guide</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                A step-by-step guide for running EEG sessions on the BioSemi ActiveTwo, from setup to cleanup.
              </p>
              <ul className="mt-8 border-t">
                {GUIDE_SECTIONS.map((item) => (
                  <li key={item} className="border-b py-2.5 text-[15px]">
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/eeg-guide"
                className="mt-8 inline-flex items-center gap-2 text-[15px] font-medium underline decoration-foreground/30 underline-offset-[6px] hover:decoration-foreground"
              >
                Open the guide
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <figure className="lg:col-span-6 lg:col-start-7">
              <div className="relative aspect-square rounded-sm border bg-white">
                <ContentImage mediaKey="eeg1020" fill objectFit="contain" className="absolute inset-0 m-6" />
              </div>
              <figcaption className="mt-3 text-sm text-muted-foreground">
                10-20 electrode layout. Source: Wikimedia Commons.
              </figcaption>
            </figure>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

function Cite({ children }: { children: React.ReactNode }) {
  return <span className="whitespace-nowrap text-[0.9em] text-accent">[{children}]</span>
}
