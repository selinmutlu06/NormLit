"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import Link from "next/link"
import { BookOpen, Send, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatMessage } from "@/components/chat-message"
import { PaperSidebar } from "@/components/paper-sidebar"
import { ComparePanel } from "@/components/compare-panel"
import { usePapers } from "@/hooks/use-papers"

export default function ChatPage() {
  const [input, setInput] = useState("")
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { papers, isLoading: papersLoading } = usePapers()

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          messages,
          id,
          selectedPaperIds,
        },
      }),
    }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const togglePaper = (paperId: string) => {
    setSelectedPaperIds((prev) =>
      prev.includes(paperId)
        ? prev.filter((id) => id !== paperId)
        : [...prev, paperId]
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <PaperSidebar
        papers={papers}
        isLoading={papersLoading}
        selectedPaperIds={selectedPaperIds}
        onTogglePaper={togglePaper}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <BookOpen className="size-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Back</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-foreground" />
            <span className="font-sans text-lg font-semibold">NormLit</span>
          </div>
          <div className="flex items-center gap-2">
            <ComparePanel papers={papers} selectedPaperIds={selectedPaperIds} />
            <ThemeToggle />
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="size-12 text-muted-foreground/50" />
                <h2 className="mt-4 font-sans text-xl font-semibold text-foreground">
                  Start a Conversation
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Ask questions about your papers. Select specific papers in the
                  sidebar to focus your search, or leave them unselected to
                  search across all papers.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <SuggestionChip
                    onClick={() => {
                      setInput("What are the main findings across these papers?")
                    }}
                  >
                    Main findings overview
                  </SuggestionChip>
                  <SuggestionChip
                    onClick={() => {
                      setInput("Compare the methodologies used in these studies")
                    }}
                  >
                    Compare methodologies
                  </SuggestionChip>
                  <SuggestionChip
                    onClick={() => {
                      setInput("What gaps in the literature do these papers identify?")
                    }}
                  >
                    Literature gaps
                  </SuggestionChip>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm">Searching papers...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background p-4">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            <div className="relative flex items-end gap-2">
              <div className="relative flex-1">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your papers..."
                  className="min-h-[44px] max-h-[200px] resize-none pr-12"
                  disabled={isLoading}
                  rows={1}
                />
              </div>
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
            {selectedPaperIds.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Searching {selectedPaperIds.length} selected paper
                {selectedPaperIds.length !== 1 ? "s" : ""}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

function SuggestionChip({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  )
}
