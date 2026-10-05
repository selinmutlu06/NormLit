"use client"

import { useState } from "react"
import { Paper } from "@/lib/types"
import { Search, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { PaperUpload } from "@/components/paper-upload"
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
  onPapersChange?: () => void
}

export function PaperSidebar({
  papers,
  isLoading,
  selectedPaperIds,
  onTogglePaper,
  isOpen,
  onToggle,
  onPapersChange,
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
          className="fixed inset-0 z-40 bg-foreground/20 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-border bg-sidebar transition-transform md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-semibold">Papers</h2>
            {!isLoading && papers.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {papers.length}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onToggle}
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>

        <div className="border-b border-border p-4">
          <PaperUpload compact onUploaded={onPapersChange} />
        </div>

        {/* Search */}
        <div className="border-b border-border px-4 pb-3 pt-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search papers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Year filter */}
          {years.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
              <YearTab active={yearFilter === null} onClick={() => setYearFilter(null)}>
                All
              </YearTab>
              {years.slice(0, 5).map((year) => (
                <YearTab
                  key={year}
                  active={yearFilter === year}
                  onClick={() => setYearFilter(year === yearFilter ? null : year)}
                >
                  {year}
                </YearTab>
              ))}
            </div>
          )}
        </div>

        {/* Paper list */}
        <ScrollArea className="flex-1">
          <div>
            {isLoading ? (
              <div className="divide-y">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2 px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                ))}
              </div>
            ) : filteredPapers.length === 0 ? (
              <div className="px-4 py-10">
                <p className="text-sm font-medium text-foreground">
                  {papers.length === 0 ? "No papers yet" : "No matches"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {papers.length === 0
                    ? "Drop a PDF above to build your library"
                    : "Try a different search or year"}
                </p>
              </div>
            ) : (
              <div className="divide-y border-b">
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
          <div className="flex items-baseline gap-2 border-t border-border px-4 py-3 text-sm">
            <span className="text-accent">{selectedPaperIds.length}</span>
            <p className="text-muted-foreground">
              paper{selectedPaperIds.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        )}
      </aside>

      {/* Toggle button (desktop) */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-80 top-2.5 z-50 ml-1 hidden md:flex"
        aria-label={isOpen ? "Hide papers" : "Show papers"}
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
        "relative w-full px-4 py-3 text-left transition-colors",
        isSelected ? "bg-background" : "hover:bg-background/60"
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-[2px] border transition-colors",
            isSelected
              ? "border-accent bg-accent text-accent-foreground"
              : "border-foreground/30"
          )}
        >
          {isSelected && <Check className="size-2.5" strokeWidth={3} />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {paper.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {paper.authors}
            {paper.year ? <span> · {paper.year}</span> : null}
          </p>
        </div>
      </div>
    </button>
  )
}

function YearTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-b py-0.5 transition-colors",
        active ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
