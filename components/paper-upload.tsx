"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface UploadResult {
  filename: string
  paperId?: string
  title?: string
  chunkCount?: number
  error?: string
}

interface PaperUploadProps {
  onUploaded?: () => void
  compact?: boolean
}

export function PaperUpload({ onUploaded, compact = false }: PaperUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [results, setResults] = useState<UploadResult[] | null>(null)

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((f) =>
        f.name.toLowerCase().endsWith(".pdf"),
      )

      if (files.length === 0) {
        setResults([{ filename: "files", error: "Please drop PDF files only." }])
        return
      }

      setIsUploading(true)
      setResults(null)

      const formData = new FormData()
      files.forEach((file) => formData.append("files", file))

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          setResults([
            {
              filename: "upload",
              error: data.error ?? "Upload failed. Check your API keys and database.",
            },
          ])
          return
        }

        setResults(data.results as UploadResult[])
        const anySuccess = (data.results as UploadResult[]).some((r) => r.paperId)
        if (anySuccess) {
          onUploaded?.()
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Network error during upload."
        setResults([
          {
            filename: "upload",
            error: `${message} If this persists, check database setup in the banner above.`,
          },
        ])
      } finally {
        setIsUploading(false)
      }
    },
    [onUploaded],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (isUploading) return
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files)
      }
    },
    [isUploading, uploadFiles],
  )

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={onDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-lg border-2 border-dashed transition-colors",
          compact ? "p-3" : "p-5",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
          isUploading && "pointer-events-none opacity-70",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              uploadFiles(e.target.files)
              e.target.value = ""
            }
          }}
        />

        <div className="flex flex-col items-center text-center">
          {isUploading ? (
            <Loader2 className="size-8 animate-spin text-primary" />
          ) : (
            <Upload className="size-8 text-muted-foreground" />
          )}
          <p className={cn("mt-2 font-medium text-foreground", compact && "text-sm")}>
            {isUploading ? "Processing PDFs…" : "Drop PDFs here"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse · up to 25 MB each
          </p>
          {!compact && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Tip: name files like{" "}
              <span className="font-mono">Smith (2023) - Title.pdf</span>
            </p>
          )}
        </div>
      </div>

      {results && results.length > 0 && (
        <ul className="space-y-1.5">
          {results.map((result) => (
            <li
              key={`${result.filename}-${result.paperId ?? result.error}`}
              className="flex items-start gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-xs"
            >
              {result.paperId ? (
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-chart-5" />
              ) : (
                <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{result.filename}</p>
                {result.paperId ? (
                  <p className="text-muted-foreground">
                    {result.title} · {result.chunkCount} chunks indexed
                  </p>
                ) : (
                  <p className="text-destructive">{result.error}</p>
                )}
              </div>
            </li>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-full text-xs"
            onClick={() => setResults(null)}
          >
            Dismiss
          </Button>
        </ul>
      )}

      {!compact && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <FileText className="size-3" />
          <span>Embeddings use OpenAI; chat uses Claude Opus 4.7 when configured.</span>
        </div>
      )}
    </div>
  )
}
