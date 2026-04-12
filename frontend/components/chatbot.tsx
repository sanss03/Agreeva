"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  Calculator,
  FileText,
  AlertTriangle,
  Volume2,
  Mic,
} from "lucide-react"
import { SpeakButton } from "@/components/ui/speak-button"
import { useTTS } from "@/hooks/useTTS"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const quickQuestions = [
  { icon: Calculator, text: "What is my EMI?" },
  { icon: FileText, text: "Explain this agreement" },
  { icon: AlertTriangle, text: "What are the risks?" },
  { icon: HelpCircle, text: "What is interest rate?" },
]

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

const defaultMessage = "I can help you understand your financial agreement better. You can ask me about:\n\n• EMI calculations\n• Interest rates explained simply\n• Risk factors in your agreement\n• Any terms you don't understand\n\nHow can I assist you today?"

interface ChatbotProps {
  documentContext?: string
}

export function Chatbot({ documentContext }: ChatbotProps) {
  const { speak } = useTTS()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your financial assistant. I can help you understand your loan agreement, explain terms simply, and answer any questions. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [suggestions, setSuggestions] = useState(quickQuestions)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])



  const detectLanguage = (text: string) => {
    if (text.includes("क्या") || text.includes("है") || text.includes("क्यों")) return "hi";
    if (text.includes("आहे") || text.includes("का") || text.includes("मला")) return "mr";
    return "en";
  };



  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    let reply = ""
    try {
      let sessionId = typeof window !== "undefined" ? localStorage.getItem("chat_session_id") : null
      
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: messageText,
          language: detectLanguage(messageText),
        })
      })

      if (res.ok) {
        const data = await res.json()
        reply = data.answer
        if (data.suggestions) {
          setSuggestions(data.suggestions.map((s: string) => ({ 
            icon: HelpCircle, 
            text: s 
          })))
        }
      } else {
        reply = "I'm having trouble connecting to the AI. Please try again later."
      }
    } catch (err) {
      console.error("Chat error:", err)
      reply = "I'm sorry, I'm having trouble generating a response. Please try again."
    }
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: reply,
      timestamp: new Date(),
    }

    setIsTyping(false)
    setMessages((prev) => [...prev, assistantMessage])
    
    // Auto-play the voice response
    speak(reply, detectLanguage(reply))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
            "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90",
            "hover:scale-110 hover:shadow-xl",
            isOpen && "rotate-90"
          )}
          size="icon"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <MessageCircle className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)]",
              "rounded-2xl border border-border/50 shadow-2xl overflow-hidden",
              "bg-card/95 backdrop-blur-xl"
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Financial Assistant</h3>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    Always here to help
                  </p>
                </div>
                <div className="ml-auto">
                  <Sparkles className="h-5 w-5 text-white/60" />
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[350px] overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-2",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      message.role === "user"
                        ? "bg-primary/20"
                        : "bg-gradient-to-br from-primary to-accent"
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-primary" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 max-w-[80%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    )}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/10">
                      <p className="text-[10px] opacity-60">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {message.role === "assistant" && (
                        <SpeakButton 
                          text={message.content} 
                          language={detectLanguage(message.content)}
                          className="mt-1"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="px-4 pb-2">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {suggestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q.text)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                      "bg-muted/50 hover:bg-muted text-xs whitespace-nowrap",
                      "transition-all duration-200 hover:scale-105"
                    )}
                  >
                    <q.icon className="h-3 w-3 text-primary" />
                    {q.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 pt-2 border-t border-border/50">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask anything about your agreement..."
                  className="flex-1 bg-muted/50 border-0 focus-visible:ring-1"
                />
                <Button
                  onClick={startListening}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "shrink-0 transition-all duration-300",
                    isListening && "text-red-500 bg-red-500/10 animate-pulse scale-110"
                  )}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  size="icon"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
