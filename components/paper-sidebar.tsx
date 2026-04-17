"use client"

import { useState } from "react"
import { Paper } from "@/lib/types"
import { Search, FileText, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface PaperSidebarProps {
  papers: Paper[]
  isLoading: boolean
  selectedPaperIds: string[]
  onTogglePaper: (paperId: string) => void
  isOpen: boolean
  onToggle: () => void
}

export function PaperSidebar({
  papers,
  isLoading,
  selectedPaperIds,
  onTogglePaper,
  isOpen,
  onToggle,
}: PaperSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [yearFilter, setYearFilter] = useState<number | null>(null)

  // Get unique years for filtering
  const years = [...new Set(papers.map((p) => p.year).filter(Boolean))].sort(
    (a, b) => (b || 0) - (a || 0)
  )

  // Filter papers
  const filteredPapers = papers.filter((paper) => {
    const matchesSearch =
      !searchQuery ||
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesYear = !yearFilter || paper.year === yearFilter
    return matchesSearch && matchesYear
  })

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-border bg-background transition-transform md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-sans text-lg font-semibold">Papers</h2>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onToggle}
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Year filter */}
          {years.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              <Button
                variant={yearFilter === null ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setYearFilter(null)}
              >
                All
              </Button>
              {years.slice(0, 5).map((year) => (
                <Button
                  key={year}
                  variant={yearFilter === year ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setYearFilter(year === yearFilter ? null : year)}
                >
                  {year}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Paper list */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoading ? (
              <div className="space-y-2 p-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                ))}
              </div>
            ) : filteredPapers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="size-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {papers.length === 0
                    ? "No papers ingested yet"
                    : "No papers match your search"}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredPapers.map((paper) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    isSelected={selectedPaperIds.includes(paper.id)}
                    onToggle={() => onTogglePaper(paper.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Selection summary */}
        {selectedPaperIds.length > 0 && (
          <div className="border-t border-border p-4">
            <p className="text-sm text-muted-foreground">
              {selectedPaperIds.length} paper
              {selectedPaperIds.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        )}
      </aside>

      {/* Toggle button (desktop) */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-80 top-4 z-50 hidden md:flex"
        onClick={onToggle}
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(-320px)",
          transition: "transform 150ms",
        }}
      >
        {isOpen ? (
          <ChevronLeft className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
      </Button>
    </>
  )
}

function PaperCard({
  paper,
  isSelected,
  onToggle,
}: {
  paper: Paper
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-colors",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted"
      )}
    >
      <div className="flex items-start gap-2">
        <div
          className={cn(
            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30"
          )}
        >
          {isSelected && <Check className="size-3" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
            {paper.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {paper.authors}
          </p>
          {paper.year && (
            <p className="mt-0.5 text-xs text-muted-foreground">{paper.year}</p>
          )}
        </div>
      </div>
    </button>
  )
}
