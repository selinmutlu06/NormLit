"use client"

import { UIMessage } from "ai"
import { User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: UIMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  // Extract text content from message parts
  const textContent = message.parts
    ?.filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("")

  return (
    <div className={cn("flex gap-3.5", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-primary to-accent text-primary-foreground",
        )}
      >
        {isUser ? <User className="size-4" /> : <Sparkles className="size-4" />}
      </div>
      <div className={cn("flex-1 space-y-2 overflow-hidden", isUser ? "text-right" : "text-left")}>
        <div
          className={cn(
            "inline-block max-w-full rounded-2xl px-4 py-3 text-left shadow-sm",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm border bg-card text-foreground",
          )}
        >
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <MessageContent content={textContent || ""} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageContent({ content }: { content: string }) {
  const blocks = content.split("\n\n").filter(Boolean)

  return (
    <>
      {blocks.map((block, index) => {
        const lines = block.split("\n")
        const isBulletList = lines.every((l) => /^\s*[-*]\s+/.test(l))
        const isNumberList = lines.every((l) => /^\s*\d+\.\s+/.test(l))

        if (isBulletList) {
          return (
            <ul key={index} className="my-2 list-disc space-y-1 pl-5 last:mb-0">
              {lines.map((l, i) => (
                <li key={i}>{renderInline(l.replace(/^\s*[-*]\s+/, ""))}</li>
              ))}
            </ul>
          )
        }
        if (isNumberList) {
          return (
            <ol key={index} className="my-2 list-decimal space-y-1 pl-5 last:mb-0">
              {lines.map((l, i) => (
                <li key={i}>{renderInline(l.replace(/^\s*\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          )
        }
        return (
          <p key={index} className="mb-2 whitespace-pre-wrap last:mb-0">
            {renderInline(block)}
          </p>
        )
      })}
    </>
  )
}

/**
 * Inline renderer for **bold**, `code`, and [Author, Year] citations.
 * Tokenizes on the union of the three patterns so they compose safely.
 */
function renderInline(text: string): React.ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+,\s*\d{4}\])/g
  const segments = text.split(pattern).filter((s) => s !== "")

  return segments.map((seg, i) => {
    if (/^\*\*[^*]+\*\*$/.test(seg)) {
      return (
        <strong key={i} className="font-semibold">
          {seg.slice(2, -2)}
        </strong>
      )
    }
    if (/^`[^`]+`$/.test(seg)) {
      return (
        <code key={i} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
          {seg.slice(1, -1)}
        </code>
      )
    }
    if (/^\[[^\]]+,\s*\d{4}\]$/.test(seg)) {
      return (
        <span
          key={i}
          className="mx-0.5 inline-flex items-center rounded-md bg-accent/15 px-1.5 py-0.5 align-baseline text-[0.8em] font-medium text-accent ring-1 ring-inset ring-accent/25"
        >
          {seg.slice(1, -1)}
        </span>
      )
    }
    return <span key={i}>{seg}</span>
  })
}
