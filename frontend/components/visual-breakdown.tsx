"use client"

import { useState, useEffect } from "react"
import { BarChart3, ArrowRight, TrendingUp, Calendar, Wallet, PiggyBank } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AgreementData } from "@/app/page"
import { cn } from "@/lib/utils"

interface VisualBreakdownProps {
  data: AgreementData
  onComplete: () => void
}

export function VisualBreakdown({ data, onComplete }: VisualBreakdownProps) {
  const [animatedEmi, setAnimatedEmi] = useState(0)
  const [animatedTotal, setAnimatedTotal] = useState(0)
  const [animatedInterest, setAnimatedInterest] = useState(0)
  const [showChart, setShowChart] = useState(false)

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const emiStep = data.emi / steps
    const totalStep = data.totalAmount / steps
    const interestStep = data.interestAmount / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      setAnimatedEmi(Math.min(Math.round(emiStep * currentStep), data.emi))
      setAnimatedTotal(Math.min(Math.round(totalStep * currentStep), data.totalAmount))
      setAnimatedInterest(Math.min(Math.round(interestStep * currentStep), data.interestAmount))

      if (currentStep >= steps) {
        clearInterval(interval)
        setTimeout(() => setShowChart(true), 300)
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [data])

  const principalPercentage = (data.principal / data.totalAmount) * 100
  const interestPercentage = (data.interestAmount / data.totalAmount) * 100

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-sm text-secondary font-medium">
          <BarChart3 className="w-4 h-4" />
          Visual Breakdown
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Your Payment at a Glance
        </h2>
        <p className="text-muted-foreground">
          See exactly how much you&apos;ll pay, broken down simply
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        {/* EMI Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                Monthly
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">EMI Amount</p>
            <p className="text-3xl md:text-4xl font-bold text-foreground">
              {formatCurrency(animatedEmi)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Pay this amount every month
            </p>
          </CardContent>
        </Card>

        {/* Total Payment Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Payment</p>
            <p className="text-3xl md:text-4xl font-bold text-foreground">
              {formatCurrency(animatedTotal)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Total you&apos;ll pay over {data.tenure} months
            </p>
          </CardContent>
        </Card>

        {/* Interest Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-destructive/10 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-destructive to-destructive/60 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                {data.interestRate}% p.a.
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Extra Interest</p>
            <p className="text-3xl md:text-4xl font-bold text-destructive">
              {formatCurrency(animatedInterest)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Extra money to the lender
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tenure Info */}
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5" />
        <CardContent className="relative p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Loan Duration</p>
              <p className="text-2xl font-bold text-foreground">
                {data.tenure} months ({data.tenure / 12} years)
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="text-lg font-semibold text-foreground">
                {new Date(Date.now() + data.tenure * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Breakdown Chart */}
      <Card className={cn(
        "relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-700",
        showChart ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Payment Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {/* Visual Bar Chart */}
          <div className="space-y-4">
            {/* Principal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  Principal (What you borrowed)
                </span>
                <span className="font-bold text-foreground">{formatCurrency(data.principal)}</span>
              </div>
              <div className="relative h-8 bg-muted/30 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-success to-success/70 rounded-lg transition-all duration-1000"
                  style={{ width: `${principalPercentage}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white mix-blend-difference">
                  {principalPercentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Interest */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  Interest (Extra you pay)
                </span>
                <span className="font-bold text-destructive">{formatCurrency(data.interestAmount)}</span>
              </div>
              <div className="relative h-8 bg-muted/30 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-destructive to-destructive/70 rounded-lg transition-all duration-1000 delay-300"
                  style={{ width: `${interestPercentage}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white mix-blend-difference">
                  {interestPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
            <span className="text-muted-foreground">Total Payment</span>
            <span className="text-2xl font-bold text-foreground">{formatCurrency(data.totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
        <Button
          onClick={onComplete}
          size="lg"
          className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="flex items-center gap-3">
            Check Your Understanding
            <ArrowRight className="w-5 h-5" />
          </span>
        </Button>
      </div>
    </div>
  )
}
