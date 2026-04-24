"use client"

import { useState, useRef } from "react"
import { Upload, FileText, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useLocale } from "next-intl"
import { translations, getLanguageKey } from "@/lib/translations"

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
  const locale = useLocale()
  const langKey = getLanguageKey(locale)
  const t = translations[langKey]
  const [text, setText] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileProcess = async (file: File) => {
    setIsExtracting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch("http://localhost:5000/api/simplify/extract", {
        method: "POST",
        body: formData
      })
      
      if (!response.ok) throw new Error("Failed to extract text from file")
      
      const data = await response.json()
      setText(data.text)
    } catch (error) {
      console.error("Extraction error:", error)
      alert("Could not extract text from this file. Please ensure it is a valid PDF or Word Document.")
    } finally {
      setIsExtracting(false)
    }
  }



  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileProcess(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileProcess(file)
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
          {t.upload_title}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
            {t.upload_subtitle}
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto text-pretty">
          {t.upload_description}
        </p>
      </div>

      {/* Upload Card */}
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardContent className="relative p-6 md:p-8 space-y-6">
          {/* Drag & Drop Zone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative border-2 border-dashed rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all duration-300",
                isDragging || isExtracting
                  ? "border-primary bg-primary/10 scale-[1.02]"
                  : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.doc,.docx,image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                  isDragging || isExtracting
                    ? "bg-primary text-primary-foreground scale-110"
                    : "bg-muted text-muted-foreground"
                )}>
                  {isExtracting ? (
                    <Spinner className="w-6 h-6 text-primary-foreground" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-foreground font-semibold">
                    {isExtracting ? "Extracting text..." : t.upload_file}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    PDF, Word, or Image
                  </p>
                </div>
              </div>
            </div>

            {/* Camera Scan Zone */}
            <div
              onClick={() => cameraInputRef.current?.click()}
              className={cn(
                "relative border-2 border-solid rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all duration-300 border-border/50 hover:border-accent/50 hover:bg-accent/5"
              )}
            >
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 bg-accent/10 text-accent group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground font-semibold">
                    {t.upload_camera}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Take a photo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs text-muted-foreground font-medium">{t.upload_paste}</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* Text Area */}
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isExtracting}
              placeholder={t.upload_placeholder}
              className="w-full h-48 md:h-56 p-4 bg-muted/30 border border-border/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground transition-all duration-300 disabled:opacity-50"
            />
            <div className="flex items-center justify-between">
              <button
                onClick={loadSample}
                disabled={isExtracting}
                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                {t.upload_sample}
              </button>
              <span className="text-xs text-muted-foreground">
                {text.length} characters
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={() => onUpload(text)}
            disabled={!text.trim() || isProcessing || isExtracting}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
          >
            {isProcessing ? (
              <span className="flex items-center gap-3">
                <Spinner className="w-5 h-5" />
                {t.upload_analyzing}
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                {t.upload_simplify_btn}
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Helper Text */}
      <p className="text-center text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        {t.footer_secure}
      </p>
    </div>
  )
}
