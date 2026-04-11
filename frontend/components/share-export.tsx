"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Share2,
  Download,
  Mail,
  MessageCircle,
  Copy,
  CheckCircle2,
  X,
  FileText,
  Image,
  Link2,
} from "lucide-react"

interface ShareExportProps {
  agreementTitle?: string
  className?: string
}

export function ShareExport({ agreementTitle = "Loan Agreement Summary", className }: ShareExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async (method: string) => {
    const shareData = {
      title: "SamarthaSign - Agreement Summary",
      text: `Check out my simplified agreement summary for: ${agreementTitle}`,
      url: window.location.href,
    }

    if (method === "native" && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled
      }
    } else if (method === "whatsapp") {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`,
        "_blank"
      )
    } else if (method === "email") {
      window.open(
        `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(`${shareData.text}\n\n${shareData.url}`)}`,
        "_blank"
      )
    }
    setIsOpen(false)
  }

  const handleDownload = (format: string) => {
    // In a real app, this would generate actual PDF/image
    const element = document.createElement("a")
    const content = `
SamarthaSign - Agreement Summary
================================

${agreementTitle}

Generated on: ${new Date().toLocaleDateString()}

Key Details:
- Loan Amount: Rs. 5,00,000
- Interest Rate: 12% p.a.
- EMI: Rs. 16,607
- Total Payable: Rs. 5,97,852

This summary was simplified by AI for easy understanding.
Verified and consented on SamarthaSign.
    `

    if (format === "txt") {
      const file = new Blob([content], { type: "text/plain" })
      element.href = URL.createObjectURL(file)
      element.download = "agreement-summary.txt"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }

    setIsOpen(false)
  }

  return (
    <div className={className}>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
                "w-full max-w-sm p-6 rounded-2xl",
                "bg-card border border-border/50 shadow-2xl"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Share or Download</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Share Options */}
              <div className="mb-6">
                <p className="text-xs text-muted-foreground mb-3">Share with family or advisor</p>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => handleShare("whatsapp")}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 transition-colors"
                  >
                    <MessageCircle className="h-6 w-6 text-green-500" />
                    <span className="text-[10px]">WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleShare("email")}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                  >
                    <Mail className="h-6 w-6 text-blue-500" />
                    <span className="text-[10px]">Email</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    ) : (
                      <Link2 className="h-6 w-6 text-primary" />
                    )}
                    <span className="text-[10px]">{copied ? "Copied!" : "Copy Link"}</span>
                  </button>
                  <button
                    onClick={() => handleShare("native")}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors"
                  >
                    <Share2 className="h-6 w-6 text-accent" />
                    <span className="text-[10px]">More</span>
                  </button>
                </div>
              </div>

              {/* Download Options */}
              <div>
                <p className="text-xs text-muted-foreground mb-3">Download summary</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDownload("txt")}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Text File</p>
                      <p className="text-[10px] text-muted-foreground">.txt format</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDownload("txt")}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Image className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Image</p>
                      <p className="text-[10px] text-muted-foreground">.png format</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
