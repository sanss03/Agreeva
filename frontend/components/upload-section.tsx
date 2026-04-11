"use client"

import { useState, useRef } from "react"
import { Upload, FileText, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface UploadSectionProps {
  onUpload: (text: string) => void
  isProcessing: boolean
}

const sampleAgreement = `LOAN AGREEMENT

This Personal Loan Agreement is made between ABC Finance Ltd. ("Lender") and the Borrower.

1. LOAN AMOUNT: ₹1,00,000 (One Lakh Rupees Only)

2. INTEREST RATE: 18.5% per annum (reducing balance method)

3. LOAN TENURE: 72 months (6 years)

4. EMI: ₹1,800 per month, payable on the 5th of every month

5. PROCESSING FEE: ₹2,500 (2.5% of loan amount) - deducted at disbursement

6. LATE PAYMENT PENALTY: ₹500 per instance + 2% additional interest on overdue amount

7. PREPAYMENT CHARGES: 3% of outstanding principal if prepaid within first 2 years

8. COLLATERAL: The borrower agrees to pledge personal assets as security

9. DEFAULT CLAUSE: In case of 3 consecutive missed EMIs, the Lender reserves the right to:
   - Report to credit bureaus
   - Initiate legal proceedings
   - Seize pledged collateral

10. INSURANCE: Loan protection insurance of ₹5,000 per annum is mandatory

By signing below, the borrower acknowledges understanding all terms and conditions.`

export function UploadSection({ onUpload, isProcessing }: UploadSectionProps) {
  const [text, setText] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    if (!file) return;

    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (isPDF) {
      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("http://127.0.0.1:5000/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "PDF extraction failed");
        }
        
        const data = await response.json()
        if (data.text) {
          setText(data.text)
        }
      } catch (error: any) {
        console.error("PDF Extraction Error:", error)
        alert(`Error: ${error.message || "Something went wrong during PDF extraction"}`)
      } finally {
        setIsUploading(false)
      }
    } else if (file.type === "text/plain") {
      const reader = new FileReader()
      reader.onload = (e) => {
        setText(e.target?.result as string)
      }
      reader.readAsText(file)
    } else {
      alert("Please upload a .pdf or .txt file.")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    processFile(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const loadSample = () => {
    setText(sampleAgreement)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero Text */}
      <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight text-balance">
          Understand Your Agreement
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
            Before You Sign
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto text-pretty">
          Upload any financial document and our AI will explain it in simple words you can understand
        </p>
      </div>

      {/* Upload Card */}
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardContent className="relative p-6 md:p-8 space-y-6">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300",
              isDragging
                ? "border-primary bg-primary/10 scale-[1.02]"
                : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                isDragging
                  ? "bg-primary text-primary-foreground scale-110"
                  : "bg-muted text-muted-foreground"
              )}>
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <p className="text-foreground font-semibold text-lg">
                  {isUploading 
                    ? "Extracting text..." 
                    : isDragging 
                      ? "Drop your file here" 
                      : "Drop your agreement here"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {isUploading 
                    ? "Please wait while our AI reads your PDF" 
                    : "or click to browse • Supports PDF and TXT"}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs text-muted-foreground font-medium">OR PASTE TEXT</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* Text Area */}
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your loan agreement, insurance policy, or any financial document here..."
              className="w-full h-48 md:h-56 p-4 bg-muted/30 border border-border/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground transition-all duration-300"
            />
            <div className="flex items-center justify-between">
              <button
                onClick={loadSample}
                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Load sample agreement
              </button>
              <span className="text-xs text-muted-foreground">
                {text.length} characters
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={() => onUpload(text)}
            disabled={!text.trim() || isProcessing}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
          >
            {isProcessing ? (
              <span className="flex items-center gap-3">
                <Spinner className="w-5 h-5" />
                AI is analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                Simplify with AI
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Helper Text */}
      <p className="text-center text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        Your documents are processed securely and never stored
      </p>
    </div>
  )
}
