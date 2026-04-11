"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Phone, X, Shield, HeadphonesIcon, Building2, AlertTriangle, ExternalLink } from "lucide-react"

const helplines = [
  {
    name: "RBI Helpline",
    number: "14440",
    description: "Reserve Bank of India customer helpline",
    icon: Building2,
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Banking Ombudsman",
    number: "1800-425-3800",
    description: "Free complaint resolution for banking issues",
    icon: Shield,
    color: "from-green-500 to-green-600",
  },
  {
    name: "Cyber Crime",
    number: "1930",
    description: "Report online financial fraud",
    icon: AlertTriangle,
    color: "from-red-500 to-red-600",
  },
  {
    name: "Consumer Helpline",
    number: "1800-11-4000",
    description: "National Consumer Helpline (NCH)",
    icon: HeadphonesIcon,
    color: "from-purple-500 to-purple-600",
  },
]

export function EmergencyHelpline() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating SOS Button */}
      <motion.div
        className="fixed top-1/2 left-0 -translate-y-1/2 z-40"
        initial={{ x: -50 }}
        animate={{ x: 0 }}
        transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "rounded-r-xl rounded-l-none h-auto py-3 px-2",
            "bg-indigo-600 hover:bg-indigo-700 text-white",
            "hover:px-3 transition-all duration-300",
            "shadow-md shadow-indigo-200"
          )}
        >
          <div className="flex flex-col items-center gap-1">
            <Phone className="h-5 w-5 animate-pulse" />
            <span className="text-[10px] font-medium">Help</span>
          </div>
        </Button>
      </motion.div>

      {/* Helpline Panel */}
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
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "fixed top-0 left-0 h-full w-full max-w-sm z-50",
                "bg-card border-r border-border/50 shadow-2xl",
                "flex flex-col"
              )}
            >
              {/* Header */}
              <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-indigo-900">Emergency Help</h2>
                      <p className="text-xs text-muted-foreground">
                        Financial assistance helplines
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Helplines */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {helplines.map((helpline) => (
                  <motion.a
                    key={helpline.number}
                    href={`tel:${helpline.number}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "block rounded-xl overflow-hidden",
                      "border border-border/50 bg-muted/30",
                      "hover:border-primary/30 transition-all"
                    )}
                  >
                    <div className={cn("h-1 bg-gradient-to-r", helpline.color)} />
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center",
                            "bg-gradient-to-br",
                            helpline.color
                          )}
                        >
                          <helpline.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{helpline.name}</h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            {helpline.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">
                              {helpline.number}
                            </span>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border/50">
                <div className="bg-warning/10 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-warning font-medium">
                      Important Notice
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Never share OTP, PIN, or passwords with anyone. Banks never ask for these details over phone.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
