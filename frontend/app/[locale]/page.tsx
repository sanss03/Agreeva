"use client"

import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/header"
import { UploadSection } from "@/components/upload-section"
import { SimplifiedContent } from "@/components/simplified-content"
import { ConsentScreen } from "@/components/consent-screen"
import { TrustBadges } from "@/components/trust-badges"
import { Chatbot } from "@/components/chatbot"
import { EMICalculator } from "@/components/emi-calculator"
import { AccessibilityPanel } from "@/components/accessibility-panel"
import { VisualBreakdown } from "@/components/visual-breakdown"
import { RiskAlerts } from "@/components/risk-alerts"
import { UnderstandingCheck } from "@/components/understanding-check"

import { EmergencyHelpline } from "@/components/emergency-helpline"
import { ShareExport } from "@/components/share-export"
import { WelcomeModal } from "@/components/welcome-modal"
import { HeroSection } from "@/components/hero-section"
import { SectionNavigation } from "@/components/section-navigation"
import { VoiceExplanation } from "@/components/voice-explanation"
import { cn } from "@/lib/utils"
import { useLocale } from "next-intl"

import { Step, AgreementData } from "@/lib/types"
import { translations, getLanguageKey } from "@/lib/translations"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface QuizResult {
  correctCount: number
  total: number
  passed: boolean
}

