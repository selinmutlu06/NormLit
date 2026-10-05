"use client"

import { UIMessage } from "ai"

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

  if (isUser) {
    return (
      <div className="border-t pb-3 pt-8 first:border-t-0 first:pt-0">
        <p className="whitespace-pre-wrap text-lg font-medium leading-snug">{textContent}</p>
      </div>
    )
  }

  return (
    <div className="pb-8 pt-3 text-[15px] leading-relaxed">
      <MessageContent content={textContent || ""} />
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
        <code key={i} className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {seg.slice(1, -1)}
        </code>
      )
    }
    if (/^\[[^\]]+,\s*\d{4}\]$/.test(seg)) {
      return (
        <span
          key={i}
          className="whitespace-nowrap text-[0.9em] text-accent"
        >
          {seg}
        </span>
      )
    }
    return <span key={i}>{seg}</span>
  })
}
