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
import { useLocale } from "next-intl"
import { translations, getLanguageKey } from "@/lib/translations"
import type { AgreementData } from "@/lib/types"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const NO_DOCUMENT_MESSAGE: Record<string, string> = {
  en: "Please upload or paste a document first so I can answer questions about it.",
  hi: "कृपया पहले एक दस्तावेज़ अपलोड करें या पेस्ट करें ताकि मैं उसके बारे में प्रश्नों का उत्तर दे सकूं।",
  mr: "कृपया आधी एखादे कागदपत्र अपलोड करा किंवा पेस्ट करा जेणेकरून मी त्याबद्दलच्या प्रश्नांची उत्तरे देऊ शकेन.",
}

const GENERIC_ERROR_MESSAGE: Record<string, string> = {
  en: "Sorry, I couldn't answer that question right now. Please try again.",
  hi: "क्षमा करें, मैं अभी इस प्रश्न का उत्तर नहीं दे सका। कृपया पुनः प्रयास करें।",
  mr: "क्षमस्व, मी आत्ता या प्रश्नाचे उत्तर देऊ शकलो नाही. कृपया पुन्हा प्रयत्न करा.",
}

const LOCALE_TO_LANGUAGE: Record<string, string> = {
  en: "english",
  hi: "hindi",
  mr: "marathi",
}

const MAX_HISTORY_MESSAGES = 10

// Locale-keyed initial greeting shown when the chatbot first opens
const INITIAL_GREETING: Record<string, string> = {
  en: "Hello! I'm your financial assistant. I can help you understand your loan agreement, explain terms simply, and answer any questions. How can I help you today?",
  hi: "नमस्ते! मैं आपका वित्तीय सहायक हूँ। मैं आपके ऋण समझौते को सरल भाषा में समझने और आपके सवालों के जवाब देने में आपकी मदद कर सकता हूँ। आज मैं आपकी कैसे सहायता कर सकता हूँ?",
  mr: "नमस्कार! मी तुमचा आर्थिक सहाय्यक आहे. मी तुमचा कर्ज करार सोप्या भाषेत समजून घेण्यास आणि तुमच्या प्रश्नांची उत्तरे देण्यास मदत करू शकतो. आज मी तुमची कशी मदत करू?",
}

// Locale-keyed quick-question suggestion texts (strings only — no React components in state)
const QUICK_QUESTIONS: Record<string, string[]> = {
  en: ["What is my EMI?", "Explain this agreement", "What are the risks?", "What is interest rate?"],
  hi: ["मेरा EMI कितना है?", "इस समझौते को सरल भाषा में समझाएँ", "इसमें क्या जोखिम हैं?", "ब्याज दर क्या है?"],
  mr: ["माझा EMI किती आहे?", "हा करार सोप्या भाषेत समजावून सांगा", "यात कोणते धोके आहेत?", "व्याज दर किती आहे?"],
}

// Icon lookup by position — never stored in state, only used at render time
const SUGGESTION_ICONS = [Calculator, FileText, AlertTriangle, HelpCircle]

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface ChatbotProps {
  documentContext?: string
  analysis?: AgreementData
}

export function Chatbot({ documentContext, analysis }: ChatbotProps) {
  const { speak } = useTTS()
  const locale = useLocale()
  const langKey = getLanguageKey(locale)
  const t = translations[langKey]
  const localeKey = locale in INITIAL_GREETING ? locale : "en"
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: INITIAL_GREETING[localeKey],
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>(
    QUICK_QUESTIONS[localeKey] ?? QUICK_QUESTIONS.en
  )
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
    const t = text.toLowerCase();
    if (t.includes("क्या") || t.includes("है")) return "hindi";
    if (t.includes("आहे") || t.includes("मला")) return "marathi";
    return "english";
  };

  // Always use the app's selected locale as the primary language for the reply.
  // Exception: if the app locale is English but the user typed in Devanagari script,
  // try to detect whether they mean Hindi or Marathi so the reply matches their input.
  const resolveLanguage = (text: string) => {
    const appLanguage = LOCALE_TO_LANGUAGE[locale] || "english"
    if (appLanguage !== "english") return appLanguage  // hi → "hindi", mr → "marathi"
    const hasDevanagari = /[ऀ-ॿ]/.test(text)
    if (hasDevanagari) return detectLanguage(text)
    return "english"
  };

  const hasDocument = Boolean((documentContext && documentContext.trim()) || analysis)



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
    if (isTyping) return // prevent duplicate/overlapping sends

    const messageText = (text || input).trim()
    if (!messageText) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    if (!hasDocument) {
      const notice: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: NO_DOCUMENT_MESSAGE[locale] || NO_DOCUMENT_MESSAGE.en,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, notice])
      return
    }

    setIsTyping(true)

    const language = resolveLanguage(messageText)
    let reply = ""

    try {
      const conversationHistory = messages
        .slice(-MAX_HISTORY_MESSAGES)
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: messageText,
          documentText: documentContext,
          analysis,
          conversationHistory,
          language,
        })
      })

      const data = await res.json().catch(() => null)

      if (res.ok && data?.answer) {
        reply = data.answer
        if (Array.isArray(data.suggestions) && data.suggestions.length) {
          // Store only strings — component refs must never enter state
          setSuggestions(data.suggestions.map((s: unknown) => String(s)))
        }
      } else {
        console.error("Chat API error:", data?.error || res.statusText)
        reply = GENERIC_ERROR_MESSAGE[locale] || GENERIC_ERROR_MESSAGE.en
      }
    } catch (err) {
      console.error("Chat error:", err)
      reply = GENERIC_ERROR_MESSAGE[locale] || GENERIC_ERROR_MESSAGE.en
    } finally {
      setIsTyping(false)
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: reply,
      timestamp: new Date(),
    }

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
                  <h3 className="font-semibold text-white">{t.chatbot}</h3>
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
                          language={locale}
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
                {suggestions.map((text, i) => {
                  const Icon = SUGGESTION_ICONS[i % SUGGESTION_ICONS.length]
                  return (
                    <button
                      key={i}
                      onClick={() => handleSend(text)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                        "bg-muted/50 hover:bg-muted text-xs whitespace-nowrap",
                        "transition-all duration-200 hover:scale-105"
                      )}
                    >
                      <Icon className="h-3 w-3 text-primary" />
                      {text}
                    </button>
                  )
                })}
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
