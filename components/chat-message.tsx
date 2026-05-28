"use client"

import { UIMessage } from "ai"
import { User, Bot } from "lucide-react"
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
    <div
      className={cn(
        "flex gap-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>
      <div
        className={cn(
          "flex-1 space-y-2 overflow-hidden",
          isUser ? "text-right" : "text-left"
        )}
      >
        <div
          className={cn(
            "inline-block max-w-full rounded-2xl px-4 py-3 shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-foreground"
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MessageContent content={textContent || ""} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageContent({ content }: { content: string }) {
  // Simple markdown-like rendering for citations and paragraphs
  const paragraphs = content.split("\n\n").filter(Boolean)

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-2 last:mb-0 whitespace-pre-wrap">
          {renderWithCitations(paragraph)}
        </p>
      ))}
    </>
  )
}

function renderWithCitations(text: string): React.ReactNode[] {
  // Match citations like [Author, Year] or [Author et al., Year]
  const citationRegex = /\[([^\]]+,\s*\d{4})\]/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = citationRegex.exec(text)) !== null) {
    // Add text before the citation
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    // Add the citation with special styling
    parts.push(
      <span
        key={match.index}
        className="rounded bg-accent px-1.5 py-0.5 font-medium text-accent-foreground"
      >
        [{match[1]}]
      </span>
    )
    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}
