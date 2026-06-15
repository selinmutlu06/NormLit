"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import Link from "next/link"
import { BookOpen, Send, ArrowLeft, Loader2, AlertCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatMessage } from "@/components/chat-message"
import { PaperSidebar } from "@/components/paper-sidebar"
import { ComparePanel } from "@/components/compare-panel"
import { usePapers } from "@/hooks/use-papers"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DatabaseSetupAlert } from "@/components/database-setup-alert"

const SUGGESTIONS = [
  "What are the main findings across these papers?",
  "Compare the methodologies used in these studies",
  "What gaps in the literature do these papers identify?",
]

export default function ChatPage() {
  const [input, setInput] = useState("")
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([])
  // Closed by default so mobile lands on the chat, not the papers drawer.
  // Opened on desktop after mount (where the sidebar is a docked panel).
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatModel, setChatModel] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const selectedPaperIdsRef = useRef(selectedPaperIds)

  selectedPaperIdsRef.current = selectedPaperIds

  const { papers, isLoading: papersLoading, error: papersError, mutate } = usePapers()

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: {
            messages,
            id,
            selectedPaperIds: selectedPaperIdsRef.current,
          },
        }),
      }),
    [],
  )

  const { messages, sendMessage, status, error: chatError } = useChat({
    transport,
  })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setSidebarOpen(true)
    }
  }, [])

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setChatModel(data.chatModel ?? null))
      .catch(() => setChatModel(null))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const submitMessage = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    sendMessage({ text: trimmed })
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitMessage(input)
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
        : [...prev, paperId],
    )
  }

  const configError = papersError?.message

  return (
    <div className="flex h-screen bg-background">
      <PaperSidebar
        papers={papers}
        isLoading={papersLoading}
        selectedPaperIds={selectedPaperIds}
        onTogglePaper={togglePaper}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onPapersChange={() => mutate()}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-card/50 px-4 py-3 backdrop-blur-sm">
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
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent">
                <BookOpen className="size-3.5 text-primary-foreground" />
              </span>
              <span className="font-sans text-lg font-semibold tracking-tight">NormLit</span>
            </div>
            {chatModel && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Sparkles className="size-3" />
                {chatModel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ComparePanel papers={papers} selectedPaperIds={selectedPaperIds} />
            <ThemeToggle />
          </div>
        </header>

        {(configError || chatError) && (
          <div className="shrink-0 border-b border-border px-4 py-3">
            {configError?.includes("schema") || configError?.includes("papers") ? (
              <DatabaseSetupAlert message={configError} />
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>
                  {chatError?.message ?? configError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                  <span className="absolute inset-0 rounded-2xl bg-accent/30 blur-xl" aria-hidden />
                  <BookOpen className="relative size-8 text-primary-foreground" />
                </div>
                <h2 className="mt-6 font-sans text-2xl font-semibold tracking-tight text-foreground">
                  Research chat
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Upload PDFs in the sidebar, then ask questions. Answers are grounded
                  in your library with citations.
                  {papers.length === 0 && !papersLoading && (
                    <>
                      {" "}
                      <strong className="text-foreground">Start by dropping a PDF</strong>{" "}
                      in the left panel.
                    </>
                  )}
                </p>
                <div className="mt-8 flex w-full max-w-lg flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <SuggestionChip
                      key={suggestion}
                      onClick={() => submitMessage(suggestion)}
                      disabled={isLoading}
                    >
                      {suggestion}
                    </SuggestionChip>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-sm">
                      <Sparkles className="size-4 text-primary-foreground" />
                    </div>
                    <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3.5 text-muted-foreground shadow-sm">
                      <span className="flex gap-1">
                        <span className="thinking-dot size-1.5 rounded-full bg-accent" style={{ animationDelay: "0ms" }} />
                        <span className="thinking-dot size-1.5 rounded-full bg-accent" style={{ animationDelay: "150ms" }} />
                        <span className="thinking-dot size-1.5 rounded-full bg-accent" style={{ animationDelay: "300ms" }} />
                      </span>
                      <span className="text-sm">Searching papers and drafting answer…</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-card/30 p-4 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2 shadow-sm">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  papers.length === 0
                    ? "Upload papers first, then ask a question…"
                    : "Ask about your papers…"
                }
                className="min-h-[44px] max-h-[200px] flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                disabled={isLoading}
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="shrink-0 rounded-lg"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
            {selectedPaperIds.length > 0 && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Focused on {selectedPaperIds.length} selected paper
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
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-border bg-card px-4 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground disabled:opacity-50"
    >
      {children}
    </button>
  )
}
