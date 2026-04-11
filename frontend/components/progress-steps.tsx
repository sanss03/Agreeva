"use client"

import { cn } from "@/lib/utils"
import { Upload, FileText, Volume2, BarChart3, HelpCircle, AlertTriangle, CheckCircle } from "lucide-react"
import type { Step } from "@/app/page"

interface ProgressStepsProps {
  currentStep: Step
  onStepClick: (step: Step) => void
  hasData: boolean
}

const steps = [
  { id: 1, label: "Upload", icon: Upload, shortLabel: "1" },
  { id: 2, label: "Simplify", icon: FileText, shortLabel: "2" },
  { id: 3, label: "Listen", icon: Volume2, shortLabel: "3" },
  { id: 4, label: "Visual", icon: BarChart3, shortLabel: "4" },
  { id: 5, label: "Quiz", icon: HelpCircle, shortLabel: "5" },
  { id: 6, label: "Risks", icon: AlertTriangle, shortLabel: "6" },
  { id: 7, label: "Consent", icon: CheckCircle, shortLabel: "7" },
]

export function ProgressSteps({ currentStep, onStepClick, hasData }: ProgressStepsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Mobile Progress Bar */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep} of 7
          </span>
          <span className="text-sm text-muted-foreground">
            {steps[currentStep - 1].label}
          </span>
        </div>
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out rounded-full"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep
            const isCurrent = step.id === currentStep
            return (
              <button
                key={step.id}
                onClick={() => hasData && step.id <= currentStep && onStepClick(step.id as Step)}
                disabled={!hasData || step.id > currentStep}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 scale-110",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {step.shortLabel}
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop Progress Steps */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-muted/50 rounded-full -z-10" />
        
        {/* Progress Line Fill */}
        <div 
          className="absolute top-6 left-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-700 ease-out -z-10"
          style={{ width: `${((currentStep - 1) / 6) * 100}%` }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isClickable = hasData && step.id <= currentStep

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick(step.id as Step)}
              disabled={!isClickable}
              className={cn(
                "relative flex flex-col items-center gap-2 group transition-all duration-300",
                isClickable && "cursor-pointer",
                !isClickable && "cursor-not-allowed opacity-50"
              )}
            >
              {/* Step Circle */}
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-2",
                  isCompleted && "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30",
                  isCurrent && "bg-gradient-to-br from-primary to-accent border-transparent text-white shadow-xl shadow-primary/40 scale-110",
                  !isCompleted && !isCurrent && "bg-muted/50 border-border text-muted-foreground",
                  isClickable && "hover:scale-105 hover:shadow-lg"
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              {/* Step Label */}
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-300",
                  isCurrent && "text-foreground",
                  !isCurrent && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>

              {/* Current Step Indicator */}
              {isCurrent && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
