"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Calculator, IndianRupee, Percent, Calendar, TrendingUp, PieChart } from "lucide-react"

interface EMICalculatorProps {
  className?: string
}

export function EMICalculator({ className }: EMICalculatorProps) {
  const [principal, setPrincipal] = useState(500000)
  const [rate, setRate] = useState(12)
  const [tenure, setTenure] = useState(36)

  const calculations = useMemo(() => {
    const monthlyRate = rate / 12 / 100
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1)
    const totalAmount = emi * tenure
    const totalInterest = totalAmount - principal

    return {
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      principalPercent: Math.round((principal / totalAmount) * 100),
      interestPercent: Math.round((totalInterest / totalAmount) * 100),
    }
  }, [principal, rate, tenure])

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `${(amount / 100000).toFixed(2)}L`
    }
    return amount.toLocaleString("en-IN")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5 text-primary" />
            EMI Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Principal Amount */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                Loan Amount
              </label>
              <span className="text-sm font-semibold text-primary">
                {formatCurrency(principal)}
              </span>
            </div>
            <Slider
              value={[principal]}
              onValueChange={([v]) => setPrincipal(v)}
              min={50000}
              max={5000000}
              step={50000}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50K</span>
              <span>50L</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                Interest Rate (p.a.)
              </label>
              <span className="text-sm font-semibold text-primary">{rate}%</span>
            </div>
            <Slider
              value={[rate]}
              onValueChange={([v]) => setRate(v)}
              min={5}
              max={25}
              step={0.5}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5%</span>
              <span>25%</span>
            </div>
          </div>

          {/* Tenure */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Loan Tenure
              </label>
              <span className="text-sm font-semibold text-primary">{tenure} months</span>
            </div>
            <Slider
              value={[tenure]}
              onValueChange={([v]) => setTenure(v)}
              min={6}
              max={84}
              step={6}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>6 mo</span>
              <span>84 mo</span>
            </div>
          </div>

          {/* Results */}
          <div className="pt-4 border-t border-border/50 space-y-4">
            {/* EMI */}
            <motion.div
              key={calculations.emi}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-primary to-accent rounded-xl p-4 text-center"
            >
              <p className="text-sm text-white/80 mb-1">Monthly EMI</p>
              <p className="text-3xl font-bold text-white flex items-center justify-center gap-1">
                <IndianRupee className="h-6 w-6" />
                {calculations.emi.toLocaleString("en-IN")}
              </p>
            </motion.div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Principal</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(principal)}
                </p>
              </div>
              <div className="bg-destructive/10 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
                <p className="text-lg font-semibold text-destructive">
                  {formatCurrency(calculations.totalInterest)}
                </p>
              </div>
            </div>

            {/* Visual Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <PieChart className="h-4 w-4" />
                  Total Payable
                </span>
                <span className="font-semibold">
                  {formatCurrency(calculations.totalAmount)}
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden bg-muted flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculations.principalPercent}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-primary to-accent"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculations.interestPercent}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-destructive/60"
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Principal ({calculations.principalPercent}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-destructive/60" />
                  Interest ({calculations.interestPercent}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
