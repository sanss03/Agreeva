"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Book, Search, X, ChevronRight, Lightbulb } from "lucide-react"

const glossaryTerms = [
  {
    term: "EMI",
    fullForm: "Equated Monthly Installment",
    simple: "The fixed amount you pay every month until your loan is fully repaid.",
    example: "If you borrow 5 lakh, your EMI might be 16,000 per month for 3 years.",
  },
  {
    term: "Interest Rate",
    fullForm: "Annual Percentage Rate",
    simple: "The extra money you pay for borrowing. Higher rate = more expensive loan.",
    example: "12% interest means you pay 12 rupees extra for every 100 rupees borrowed per year.",
  },
  {
    term: "Principal",
    fullForm: "Principal Amount",
    simple: "The actual money you borrowed, not including interest.",
    example: "If you borrow 5 lakh, that 5 lakh is your principal.",
  },
  {
    term: "Tenure",
    fullForm: "Loan Tenure",
    simple: "How long you have to repay the loan, usually in months or years.",
    example: "36 months tenure means you have 3 years to pay back the loan.",
  },
  {
    term: "Processing Fee",
    fullForm: "Loan Processing Fee",
    simple: "A one-time charge the bank takes for processing your loan application.",
    example: "1% processing fee on 5 lakh loan = 5,000 rupees charged once.",
  },
  {
    term: "Collateral",
    fullForm: "Security/Collateral",
    simple: "Something valuable you promise to give if you cannot repay the loan.",
    example: "Your house or gold can be collateral for a loan.",
  },
  {
    term: "Default",
    fullForm: "Loan Default",
    simple: "When you fail to pay your EMI on time. This damages your credit score.",
    example: "Missing 3 EMIs in a row may be considered default.",
  },
  {
    term: "Prepayment",
    fullForm: "Loan Prepayment",
    simple: "Paying extra money to finish your loan faster than planned.",
    example: "Paying 50,000 extra can reduce your remaining EMIs.",
  },
  {
    term: "Credit Score",
    fullForm: "CIBIL Score",
    simple: "A number (300-900) showing how trustworthy you are for loans. Higher is better.",
    example: "Score above 750 means you can get loans easily at lower rates.",
  },
  {
    term: "Foreclosure",
    fullForm: "Loan Foreclosure",
    simple: "Paying off your entire remaining loan at once before the tenure ends.",
    example: "Closing a 3-year loan in 1 year by paying the full amount.",
  },
]

interface FinancialGlossaryProps {
  className?: string
}

export function FinancialGlossary({ className }: FinancialGlossaryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null)

  const filteredTerms = glossaryTerms.filter(
    (item) =>
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.simple.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed top-1/2 right-0 -translate-y-1/2 z-40"
        initial={{ x: 50 }}
        animate={{ x: 0 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "rounded-l-xl rounded-r-none h-auto py-3 px-2",
            "bg-gradient-to-b from-primary to-accent",
            "hover:px-3 transition-all duration-300",
            "shadow-lg"
          )}
        >
          <div className="flex flex-col items-center gap-1">
            <Book className="h-5 w-5" />
            <span className="text-[10px] font-medium writing-mode-vertical">
              Glossary
            </span>
          </div>
        </Button>
      </motion.div>

      {/* Glossary Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "fixed top-0 right-0 h-full w-full max-w-md z-50",
                "bg-card border-l border-border/50 shadow-2xl",
                "flex flex-col"
              )}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Book className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Financial Glossary</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Simple explanations of financial terms
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search terms..."
                    className="pl-9 bg-background/50"
                  />
                </div>
              </div>

              {/* Terms List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredTerms.map((item) => (
                  <motion.div
                    key={item.term}
                    layout
                    className={cn(
                      "rounded-xl border border-border/50 overflow-hidden",
                      "transition-all duration-200",
                      expandedTerm === item.term
                        ? "bg-primary/5 border-primary/30"
                        : "bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    <button
                      onClick={() =>
                        setExpandedTerm(
                          expandedTerm === item.term ? null : item.term
                        )
                      }
                      className="w-full p-4 flex items-center justify-between text-left"
                    >
                      <div>
                        <h3 className="font-semibold text-primary">{item.term}</h3>
                        <p className="text-xs text-muted-foreground">
                          {item.fullForm}
                        </p>
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform",
                          expandedTerm === item.term && "rotate-90"
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedTerm === item.term && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 pb-4"
                        >
                          <div className="space-y-3">
                            <div className="bg-background/50 rounded-lg p-3">
                              <p className="text-sm">{item.simple}</p>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                              <p>{item.example}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {filteredTerms.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No terms found</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border/50">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Tap on any term to learn more about it
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
