"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import Link from "next/link"
import { BookOpen, ArrowUp, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatMessage } from "@/components/chat-message"
import { PaperSidebar } from "@/components/paper-sidebar"
import { ComparePanel } from "@/components/compare-panel"
import { usePapers } from "@/hooks/use-papers"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DatabaseSetupAlert } from "@/components/database-setup-alert"
import { Wordmark } from "@/components/site-chrome"

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
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 md:pl-14">
          <div className="flex min-w-0 items-baseline gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="self-center md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Show papers"
            >
              <BookOpen className="size-5" />
            </Button>
            <Link href="/" aria-label="NormLit home">
              <Wordmark className="text-xl" />
            </Link>
            {chatModel && (
              <span className="hidden truncate font-mono text-xs text-muted-foreground sm:inline">{chatModel}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ComparePanel papers={papers} selectedPaperIds={selectedPaperIds} />
            <Link
              href="/eeg-guide"
              className="hidden px-2 text-sm text-muted-foreground hover:text-foreground lg:inline"
            >
              EEG protocol
            </Link>
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
          <div className="mx-auto max-w-3xl px-5 py-8">
            {messages.length === 0 ? (
              <div className="pt-10 sm:pt-16">
                <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">Ask the library.</h1>
                <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
                  Upload PDFs in the panel on the left, then ask a question. Answers come only from your papers,
                  with author and year cited inline.
                  {papers.length === 0 && !papersLoading && (
                    <>
                      {" "}
                      <span className="text-foreground">Start by dropping in a PDF.</span>
                    </>
                  )}
                </p>
                <div className="mt-12">
                  <p className="font-mono text-xs text-muted-foreground">Try asking</p>
                  <ul className="mt-3 border-t">
                    {SUGGESTIONS.map((suggestion) => (
                      <li key={suggestion} className="border-b">
                        <button
                          type="button"
                          onClick={() => submitMessage(suggestion)}
                          disabled={isLoading}
                          className="group flex w-full items-baseline justify-between gap-4 py-3.5 text-left transition-colors hover:text-accent disabled:opacity-50"
                        >
                          <span className="font-serif text-lg">{suggestion}</span>
                          <span className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent">
                            &rarr;
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && status === "submitted" && (
                  <div className="py-6 text-sm text-muted-foreground">
                    Searching papers and drafting an answer <span className="caret" aria-hidden />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 px-4 pb-4 pt-2">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-sm border border-foreground/20 bg-card p-2 transition-colors focus-within:border-foreground/60">
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
                className="shrink-0 rounded-sm"
                aria-label="Send"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </Button>
            </div>
            {selectedPaperIds.length > 0 && (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
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
