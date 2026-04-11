"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Accessibility,
  X,
  Type,
  Sun,
  Moon,
  Volume2,
  Eye,
  Contrast,
  RotateCcw,
} from "lucide-react"

interface AccessibilityPanelProps {
  onFontSizeChange: (size: number) => void
  onHighContrastChange: (enabled: boolean) => void
  onReduceMotionChange: (enabled: boolean) => void
  fontSize: number
  highContrast: boolean
  reduceMotion: boolean
}

export function AccessibilityPanel({
  onFontSizeChange,
  onHighContrastChange,
  onReduceMotionChange,
  fontSize,
  highContrast,
  reduceMotion,
}: AccessibilityPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const resetAll = () => {
    onFontSizeChange(100)
    onHighContrastChange(false)
    onReduceMotionChange(false)
  }

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 left-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className={cn(
            "h-12 w-12 rounded-full shadow-lg transition-all duration-300",
            "bg-card/80 backdrop-blur-sm border-border/50",
            "hover:scale-110 hover:shadow-xl hover:bg-primary hover:text-primary-foreground",
            isOpen && "bg-primary text-primary-foreground"
          )}
          size="icon"
        >
          <Accessibility className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed bottom-24 left-6 z-50 w-[300px]",
              "rounded-2xl border border-border/50 shadow-2xl overflow-hidden",
              "bg-card/95 backdrop-blur-xl"
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Accessibility className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Accessibility</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Customize your viewing experience
              </p>
            </div>

            {/* Options */}
            <div className="p-4 space-y-5">
              {/* Font Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    Text Size
                  </label>
                  <span className="text-sm text-primary font-medium">{fontSize}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs">A</span>
                  <Slider
                    value={[fontSize]}
                    onValueChange={([v]) => onFontSizeChange(v)}
                    min={80}
                    max={150}
                    step={10}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold">A</span>
                </div>
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Contrast className="h-4 w-4 text-muted-foreground" />
                  High Contrast
                </label>
                <Switch
                  checked={highContrast}
                  onCheckedChange={onHighContrastChange}
                />
              </div>

              {/* Reduce Motion */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  Reduce Motion
                </label>
                <Switch
                  checked={reduceMotion}
                  onCheckedChange={onReduceMotionChange}
                />
              </div>

              {/* Reset */}
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={resetAll}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  These settings help make content easier to read and use
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
