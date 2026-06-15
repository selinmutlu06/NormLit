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
          <span className="rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">
            {selectedPaperIds.length}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col">
        <DialogHeader>
          <DialogTitle className="font-sans">Compare Papers</DialogTitle>
          <DialogDescription>
            Analyze {selectedPaperIds.length} selected papers with Claude Opus 4.8.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {selectedPapers.map((paper) => (
            <div
              key={paper.id}
              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
            >
              {paper.authors.split(",")[0].trim()}
              {paper.year ? `, ${paper.year}` : ""}
            </div>
          ))}
        </div>

        {!result && !isLoading && (
          <div className="grid grid-cols-2 gap-2">
            <ComparisonTypeButton
              type="synthesis"
              currentType={comparisonType}
              onSelect={setComparisonType}
              title="Overall Synthesis"
              description="Themes, patterns, and relationships"
            />
            <ComparisonTypeButton
              type="findings"
              currentType={comparisonType}
              onSelect={setComparisonType}
              title="Compare Findings"
              description="Results and conclusions"
            />
            <ComparisonTypeButton
              type="methods"
              currentType={comparisonType}
              onSelect={setComparisonType}
              title="Compare Methods"
              description="Methodologies and procedures"
            />
            <ComparisonTypeButton
              type="contradictions"
              currentType={comparisonType}
              onSelect={setComparisonType}
              title="Find Contradictions"
              description="Conflicting results or claims"
            />
          </div>
        )}

        {(result || isLoading || error) && (
          <ScrollArea className="min-h-[280px] flex-1 rounded-lg border border-border bg-muted/30 p-4">
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
                    Analyzing papers…
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
              New Comparison
            </Button>
          ) : (
            <Button onClick={handleCompare} disabled={selectedPaperIds.length < 2}>
              <GitCompare className="mr-2 size-4" />
              Compare Papers
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
      className={`rounded-xl border p-3 text-left transition-all duration-200 ${
        isSelected
          ? "border-accent/50 bg-accent/5 shadow-sm ring-1 ring-accent/20"
          : "border-border hover:-translate-y-0.5 hover:border-accent/30 hover:bg-muted/60 hover:shadow-sm"
      }`}
    >
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </button>
  )
}