export default function Home() {
  const locale = useLocale();
  const langKey = getLanguageKey(locale);
  const t = translations[langKey];
  
  const [agreementData, setAgreementData] = useState<AgreementData | null>(null)
  const [documentName, setDocumentName] = useState<string | undefined>(undefined)
  const [uploadVersion, setUploadVersion] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState("hero")
  const [showVoiceExplanation, setShowVoiceExplanation] = useState(false)
  const [showVisualBreakdown, setShowVisualBreakdown] = useState(false)
  const [showRiskAlerts, setShowRiskAlerts] = useState(false)
  const [showUnderstandingCheck, setShowUnderstandingCheck] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [fontSize, setFontSize] = useState(100)
  const [highContrast, setHighContrast] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  // Refs for sections
  const heroRef = useRef<HTMLDivElement>(null)
  const uploadRef = useRef<HTMLDivElement>(null)
  const simplifyRef = useRef<HTMLDivElement>(null)
  const consentRef = useRef<HTMLDivElement>(null)
  const calculatorRef = useRef<HTMLDivElement>(null)
  const voiceRef = useRef<HTMLDivElement>(null)
  const risksRef = useRef<HTMLDivElement>(null)
  const quizRef = useRef<HTMLDivElement>(null)

  const sections = [
    { id: "hero", label: t.nav_home, ref: heroRef },
    { id: "upload", label: t.nav_upload, ref: uploadRef },
    { id: "simplify", label: t.nav_simplify, ref: simplifyRef },
    { id: "voice", label: t.nav_voice, ref: voiceRef, hidden: !showVoiceExplanation },
    { id: "risks", label: t.nav_risks, ref: risksRef, hidden: !showRiskAlerts },
    { id: "quiz", label: t.nav_quiz, ref: quizRef, hidden: !showUnderstandingCheck },
    { id: "consent", label: t.nav_consent, ref: consentRef },
    { id: "calculator", label: t.nav_calculator, ref: calculatorRef },
  ]

  // Intersection observer for active section tracking
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    
    sections.forEach(({ id, ref }) => {
      if (ref.current) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                setActiveSection(id)
              }
            })
          },
          { threshold: 0.3 }
        )
        observer.observe(ref.current)
        observers.push(observer)
      }
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [])

  const scrollToSection = (id: string) => {
    if (id === "voice") {
      voiceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }

    const section = sections.find((s) => s.id === id)
    if (section?.ref.current) {
      section.ref.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleListen = () => {
    setShowVoiceExplanation(true)
    setTimeout(() => {
      if (voiceRef.current) {
        voiceRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 120)
  }

  const handleShowRiskAlerts = () => {
    setShowRiskAlerts(true)
    setTimeout(() => risksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120)
  }

  const handleShowUnderstandingCheck = () => {
    setShowUnderstandingCheck(true)
    setTimeout(() => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120)
  }

  const handleQuizComplete = (result: QuizResult) => {
    setQuizResult(result)
    setTimeout(() => scrollToSection("consent"), 120)
  }

  const handleUpload = async (text: string, fileName?: string) => {
    setIsProcessing(true)
    setAnalysisError(null)
    try {
      const response = await fetch(`${API_BASE}/api/simplify/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: locale })
      })
      const data = await response.json().catch(() => null)
      if (!response.ok || !data) {
        throw new Error(data?.error || "Analysis failed")
      }

      // Reset the analysis journey so a re-upload never carries over a
      // previous document's voice/risk/quiz progress or fabricated data.
      setAgreementData(data)
      setDocumentName(fileName || t.upload_pasted_document_label)
      setUploadVersion((v) => v + 1)
      setShowVoiceExplanation(false)
      setShowVisualBreakdown(false)
      setShowRiskAlerts(false)
      setShowUnderstandingCheck(false)
      setQuizResult(null)

      setTimeout(() => scrollToSection("simplify"), 500)
    } catch (error) {
      console.error("Upload error:", error)
      setAnalysisError(error instanceof Error ? error.message : t.analysis_error_generic)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main
      className="min-h-screen bg-background overflow-x-hidden"
      style={{
        fontSize: `${fontSize}%`,
        filter: highContrast ? "contrast(1.2)" : undefined,
      }}
    >
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10">
        <Header>
          {agreementData && <ShareExport agreementTitle={t.loan_agreement_title} />}
        </Header>

        {/* Section Navigation - Sticky */}
        <SectionNavigation
          sections={sections.filter(s => !s.hidden).map(({ id, label }) => ({ id, label }))}
          activeSection={activeSection}
          onSectionClick={scrollToSection}
          hasData={!!agreementData}
        />

        {/* Hero Section */}
        <section ref={heroRef} id="hero" className="min-h-[90vh] flex items-center">
          <HeroSection onGetStarted={() => scrollToSection("upload")} />
        </section>

        {/* Upload Section */}
        <section
          ref={uploadRef}
          id="upload"
          className="min-h-screen py-16 md:py-24"
        >
          <div className="container mx-auto px-4">

            <div className="max-w-4xl mx-auto">
              <UploadSection onUpload={handleUpload} isProcessing={isProcessing} />
            </div>
          </div>
        </section>

        {/* Simplified Content Section */}
        <section
          ref={simplifyRef}
          id="simplify"
          className={cn(
            "min-h-screen py-16 md:py-24 transition-opacity duration-500",
            !agreementData && "opacity-50 pointer-events-none"
          )}
        >
          <div className="container mx-auto px-4">
            <SectionHeader
              number={1}
              title={t.summary_title}
              subtitle={t.summary_subtitle}
            />
            <div className="max-w-4xl mx-auto">
              {agreementData ? (
              <>
                <SimplifiedContent
                  data={agreementData}
                  onComplete={() => {
                    const hasVisuals = agreementData.visuals && agreementData.visuals.length > 0
                    if (hasVisuals) {
                      setShowVisualBreakdown(true)
                      setTimeout(() => {
                        document.getElementById("visual-breakdown-section")?.scrollIntoView({ behavior: "smooth", block: "start" })
                      }, 120)
                    } else {
                      handleListen()
                    }
                  }}
                />

                {agreementData.visuals && agreementData.visuals.length > 0 && (
                  <div id="visual-breakdown-section" className="pt-16">
                    <SectionHeader
                      number={2}
                      title={t.visual_title}
                      subtitle={t.visual_subtitle}
                    />
                    <div className="max-w-4xl mx-auto mt-8">
                      <VisualBreakdown
                        data={agreementData}
                        onComplete={handleListen}
                      />
                    </div>
                  </div>
                )}

                {showVoiceExplanation && (
                  <div ref={voiceRef} id="voice" className="pt-16">
                    <SectionHeader
                      number={3}
                      title={t.voice_title}
                      subtitle={t.voice_subtitle}
                    />
                    <div className="max-w-4xl mx-auto mt-8">
                      <VoiceExplanation
                        data={agreementData}
                        onComplete={handleShowRiskAlerts}
                      />
                    </div>
                  </div>
                )}

                {showRiskAlerts && (
                  <div ref={risksRef} id="risks" className="pt-16">
                    <SectionHeader
                      number={4}
                      title={t.risk_title_main}
                      subtitle={t.risk_desc}
                    />
                    <div className="max-w-4xl mx-auto mt-8">
                      <RiskAlerts
                        data={agreementData}
                        onComplete={handleShowUnderstandingCheck}
                      />
                    </div>
                  </div>
                )}

                {showUnderstandingCheck && (
                  <div ref={quizRef} id="quiz" className="pt-16">
                    <SectionHeader
                      number={5}
                      title={t.check_header}
                      subtitle={t.check_desc}
                    />
                    <div className="max-w-4xl mx-auto mt-8">
                      <UnderstandingCheck
                        data={agreementData}
                        onComplete={handleQuizComplete}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : analysisError ? (
                <ErrorPlaceholder message={analysisError} />
              ) : (
                <LockedPlaceholder message={t.placeholder_upload} />
              )}
            </div>
          </div>
        </section>



        {/* Final Consent Section */}
        <section
          ref={consentRef}
          id="consent"
          className={cn(
            "min-h-screen py-16 md:py-24 transition-opacity duration-500",
            !agreementData && "opacity-50 pointer-events-none"
          )}
        >
          <div className="container mx-auto px-4">
            <SectionHeader
              number={6}
              title={t.consent_title}
              subtitle={t.consent_subtitle}
            />
            <div className="max-w-4xl mx-auto">
              {agreementData ? (
                <ConsentScreen
                  data={agreementData}
                  quizPassed={quizResult?.passed ?? false}
                  quizScore={quizResult?.correctCount}
                  quizTotal={quizResult?.total}
                  documentName={documentName}
                />
              ) : (
                <LockedPlaceholder message={t.placeholder_consent} />
              )}
            </div>
          </div>
        </section>



        {/* EMI Calculator Section */}
        <section
          ref={calculatorRef}
          id="calculator"
          className="min-h-screen py-16 md:py-24 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
        >
          <div className="container mx-auto px-4">
            <SectionHeader
              number={0}
              title={t.calculator_title}
              subtitle={t.calculator_subtitle}
              isBonus
            />
            <div className="max-w-2xl mx-auto">
              <EMICalculator />
            </div>
          </div>
        </section>

        {/* Trust Badges & Footer */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <TrustBadges />
          </div>
        </section>
      </div>

      {/* Floating Tools */}
      <Chatbot
        key={uploadVersion}
        documentContext={agreementData?.originalText}
        analysis={agreementData ?? undefined}
      />
      <AccessibilityPanel
        fontSize={fontSize}
        highContrast={highContrast}
        reduceMotion={reduceMotion}
        onFontSizeChange={setFontSize}
        onHighContrastChange={setHighContrast}
        onReduceMotionChange={setReduceMotion}
      />

      <EmergencyHelpline />
      <WelcomeModal />
    </main>
  )
}

// Section Header Component
function SectionHeader({
  number,
  title,
  subtitle,
  isBonus = false,
}: {
  number: number
  title: string
  subtitle: string
  isBonus?: boolean
}) {
  const locale = useLocale();
  const langKey = getLanguageKey(locale);
  const t = translations[langKey];

  return (
    <div className="text-center mb-12 md:mb-16">
      <div className="inline-flex items-center gap-2 mb-4">
        {isBonus ? (
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-accent to-primary text-xs font-semibold text-accent-foreground">
            {t.bonus_tool}
          </span>
        ) : (
          <span className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
            {number}
          </span>
        )}
      </div>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
        {title}
      </h2>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
        {subtitle}
      </p>
    </div>
  )
}

// Locked Placeholder for sections that require data
function LockedPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl border border-dashed border-border bg-card/30 backdrop-blur-sm">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <p className="text-muted-foreground text-center max-w-md">{message}</p>
    </div>
  )
}

// Shown when AI analysis genuinely fails - never silently replaced with fabricated data
function ErrorPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 backdrop-blur-sm">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <p className="text-destructive text-center max-w-md font-medium">{message}</p>
    </div>
  )
}
