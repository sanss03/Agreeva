"use client"

import { cn } from "@/lib/utils"
import { 
  Home, 
  Upload, 
  Sparkles, 
  Mic2, 
  BarChart3, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2,
  Calculator
} from "lucide-react"

interface SectionNavigationProps {
  sections: { id: string; label: string }[]
  activeSection: string
  onSectionClick: (id: string) => void
  hasData: boolean
}

const sectionIcons: Record<string, React.ElementType> = {
  hero: Home,
  upload: Upload,
  simplify: Sparkles,
  voice: Mic2,
  breakdown: BarChart3,
  quiz: HelpCircle,
  risks: AlertTriangle,
  consent: CheckCircle2,
  calculator: Calculator,
}

export function SectionNavigation({
  sections,
  activeSection,
  onSectionClick,
  hasData,
}: SectionNavigationProps) {
  // Calculate progress
  const currentIndex = sections.findIndex((s) => s.id === activeSection)
  const progressPercent = ((currentIndex + 1) / sections.length) * 100

  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        {/* Progress Bar */}
        <div className="h-1 bg-muted -mx-4">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Navigation */}
        <div className="py-3 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 md:gap-2 min-w-max">
            {sections.map((section, index) => {
              const Icon = sectionIcons[section.id] || Home
              const isActive = activeSection === section.id
              const isLocked = !hasData && index > 1 && section.id !== "calculator"
              const isPast = currentIndex > index

              return (
                <button
                  key={section.id}
                  onClick={() => !isLocked && onSectionClick(section.id)}
                  disabled={isLocked}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : isPast
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : isLocked
                      ? "text-muted-foreground/40 cursor-not-allowed"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{section.label}</span>
                  {isPast && !isActive && (
                    <CheckCircle2 className="w-3 h-3 text-success" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
