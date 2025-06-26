"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle, Copy, FileText, Check, Settings, ChevronUp, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Doc {
  pageContent?: string
  metadata?: {
    loc?: {
      pageNumber?: number
    }
    source?: string
  }
}

interface Message {
  id: string
  role: "assistant" | "user"
  content: string
  documents?: Doc[]
  timestamp: Date
  isStreaming?: boolean
}

interface StreamingState {
  isActive: boolean
  content: string
  messageId: string
}

interface ModelInfo {
  model: string
  modelName: string
  provider: string
  cost: string
}

interface AvailableModels {
  [key: string]: {
    name: string
    provider: string
    cost: string
    description: string
  }
}

const ChatComponent: React.FC = () => {
  const [input, setInput] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isActive: false,
    content: "",
    messageId: "",
  })
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>("deepseek/deepseek-r1-0528:free")
  const [availableModels, setAvailableModels] = useState<AvailableModels>({})
  const [currentModelInfo, setCurrentModelInfo] = useState<ModelInfo | null>(null)
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const STORAGE_KEY = "chat_messages"
  const MAX_MESSAGES = 20

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingState, scrollToBottom])

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const validateInput = (text: string): string | null => {
    if (!text.trim()) return "Message cannot be empty"
    if (text.length > 4000) return "Message too long (max 4000 characters)"
    return null
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      toast.success("Message copied to clipboard!")

      // Reset the icon after 1 second
      setTimeout(() => {
        setCopiedMessageId(null)
      }, 1000)
    } catch (err) {
      console.error("Failed to copy text:", err)
      toast.error("Failed to copy message")
    }
  }

  const saveMessages = useCallback((messages: Message[]) => {
    try {
      const messagesToSave = messages.slice(-MAX_MESSAGES)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToSave))
    } catch (err) {
      console.error("Failed to save messages:", err)
      toast.error("Failed to save chat history")
    }
  }, [])

  const clearMessages = () => {
    if (window.confirm("Are you sure you want to clear all chat history?")) {
      setMessages([])
      localStorage.removeItem(STORAGE_KEY)
      toast.success("Chat history cleared")
    }
  }

  const handleSendMessage = async () => {
    const trimmedInput = input.trim()
    const validationError = validateInput(trimmedInput)

    if (validationError) {
      setError(validationError)
      return
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setLoading(true)
    setError(null)
    setCurrentModelInfo(null)

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: trimmedInput,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedInput,
          conversationHistory: messages.slice(-10).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          model: selectedModel,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      // Streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body available")
      }

      const assistantMessageId = generateMessageId()
      let fullContent = ""
      let documents: Doc[] = []

      // Initialize streaming state
      setStreamingState({
        isActive: true,
        content: "",
        messageId: assistantMessageId,
      })

      while (true) {
        // Read the response chunk by chunk
        const { done, value } = await reader.read()
        if (done) break

        // Convert bytes to text
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.slice(6))

              // Handle different types of streaming data
              switch (parsed.type) {
                case "stream":
                  if (parsed.content) {
                    fullContent += parsed.content
                    setStreamingState((prev) => ({
                      ...prev,
                      content: fullContent,
                    }))
                    // Save streaming message for crash recovery
                    const streamingMsg: Message = {
                      id: assistantMessageId,
                      role: "assistant",
                      content: fullContent,
                      documents,
                      timestamp: new Date(),
                      isStreaming: true,
                    }
                    saveMessages([...messages, streamingMsg])
                  }
                  break

                case "docs":
                  if (parsed.documents) {
                    documents = parsed.documents
                  }
                  break

                case "model_info":
                  setCurrentModelInfo(parsed)
                  break

                case "done":
                  const assistantMessage: Message = {
                    id: assistantMessageId,
                    role: "assistant",
                    content: fullContent,
                    documents,
                    timestamp: new Date(),
                  }
                  setMessages((prev) => [...prev, assistantMessage])
                  setStreamingState({ isActive: false, content: "", messageId: "" })
                  saveMessages([...messages, assistantMessage])
                  return

                case "error":
                  throw new Error(parsed.error || "Unknown server error")

                default:
                  console.warn("Unknown message type:", parsed.type)
              }
            } catch (parseError) {
              // Ignore parsing errors for incomplete chunks
              console.debug("Parse error (likely incomplete chunk):", parseError)
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Request was aborted")
        return
      }

      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
      setStreamingState({ isActive: false, content: "", messageId: "" })
      abortControllerRef.current = null
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem(STORAGE_KEY)
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages)
        const messagesWithDates = parsed.map((msg: Omit<Message, 'timestamp'> & { timestamp: string }) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(messagesWithDates)
      }
    } catch (err) {
      console.error("Failed to load messages:", err)
      toast.error("Failed to load chat history")
    }
  }, [])

  useEffect(() => {
    saveMessages(messages)
  }, [messages, saveMessages])

  // Load available models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/models`)
        if (response.ok) {
          const data = await response.json()
          setAvailableModels(data.models)
          setSelectedModel(data.default)
        }
      } catch (err) {
        console.error("Failed to load models:", err)
      }
    }
    loadModels()
  }, [])

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PDF Chat Assistant</h1>
          <p className="text-gray-600">Ask questions about your PDF documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-500" />
          <Select value={selectedModel} onValueChange={setSelectedModel} disabled={loading}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(availableModels).map(([modelId, modelInfo]) => (
                <SelectItem key={modelId} value={modelId}>
                  <div className="flex flex-col">
                    <span className="font-medium">{modelInfo.name}</span>
                    <span className="text-xs text-gray-500">
                      {modelInfo.provider} • {modelInfo.cost}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Model info display */}
      {currentModelInfo && (
        <Card className="mb-4 p-3 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 text-blue-700">
            <span className="text-sm font-medium">
              Using: {currentModelInfo.modelName} ({currentModelInfo.provider})
            </span>
            <span className={`text-xs px-2 py-1 rounded ${currentModelInfo.cost === 'free'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
              }`}>
              {currentModelInfo.cost}
            </span>
          </div>
        </Card>
      )}

      {/* Messages container */}
      <div className="flex-grow mb-4 overflow-y-auto pr-2 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" aria-hidden="true" />
            <p>Start a conversation by asking a question about your PDF documents.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-2xl rounded-lg px-4 py-3 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900 border"
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="prose prose-sm max-w-none text-current">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={copiedMessageId === msg.id ? "Copied!" : "Copy message"}
                  className={`h-6 w-6 p-0 flex-shrink-0 ${msg.role === "user" ? "text-white hover:bg-blue-700" : "text-gray-500 hover:bg-gray-200"
                    }`}
                  onClick={() => copyToClipboard(msg.content, msg.id)}
                  title={copiedMessageId === msg.id ? "Copied!" : "Copy message"}
                >
                  {copiedMessageId === msg.id ? (
                    <Check className="w-3 h-3" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3 h-3" aria-hidden="true" />
                  )}
                </Button>
              </div>

              <div className={`text-xs mt-2 ${msg.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                {msg.timestamp.toLocaleTimeString()}
              </div>

              {/* Collapsible documents section */}
              {msg.documents && msg.documents.length > 0 && (
                <Collapsible
                  open={openCollapsibles[msg.id] || false}
                  onOpenChange={(isOpen: boolean) =>
                    setOpenCollapsibles((prev) => ({ ...prev, [msg.id]: isOpen }))
                  }
                  className="mt-2 pt-2 border-t border-gray-300"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between items-center text-xs p-1 h-auto"
                    >
                      <span>Sources ({msg.documents.length})</span>
                      {openCollapsibles[msg.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
                    <div className="space-y-1 mt-2">
                      {msg.documents.map((doc, idx) => (
                        <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                          {doc.metadata?.source && (
                            <div className="font-medium">
                              Page {doc.metadata.loc?.pageNumber || "Unknown"}
                            </div>
                          )}
                          <div className="text-gray-600 truncate">
                            {doc.pageContent?.substring(0, 100)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {streamingState.isActive && (
          <div className="flex justify-start">
            <div className="max-w-2xl bg-gray-100 text-gray-900 border rounded-lg px-4 py-3">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {`${streamingState.content}▋`}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loading && !streamingState.isActive && (
          <div className="flex justify-start">
            <div className="bg-gray-100 border rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" aria-label="Loading" />
                <span className="text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <Card className="mb-4 p-3 bg-red-50 border-red-200" role="alert">
          <div className="flex items-start gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <strong className="font-medium">Error: </strong>
              <span>{error}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Input area */}
      <div className="space-y-2">
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your PDF documents..."
              disabled={loading}
              maxLength={4000}
              className="min-h-[44px]"
              aria-label="Chat input"
            />
          </div>

          {loading ? (
            <Button
              onClick={handleStop}
              variant="outline"
              className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 h-[44px]"
              aria-label="Stop streaming"
            >
              Stop
            </Button>
          ) : (
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 h-[44px]"
              aria-label="Send message"
            >
              Send
            </Button>
          )}
          <Button
            onClick={clearMessages}
            variant="ghost"
            className="text-gray-500 hover:bg-gray-200 h-[44px]"
            aria-label="Clear chat history"
          >
            Clear
          </Button>
        </div>
        <div className="text-xs text-gray-500">{input.length}/4000 characters</div>
      </div>
    </div>
  )
}

export default ChatComponent
