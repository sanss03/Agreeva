"use client"

import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Mic2, 
  ShieldCheck, 
  Languages, 
  BarChart3,
  CheckCircle2,
  ArrowDown,
  Sparkles
} from "lucide-react"
import { useEffect, useState } from "react"

interface HeroSectionProps {
  onGetStarted: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    { icon: FileText, label: "Upload Agreement", color: "from-blue-500 to-cyan-500" },
    { icon: Sparkles, label: "AI Simplification", color: "from-purple-500 to-pink-500" },
    { icon: Languages, label: "Multi-Language", color: "from-green-500 to-emerald-500" },
    { icon: BarChart3, label: "Visual Breakdown", color: "from-orange-500 to-yellow-500" },
    { icon: ShieldCheck, label: "Risk Alerts", color: "from-red-500 to-rose-500" },
    { icon: CheckCircle2, label: "Verified Consent", color: "from-indigo-500 to-violet-500" },
  ]

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Financial Understanding</span>
        </div>

        {/* Main Headline */}
        <h1
          className={`text-4xl md:text-5xl lg:text-7xl font-bold mb-6 transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <span className="text-foreground">Understand Your</span>
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            Financial Agreements
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 text-pretty transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          We simplify complex loan documents, explain in your language, and ensure you truly understand before signing.
          <span className="text-foreground font-medium"> No hidden surprises.</span>
        </p>

        {/* Language Support Badge */}
        <div
          className={`flex items-center justify-center gap-4 mb-10 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <Mic2 className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Available in</span>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">English</span>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">हिंदी</span>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">मराठी</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <Button
            size="lg"
            onClick={onGetStarted}
            className="px-8 py-6 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
          >
            Upload Your Agreement
            <ArrowDown className="w-5 h-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg border-primary/30 hover:bg-primary/10"
          >
            See Demo
          </Button>
        </div>

        {/* Feature Pills */}
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {features.map((feature, index) => (
            <div
              key={feature.label}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-card/50 border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 cursor-default"
              style={{ transitionDelay: `${500 + index * 50}ms` }}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                {feature.label}
              </span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div
          className={`grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border transition-all duration-700 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">50K+</div>
            <div className="text-sm text-muted-foreground">Documents Simplified</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">99%</div>
            <div className="text-sm text-muted-foreground">User Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">3</div>
            <div className="text-sm text-muted-foreground">Languages Supported</div>
          </div>
        </div>
      </div>
    </div>
  )
}
