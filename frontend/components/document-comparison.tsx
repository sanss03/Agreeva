"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  GitCompare,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trophy,
  IndianRupee,
  Percent,
  Calendar,
} from "lucide-react"

interface LoanOffer {
  id: string
  bankName: string
  loanAmount: number
  interestRate: number
  tenure: number
  processingFee: number
  emi: number
  totalPayable: number
}

const sampleOffers: LoanOffer[] = [
  {
    id: "1",
    bankName: "ABC Bank",
    loanAmount: 500000,
    interestRate: 12,
    tenure: 36,
    processingFee: 1,
    emi: 16607,
    totalPayable: 597852,
  },
  {
    id: "2",
    bankName: "XYZ Finance",
    loanAmount: 500000,
    interestRate: 10.5,
    tenure: 36,
    processingFee: 1.5,
    emi: 16254,
    totalPayable: 585144,
  },
  {
    id: "3",
    bankName: "Quick Loans",
    loanAmount: 500000,
    interestRate: 14,
    tenure: 36,
    processingFee: 0.5,
    emi: 17091,
    totalPayable: 615276,
  },
]

interface DocumentComparisonProps {
  className?: string
  isVisible?: boolean
}

export function DocumentComparison({ className, isVisible = true }: DocumentComparisonProps) {
  const [offers, setOffers] = useState<LoanOffer[]>(sampleOffers.slice(0, 2))
  const [showAddPanel, setShowAddPanel] = useState(false)

  if (!isVisible) return null

  const getBestValue = (key: keyof LoanOffer, lower = true) => {
    if (offers.length === 0) return null
    const values = offers.map((o) => o[key] as number)
    return lower ? Math.min(...values) : Math.max(...values)
  }

  const bestRate = getBestValue("interestRate")
  const bestEmi = getBestValue("emi")
  const bestTotal = getBestValue("totalPayable")
  const bestProcessing = getBestValue("processingFee")

  const addOffer = (offer: LoanOffer) => {
    if (offers.length < 3) {
      setOffers([...offers, offer])
    }
    setShowAddPanel(false)
  }

  const removeOffer = (id: string) => {
    setOffers(offers.filter((o) => o.id !== id))
  }

  const getOverallWinner = () => {
    if (offers.length < 2) return null
    let scores: Record<string, number> = {}
    offers.forEach((o) => {
      scores[o.id] = 0
      if (o.interestRate === bestRate) scores[o.id] += 3
      if (o.emi === bestEmi) scores[o.id] += 2
      if (o.totalPayable === bestTotal) scores[o.id] += 3
      if (o.processingFee === bestProcessing) scores[o.id] += 1
    })
    const winnerId = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
    return offers.find((o) => o.id === winnerId)
  }

  const winner = getOverallWinner()

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
        <CardHeader className="bg-gradient-to-r from-accent/10 to-secondary/10 border-b border-border/50">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg">
              <GitCompare className="h-5 w-5 text-accent" />
              Compare Offers
            </span>
            {offers.length < 3 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddPanel(true)}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Winner Banner */}
          <AnimatePresence>
            {winner && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="bg-gradient-to-r from-success/20 to-success/5 rounded-lg p-3 flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-success" />
                  <div>
                    <p className="text-sm font-medium text-success">
                      Best Option: {winner.bankName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Lowest overall cost based on interest and total payable
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comparison Grid */}
          <div className="space-y-4">
            {/* Offers */}
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${offers.length}, 1fr)` }}>
              {offers.map((offer) => (
                <motion.div
                  key={offer.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "rounded-xl border p-3 relative",
                    winner?.id === offer.id
                      ? "border-success bg-success/5"
                      : "border-border/50 bg-muted/30"
                  )}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive/10 hover:bg-destructive/20"
                    onClick={() => removeOffer(offer.id)}
                  >
                    <X className="h-3 w-3 text-destructive" />
                  </Button>

                  <div className="text-center mb-3">
                    <h4 className="font-semibold text-sm">{offer.bankName}</h4>
                    {winner?.id === offer.id && (
                      <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded-full">
                        BEST
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {/* Interest Rate */}
                    <div
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg text-xs",
                        offer.interestRate === bestRate
                          ? "bg-success/10"
                          : "bg-muted/50"
                      )}
                    >
                      <span className="flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        Rate
                      </span>
                      <span
                        className={cn(
                          "font-semibold",
                          offer.interestRate === bestRate && "text-success"
                        )}
                      >
                        {offer.interestRate}%
                        {offer.interestRate === bestRate && (
                          <CheckCircle2 className="h-3 w-3 inline ml-1" />
                        )}
                      </span>
                    </div>

                    {/* EMI */}
                    <div
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg text-xs",
                        offer.emi === bestEmi ? "bg-success/10" : "bg-muted/50"
                      )}
                    >
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        EMI
                      </span>
                      <span
                        className={cn(
                          "font-semibold",
                          offer.emi === bestEmi && "text-success"
                        )}
                      >
                        {offer.emi.toLocaleString()}
                        {offer.emi === bestEmi && (
                          <CheckCircle2 className="h-3 w-3 inline ml-1" />
                        )}
                      </span>
                    </div>

                    {/* Total Payable */}
                    <div
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg text-xs",
                        offer.totalPayable === bestTotal
                          ? "bg-success/10"
                          : "bg-muted/50"
                      )}
                    >
                      <span>Total</span>
                      <span
                        className={cn(
                          "font-semibold",
                          offer.totalPayable === bestTotal && "text-success"
                        )}
                      >
                        {formatCurrency(offer.totalPayable)}
                        {offer.totalPayable === bestTotal && (
                          <CheckCircle2 className="h-3 w-3 inline ml-1" />
                        )}
                      </span>
                    </div>

                    {/* Processing Fee */}
                    <div
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg text-xs",
                        offer.processingFee === bestProcessing
                          ? "bg-success/10"
                          : "bg-muted/50"
                      )}
                    >
                      <span>Fees</span>
                      <span
                        className={cn(
                          "font-semibold",
                          offer.processingFee === bestProcessing && "text-success"
                        )}
                      >
                        {offer.processingFee}%
                        {offer.processingFee === bestProcessing && (
                          <CheckCircle2 className="h-3 w-3 inline ml-1" />
                        )}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {offers.length === 0 && (
              <div className="text-center py-8">
                <GitCompare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Add offers to compare</p>
              </div>
            )}
          </div>

          {/* Add Panel */}
          <AnimatePresence>
            {showAddPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 border-t border-border/50 pt-4"
              >
                <p className="text-sm font-medium mb-3">Add an offer:</p>
                <div className="grid gap-2">
                  {sampleOffers
                    .filter((o) => !offers.find((existing) => existing.id === o.id))
                    .map((offer) => (
                      <button
                        key={offer.id}
                        onClick={() => addOffer(offer)}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-medium text-sm">{offer.bankName}</span>
                        <span className="text-xs text-muted-foreground">
                          {offer.interestRate}% | EMI: {offer.emi.toLocaleString()}
                        </span>
                      </button>
                    ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddPanel(false)}
                  className="w-full mt-2"
                >
                  Cancel
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
