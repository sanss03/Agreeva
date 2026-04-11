"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Shield,
  FileText,
  Volume2,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  ChevronRight,
  Sparkles,
} from "lucide-react"

const features = [
  {
    icon: FileText,
    title: "Upload Agreement",
    description: "Paste or upload any loan, insurance, or EMI agreement",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Sparkles,
    title: "AI Simplification",
    description: "Complex terms simplified into easy language you understand",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Volume2,
    title: "Voice in Your Language",
    description: "Listen in Hindi, English, or Marathi",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Visual Breakdown",
    description: "See EMI, interest, and total amount clearly",
    color: "from-orange-500 to-yellow-500",
  },
  {
    icon: AlertTriangle,
    title: "Risk Alerts",
    description: "Hidden charges and risks highlighted for you",
    color: "from-red-500 to-rose-500",
  },
  {
    icon: ThumbsUp,
    title: "Verified Consent",
    description: "Sign only when you truly understand",
    color: "from-indigo-500 to-violet-500",
  },
]

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("samarthasign-welcome-seen")
    if (!hasSeenWelcome) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem("samarthasign-welcome-seen", "true")
    setIsOpen(false)
  }

  const handleNext = () => {
    if (currentSlide < 2) {
      setCurrentSlide(currentSlide + 1)
    } else {
      handleClose()
    }
  }

  const slides = [
    // Slide 1: Welcome
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <div className="mb-6">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-2xl opacity-50" />
          <div className="relative h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl">
            <Shield className="h-10 w-10 text-white" />
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2">
        Welcome to <span className="text-primary">SamarthaSign</span>
      </h2>
      <p className="text-muted-foreground mb-6">
        Understand your financial agreements before signing.
        <br />
        Made simple for everyone.
      </p>
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 text-left">
        <p className="text-sm font-medium mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Powered by AI
        </p>
        <p className="text-xs text-muted-foreground">
          We simplify complex legal language so you can make informed decisions about loans, insurance, and more.
        </p>
      </div>
    </motion.div>,

    // Slide 2: Features
    <motion.div
      key="features"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h3 className="text-lg font-semibold mb-4 text-center">How It Works</h3>
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-muted/50 rounded-xl p-3"
          >
            <div
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center mb-2",
                "bg-gradient-to-br",
                feature.color
              )}
            >
              <feature.icon className="h-4 w-4 text-white" />
            </div>
            <h4 className="text-xs font-semibold mb-0.5">{feature.title}</h4>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>,

    // Slide 3: Get Started
    <motion.div
      key="start"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <div className="mb-6">
        <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">You are Ready!</h3>
        <p className="text-muted-foreground text-sm">
          Start by uploading or pasting your agreement.
          <br />
          We will guide you through every step.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-3 text-left">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">1</span>
          </div>
          <p className="text-xs">Upload or paste your loan/insurance agreement</p>
        </div>
        <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-3 text-left">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">2</span>
          </div>
          <p className="text-xs">Review the simplified explanation and risks</p>
        </div>
        <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-3 text-left">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">3</span>
          </div>
          <p className="text-xs">Give your informed consent with confidence</p>
        </div>
      </div>
    </motion.div>,
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]",
              "w-full max-w-md p-6 rounded-3xl",
              "bg-card border border-border/50 shadow-2xl"
            )}
          >
            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === currentSlide
                      ? "w-6 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">{slides[currentSlide]}</AnimatePresence>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-muted-foreground"
              >
                Skip
              </Button>
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-1"
              >
                {currentSlide === 2 ? "Get Started" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
