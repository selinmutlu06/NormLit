"use client"

import { useState, useEffect, useRef } from "react"
import { Paper } from "@/lib/types"
import { GitCompare, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ComparePanelProps {
  papers: Paper[]
  selectedPaperIds: string[]
}

type ComparisonType = "findings" | "methods" | "contradictions" | "synthesis"

export function ComparePanel({ papers, selectedPaperIds }: ComparePanelProps) {
  const [open, setOpen] = useState(false)
  const [comparisonType, setComparisonType] = useState<ComparisonType>("synthesis")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const selectedPapers = papers.filter((p) => selectedPaperIds.includes(p.id))

  const handleCompare = async () => {
    if (selectedPaperIds.length < 2) return

    setIsLoading(true)
    setResult("")
    setError(null)

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperIds: selectedPaperIds,
          comparisonType,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? "Failed to compare papers")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith("data:")) continue

          const data = trimmed.slice(5).trim()
          if (data === "[DONE]") continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.type === "text-delta" && parsed.delta) {
              fullContent += parsed.delta
              setResult(fullContent)
            } else if (parsed.type === "error") {
              throw new Error(parsed.errorText ?? "Comparison failed")
            }
          } catch (parseError) {
            if (parseError instanceof Error && parseError.message !== "Comparison failed") {
              // ignore malformed SSE lines
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
  }

  useEffect(() => {
    if (!open) {
      setResult("")
      setError(null)
      abortControllerRef.current?.abort()
    }
  }, [open])

  if (selectedPaperIds.length < 2) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <GitCompare className="size-4" />
          <span className="hidden sm:inline">Compare</span>
          <span className="text-xs text-accent">
            {selectedPaperIds.length}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col">
        <DialogHeader>
          <DialogTitle>Compare papers</DialogTitle>
          <DialogDescription>
            Compare the {selectedPaperIds.length} papers you selected.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {selectedPapers.map((paper) => (
            <div
              key={paper.id}
              className="rounded-sm border px-2 py-0.5 text-xs text-muted-foreground"
            >
              {paper.authors.split(",")[0].trim()}
              {paper.year ? `, ${paper.year}` : ""}
            </div>
          ))}
        </div>

        {!result && !isLoading && (
          <div className="grid gap-px overflow-hidden rounded-sm border bg-border sm:grid-cols-2">
            <ComparisonTypeButton
              type="synthesis"
              currentType={comparisonType}
              onSelect={setComparisonType}
              title="Overall synthesis"
              description="Main themes across the papers"
            />
            <ComparisonTypeButton
              type="findings"
              currentType={comparisonType}
              onSelect={setComparisonType}
              title="Findings"
              description="What each paper found"
            />
            <ComparisonTypeButton
              type="methods"
              currentType={comparisonType}
              onSelect={setComparisonType}
              title="Methods"
              description="How each study was run"
            />
            <ComparisonTypeButton
              type="contradictions"
              currentType={comparisonType}
              onSelect={setComparisonType}
              title="Contradictions"
              description="Where the papers disagree"
            />
          </div>
        )}

        {(result || isLoading || error) && (
          <ScrollArea className="min-h-[280px] flex-1 rounded-sm border border-border bg-card p-4">
            {error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {result.split("\n").map((line, i) => (
                  <p key={i} className="mb-2 whitespace-pre-wrap">
                    {line}
                  </p>
                ))}
                {isLoading && (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Comparing…
                  </span>
                )}
              </div>
            )}
          </ScrollArea>
        )}

        <div className="flex justify-end gap-2">
          {isLoading ? (
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 size-4" />
              Cancel
            </Button>
          ) : result ? (
            <Button
              variant="outline"
              onClick={() => {
                setResult("")
                setError(null)
              }}
            >
              New comparison
            </Button>
          ) : (
            <Button onClick={handleCompare} disabled={selectedPaperIds.length < 2}>
              Run comparison
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ComparisonTypeButton({
  type,
  currentType,
  onSelect,
  title,
  description,
}: {
  type: ComparisonType
  currentType: ComparisonType
  onSelect: (type: ComparisonType) => void
  title: string
  description: string
}) {
  const isSelected = type === currentType

  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      aria-pressed={isSelected}
      className={`flex items-start gap-3 p-3 text-left transition-colors ${
        isSelected ? "bg-card" : "bg-background hover:bg-card"
      }`}
    >
      <span
        className={`mt-1 size-3 shrink-0 rounded-full border ${
          isSelected ? "border-accent bg-accent" : "border-foreground/30"
        }`}
        aria-hidden
      />
      <span>
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  )
}
