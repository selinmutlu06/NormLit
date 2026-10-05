import Link from "next/link"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("text-lg font-semibold leading-none tracking-tight", className)}>NormLit</span>
  )
}

const NAV = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/eeg-guide", label: "EEG guide" },
]

export function SiteHeader({ trail }: { trail?: string }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-baseline gap-3">
          <Link href="/" aria-label="NormLit home">
            <Wordmark />
          </Link>
          {trail && (
            <span className="truncate text-sm text-muted-foreground">
              <span className="mr-3 text-border">/</span>
              {trail}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-5">
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground underline-offset-[6px] transition-colors hover:text-foreground hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          <Link
            href="/chat"
            className="inline-flex h-8 items-center rounded-sm bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85"
          >
            Open app
          </Link>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-baseline sm:justify-between">
        <div className="flex items-baseline gap-3">
          <Wordmark className="text-base text-foreground" />
        </div>
        <nav className="flex gap-6">
          <Link href="/chat" className="hover:text-foreground">Chat</Link>
          <Link href="/eeg-guide" className="hover:text-foreground">EEG guide</Link>
        </nav>
      </div>
    </footer>
  )
}
