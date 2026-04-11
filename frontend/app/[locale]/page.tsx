"use client"

import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/header"
import { UploadSection } from "@/components/upload-section"
import { SimplifiedContent } from "@/components/simplified-content"
import { ConsentScreen } from "@/components/consent-screen"
import { TrustBadges } from "@/components/trust-badges"
import { Chatbot } from "@/components/chatbot"
import { AccessibilityPanel } from "@/components/accessibility-panel"
import { FinancialGlossary } from "@/components/financial-glossary"
import { EmergencyHelpline } from "@/components/emergency-helpline"
import { ShareExport } from "@/components/share-export"
import { WelcomeModal } from "@/components/welcome-modal"
import { HeroSection } from "@/components/hero-section"
import { SectionNavigation } from "@/components/section-navigation"
import { VoiceExplanation } from "@/components/voice-explanation"
import { cn } from "@/lib/utils"
import { useLocale } from "next-intl"

import { Step, AgreementData } from "@/lib/types"

const sampleAgreementData: AgreementData = {
  originalText: "",
  simplifiedPoints: [
    "You are borrowing ₹1,00,000 from ABC Finance",
    "You will pay back ₹1,800 every month for 72 months (6 years)",
    "Total money you will pay: ₹1,29,600",
    "Extra money (interest): ₹29,600",
    "If you miss a payment, you pay ₹500 extra as penalty",
    "The bank can take your assets if you don't pay for 3 months",
  ],
  emi: 1800,
  totalAmount: 129600,
  principal: 100000,
  interestRate: 18.5,
  tenure: 72,
  interestAmount: 29600,
  riskLevel: "high",
  risks: [
    {
      type: "High Interest Rate",
      description: "18.5% interest is higher than most banks (10-12%)",
      severity: "danger",
    },
    {
      type: "Long Tenure",
      description: "6 years is a long time to pay EMI",
      severity: "warning",
    },
    {
      type: "Late Payment Penalty",
      description: "₹500 penalty for each late payment",
      severity: "warning",
    },
    {
      type: "Asset Seizure Risk",
      description: "Your property can be taken if you miss 3 EMIs",
      severity: "danger",
    },
  ],
}

export default function Home() {
  const locale = useLocale();
  const [agreementData, setAgreementData] = useState<AgreementData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")
  const [showVoiceExplanation, setShowVoiceExplanation] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [highContrast, setHighContrast] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  // Refs for sections
  const heroRef = useRef<HTMLDivElement>(null)
  const uploadRef = useRef<HTMLDivElement>(null)
  const simplifyRef = useRef<HTMLDivElement>(null)
  const consentRef = useRef<HTMLDivElement>(null)
  const voiceRef = useRef<HTMLDivElement>(null)

  const sections = [
    { id: "hero", label: "Home", ref: heroRef },
    { id: "upload", label: "Upload", ref: uploadRef },
    { id: "simplify", label: "Simplify", ref: simplifyRef },
    { id: "consent", label: "Consent", ref: consentRef },
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
      if (voiceRef.current) {
        voiceRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
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

  const handleUpload = async (text: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch("http://localhost:5000/api/simplify/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: locale })
      })
      if (!response.ok) throw new Error("Analysis failed")
      const data = await response.json()
      setAgreementData(data)
      setTimeout(() => scrollToSection("simplify"), 500)
    } catch (error) {
      console.error("Upload error:", error)
      setAgreementData({ ...sampleAgreementData, originalText: text })
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
          {agreementData && <ShareExport agreementTitle="Loan Agreement" />}
        </Header>

        {/* Section Navigation - Sticky */}
        <SectionNavigation
          sections={sections.map(({ id, label }) => ({ id, label }))}
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
              title="AI Simplified Summary"
              subtitle="Your agreement explained in simple, easy-to-understand language"
            />
            <div className="max-w-4xl mx-auto">
              {agreementData ? (
              <>
                <SimplifiedContent data={agreementData} onComplete={handleListen} />
                {showVoiceExplanation && (
                  <div ref={voiceRef} id="voice" className="pt-16">
                    <SectionHeader
                      number={1}
                      title="Voice Explanation"
                      subtitle="Listen to the simplified agreement in your preferred language"
                    />
                    <div className="max-w-4xl mx-auto mt-8">
                      <VoiceExplanation data={agreementData} onComplete={() => scrollToSection("consent")} />
                    </div>
                  </div>
                )}
              </>
            ) : (
                <LockedPlaceholder message="Upload a document first to see the simplified summary" />
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
              number={2}
              title="Verified Consent"
              subtitle="Review everything and give your informed approval"
            />
            <div className="max-w-4xl mx-auto">
              {agreementData ? (
                <ConsentScreen
                  data={agreementData}
                  quizPassed={true}
                />
              ) : (
                <LockedPlaceholder message="Upload a document first to provide your consent" />
              )}
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
      <Chatbot />
      <AccessibilityPanel
        fontSize={fontSize}
        highContrast={highContrast}
        reduceMotion={reduceMotion}
        onFontSizeChange={setFontSize}
        onHighContrastChange={setHighContrast}
        onReduceMotionChange={setReduceMotion}
      />
      <FinancialGlossary />
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
  return (
    <div className="text-center mb-12 md:mb-16">
      <div className="inline-flex items-center gap-2 mb-4">
        {isBonus ? (
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-accent to-primary text-xs font-semibold text-accent-foreground">
            BONUS TOOL
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
