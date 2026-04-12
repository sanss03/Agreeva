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
import { useTranslations, useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/routing"

interface HeroSectionProps {
  onGetStarted: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const t = useTranslations("Hero")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const changeLanguage = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale });
  }

  const features = [
    { icon: FileText, label: t("features.upload") },
    { icon: Sparkles, label: t("features.ai") },
    { icon: Languages, label: t("features.lang") },
    { icon: BarChart3, label: t("features.visual") },
    { icon: ShieldCheck, label: t("features.risk") },
    { icon: CheckCircle2, label: t("features.consent") },
  ]

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-5xl mx-auto text-center">

        {/* Main Headline */}
        <h1
          className={`text-4xl md:text-5xl lg:text-7xl font-bold mb-6 transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <span className="text-foreground">{t("title1")}</span>
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            {t("title2")}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 text-pretty transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          {t("subtitle")}
          <span className="text-foreground font-medium">{t("subtitleHighlight")}</span>
        </p>

        {/* Language Support Badge */}
        <div
          className={`flex items-center justify-center gap-4 mb-10 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <Mic2 className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">{t("availableIn")}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => changeLanguage('en')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${locale === 'en' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                English
              </button>
              <button 
                onClick={() => changeLanguage('hi')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${locale === 'hi' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                हिंदी
              </button>
              <button 
                onClick={() => changeLanguage('mr')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${locale === 'mr' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                मराठी
              </button>
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
            {t("uploadButton")}
            <ArrowDown className="w-5 h-5 ml-2" />
          </Button>
          {/* <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg border-primary/30 hover:bg-primary/10"
          >
            {t("demoButton")}
          </Button> */}
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
              <div className="w-10 h-10 rounded-lg border border-border bg-muted/50 flex items-center justify-center group-hover:bg-muted transition-colors">
                <feature.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
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
            <div className="text-sm text-muted-foreground">{t("stats.docs")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">99%</div>
            <div className="text-sm text-muted-foreground">{t("stats.satisfaction")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">3</div>
            <div className="text-sm text-muted-foreground">{t("stats.languages")}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
