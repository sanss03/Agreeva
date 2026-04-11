"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, ShieldAlert, ArrowRight, TrendingUp, Clock, Banknote, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AgreementData } from "@/lib/types"
import { cn } from "@/lib/utils"
import { SpeakButton } from '@/components/ui/speak-button'

interface RiskAlertsProps {
  data: AgreementData
  onComplete: () => void
}

const riskIcons: Record<string, React.ReactNode> = {
  "High Interest Rate": <TrendingUp className="w-5 h-5" />,
  "Long Tenure": <Clock className="w-5 h-5" />,
  "Late Payment Penalty": <Banknote className="w-5 h-5" />,
  "Asset Seizure Risk": <Home className="w-5 h-5" />,
}

export function RiskAlerts({ data, onComplete }: RiskAlertsProps) {
  const [riskMeterValue, setRiskMeterValue] = useState(0)
  const [visibleRisks, setVisibleRisks] = useState<number[]>([])

  const targetRiskValue =
    data.riskLevel === "high" ? 85 : data.riskLevel === "medium" ? 55 : 25

  useEffect(() => {
    // Animate risk meter
    const duration = 1500
    const steps = 60
    const stepValue = targetRiskValue / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      setRiskMeterValue(Math.min(Math.round(stepValue * currentStep), targetRiskValue))
      if (currentStep >= steps) {
        clearInterval(interval)
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [targetRiskValue])

  useEffect(() => {
    // Animate risks appearing one by one
    data.risks.forEach((risk: { type: string; description: string; severity: "warning" | "danger" }, index: number) => {
      setTimeout(() => {
        setVisibleRisks((prev) => [...prev, index])
      }, 500 + index * 300)
    })
  }, [data.risks])

  const getRiskColor = (value: number) => {
    if (value < 35) return "from-success to-success/70"
    if (value < 65) return "from-warning to-warning/70"
    return "from-destructive to-destructive/70"
  }

  const getRiskLabel = (value: number) => {
    if (value < 35) return { text: "Low Risk", color: "text-success" }
    if (value < 65) return { text: "Medium Risk", color: "text-warning" }
    return { text: "High Risk", color: "text-destructive" }
  }

  const riskLabel = getRiskLabel(riskMeterValue)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-sm text-destructive font-medium">
          <ShieldAlert className="w-4 h-4" />
          Risk Assessment
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Important Warnings
        </h2>
        <p className="text-muted-foreground">
          Please review these risks carefully before proceeding
        </p>
      </div>

      {/* Risk Meter */}
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-warning/5" />
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-warning flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            Overall Risk Level
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {/* Circular Risk Meter */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              {/* Background Circle */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-muted/30"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#riskGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${riskMeterValue * 2.51} 251`}
                  className="transition-all duration-100"
                />
                <defs>
                  <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="oklch(0.65 0.2 145)" />
                    <stop offset="50%" stopColor="oklch(0.75 0.15 85)" />
                    <stop offset="100%" stopColor="oklch(0.55 0.2 25)" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground">{riskMeterValue}%</span>
                <span className={cn("text-sm font-semibold", riskLabel.color)}>
                  {riskLabel.text}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Scale Legend */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-muted-foreground">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">High</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Risks */}
      <div className="space-y-4">
        {data.risks.map((risk: { type: string; description: string; severity: "warning" | "danger" }, index: number) => {
          const isVisible = visibleRisks.includes(index)
          const isDanger = risk.severity === "danger"

          return (
            <Card
              key={risk.type}
              className={cn(
                "relative overflow-hidden border-2 transition-all duration-500",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                isDanger
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-warning/50 bg-warning/5"
              )}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      isDanger
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-warning text-warning-foreground"
                    )}
                  >
                    {riskIcons[risk.type] || <AlertTriangle className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={cn("font-bold", isDanger ? "text-destructive" : "text-warning")}>
                        {risk.type}
                      </h3>
                      <span
                        className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full",
                          isDanger
                            ? "bg-destructive/20 text-destructive"
                            : "bg-warning/20 text-warning"
                        )}
                      >
                        {isDanger ? "HIGH" : "MEDIUM"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-foreground">{risk.description}</p>
                      <SpeakButton text={`${risk.type}. ${risk.description}`} language="en" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Acknowledgment */}
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardContent className="relative p-6 text-center">
          <p className="text-muted-foreground mb-4">
            By continuing, you acknowledge that you have reviewed and understood all the risks associated with this agreement.
          </p>
          <Button
            onClick={onComplete}
            size="lg"
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              I Understand the Risks
              <ArrowRight className="w-5 h-5" />
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
