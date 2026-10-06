"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, ArrowRight, Lightbulb, ScrollText } from "lucide-react"
import { useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AgreementData } from "@/lib/types"
import { cn } from "@/lib/utils"

import { SpeakButton } from '@/components/ui/speak-button'
import { translations, getLanguageKey } from "@/lib/translations"

interface SimplifiedContentProps {
  data: AgreementData
  onComplete: () => void
}

export function SimplifiedContent({ data, onComplete }: SimplifiedContentProps) {
  const locale = useLocale()
  const langKey = getLanguageKey(locale)
  const t = translations[langKey]
  const [visiblePoints, setVisiblePoints] = useState<number[]>([])
  const [typingIndex, setTypingIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")

  useEffect(() => {
    if (typingIndex < data.simplifiedPoints.length) {
      const point = data.simplifiedPoints[typingIndex]
      let charIndex = 0

      const typeInterval = setInterval(() => {
        if (charIndex <= point.length) {
          setCurrentText(point.slice(0, charIndex))
          charIndex++
        } else {
          clearInterval(typeInterval)
          setVisiblePoints((prev) => [...prev, typingIndex])
          setCurrentText("")
          setTimeout(() => {
            setTypingIndex((prev) => prev + 1)
          }, 300)
        }
      }, 20)

      return () => clearInterval(typeInterval)
    }
  }, [typingIndex, data.simplifiedPoints])

  const allPointsVisible = visiblePoints.length === data.simplifiedPoints.length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-sm text-success font-medium">
          <CheckCircle2 className="w-4 h-4" />
          {t.summary_header}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {t.summary_title_main}
        </h2>
        <p className="text-muted-foreground">
          {t.summary_desc}
        </p>
      </div>

      {/* Simplified Points Card */}
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-primary/5" />
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center justify-between gap-3 text-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              {t.summary_card_title}
            </div>
            <SpeakButton 
              text={data.simplifiedPoints.join('. ')} 
              language={locale}
              size="md"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {/* Completed Points */}
          {visiblePoints.map((index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/30 animate-in fade-in slide-in-from-left-4 duration-500",
                index === 0 && "bg-primary/10 border-primary/20",
                index === data.simplifiedPoints.length - 1 && "bg-destructive/10 border-destructive/20"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                index === 0 && "bg-primary text-primary-foreground",
                index === data.simplifiedPoints.length - 1 && "bg-destructive text-destructive-foreground",
                index !== 0 && index !== data.simplifiedPoints.length - 1 && "bg-success text-success-foreground"
              )}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-foreground leading-relaxed pt-1">
                  {data.simplifiedPoints[index]}
                </p>
                <SpeakButton text={data.simplifiedPoints[index]} language={locale} />
              </div>
            </div>
          ))}

          {/* Currently Typing Point */}
          {typingIndex < data.simplifiedPoints.length && (
            <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-primary/30 animate-pulse">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                {typingIndex + 1}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-foreground leading-relaxed">
                  {currentText}
                  <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-pulse" />
                </p>
              </div>
            </div>
          )}

          {/* Remaining Skeleton Points */}
          {Array.from({ length: Math.max(0, data.simplifiedPoints.length - visiblePoints.length - 1) }).map(
            (_, index) => (
              <div
                key={`skeleton-${index}`}
                className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-border/20 opacity-30"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                  {visiblePoints.length + index + 2}
                </div>
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Key Financial Highlights - Visible immediately for at-a-glance value */}
      {data.visuals && data.visuals.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <h3 className="text-xl font-bold px-1">{t.summary_highlights}</h3>
          <div className="grid grid-cols-2 gap-4">
            {data.visuals.map((item, i) => (
              <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-4 flex flex-col justify-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</span>
                  <span className="text-lg font-bold text-foreground">{item.value}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Important Clauses - only shown when the AI actually found distinct clauses in the document */}
      {data.keyClauses && data.keyClauses.length > 0 && (
        <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-7 duration-700 delay-400">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
          <CardHeader className="relative pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <ScrollText className="w-5 h-5 text-white" />
              </div>
              {t.summary_clauses_title}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-3">
            {data.keyClauses.map((clause, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-foreground text-sm leading-relaxed">{clause}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

    </div>
  )
}
