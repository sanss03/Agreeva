"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, ArrowRight, Lightbulb } from "lucide-react"
import { useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AgreementData } from "@/lib/types"
import { cn } from "@/lib/utils"

import { SpeakButton } from '@/components/ui/speak-button'

interface SimplifiedContentProps {
  data: AgreementData
  onComplete: () => void
}

export function SimplifiedContent({ data, onComplete }: SimplifiedContentProps) {
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

  const locale = useLocale()
  const allPointsVisible = visiblePoints.length === data.simplifiedPoints.length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-sm text-success font-medium">
          <CheckCircle2 className="w-4 h-4" />
          AI Analysis Complete
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Here&apos;s What Your Agreement Says
        </h2>
        <p className="text-muted-foreground">
          We&apos;ve simplified the complex legal language for you
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
              Simple Summary
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

      {/* Continue Button */}
      <div className="flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <Button
          onClick={onComplete}
          disabled={!allPointsVisible}
          size="lg"
          className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
        >
          <span className="flex items-center gap-3">
            Listen in Your Language
            <ArrowRight className="w-5 h-5" />
          </span>
        </Button>
      </div>
    </div>
  )
}
