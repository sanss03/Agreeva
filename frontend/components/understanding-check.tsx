"use client"

import { useState } from "react"
import { HelpCircle, CheckCircle2, XCircle, ArrowRight } from "lucide-react"
import { useLocale } from "next-intl"
import { translations, getLanguageKey } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AgreementData } from "@/lib/types"
import { cn } from "@/lib/utils"

interface UnderstandingCheckProps {
  data: AgreementData
  onComplete: (result: { correctCount: number; total: number; passed: boolean }) => void
}

export function UnderstandingCheck({ data, onComplete }: UnderstandingCheckProps) {
  const locale = useLocale()
  const langKey = getLanguageKey(locale)
  const t = translations[langKey]

  // Questions come from the AI analysis, grounded only in facts present in
  // the uploaded document (see backend/routes/simplify.js). If the document
  // didn't yield enough concrete facts, this can be empty - handled below.
  const questions = data.questions ?? []

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  )
  const [showResult, setShowResult] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-sm text-muted-foreground font-medium">
            <HelpCircle className="w-4 h-4" />
            {t.check_header}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {t.check_unavailable_title}
          </h2>
          <p className="text-muted-foreground">
            {t.check_unavailable_desc}
          </p>
        </div>
        <div className="flex justify-center">
          <Button
            onClick={() => onComplete({ correctCount: 0, total: 0, passed: true })}
            size="lg"
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/25"
          >
            <span className="flex items-center gap-3">
              {t.check_view_risks}
              <ArrowRight className="w-5 h-5" />
            </span>
          </Button>
        </div>
      </div>
    )
  }

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = optionIndex
    setSelectedAnswers(newAnswers)
    setShowExplanation(true)
  }

  const handleNext = () => {
    setShowExplanation(false)
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      setShowResult(true)
    }
  }

  const currentQ = questions[currentQuestion]
  const selectedOption = selectedAnswers[currentQuestion]
  const isCorrect = selectedOption !== null && currentQ.options[selectedOption].isCorrect
  const correctCount = selectedAnswers.filter(
    (answer, index) => answer !== null && questions[index].options[answer].isCorrect
  ).length

  if (showResult) {
    const allCorrect = correctCount === questions.length
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
              allCorrect
                ? "bg-success/10 border border-success/20 text-success"
                : "bg-warning/10 border border-warning/20 text-warning"
            )}
          >
            {allCorrect ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <HelpCircle className="w-4 h-4" />
            )}
            {allCorrect ? t.check_perfect : t.check_good}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {allCorrect
              ? t.check_understand
              : `${t.check_got} ${correctCount} ${t.check_of} ${questions.length} ${t.check_right}`}
          </h2>
          <p className="text-muted-foreground">
            {allCorrect
              ? t.check_great
              : t.check_worry}
          </p>
        </div>

        <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <CardContent className="relative p-6 md:p-8">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {questions.map((_, index) => {
                const answer = selectedAnswers[index]
                const correct = answer !== null && questions[index].options[answer].isCorrect
                return (
                  <div
                    key={index}
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300",
                      correct
                        ? "bg-success text-success-foreground shadow-lg shadow-success/30"
                        : "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30"
                    )}
                  >
                    {correct ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={() => onComplete({
              correctCount,
              total: questions.length,
              passed: correctCount === questions.length,
            })}
            size="lg"
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              {t.check_view_risks}
              <ArrowRight className="w-5 h-5" />
            </span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium">
          <HelpCircle className="w-4 h-4" />
          {t.check_question} {currentQuestion + 1} {t.check_of} {questions.length}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {t.check_header}
        </h2>
        <p className="text-muted-foreground">
          {t.check_desc}
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-5 duration-600 delay-100">
        {questions.map((_, index) => (
          <div
            key={index}
            className={cn(
              "flex-1 h-2 rounded-full transition-all duration-300",
              index < currentQuestion
                ? selectedAnswers[index] !== null && questions[index].options[selectedAnswers[index]!].isCorrect
                  ? "bg-success"
                  : "bg-destructive"
                : index === currentQuestion
                ? "bg-primary"
                : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Question Card */}
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardHeader className="relative pb-4">
          <CardTitle className="text-xl text-center">{currentQ.question}</CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-3">
          {currentQ.options.map((option, index) => {
            const isSelected = selectedOption === index
            const showCorrectness = showExplanation && isSelected

            return (
              <button
                key={index}
                onClick={() => !showExplanation && handleAnswer(index)}
                disabled={showExplanation}
                className={cn(
                  "w-full p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-300",
                  !showExplanation && "hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02]",
                  isSelected && !showExplanation && "border-primary bg-primary/10",
                  showCorrectness && option.isCorrect && "border-success bg-success/10",
                  showCorrectness && !option.isCorrect && "border-destructive bg-destructive/10",
                  !isSelected && showExplanation && option.isCorrect && "border-success/50 bg-success/5",
                  !isSelected && !showExplanation && "border-border/50 bg-muted/30"
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all duration-300",
                      isSelected && !showExplanation && "bg-primary text-primary-foreground",
                      showCorrectness && option.isCorrect && "bg-success text-success-foreground",
                      showCorrectness && !option.isCorrect && "bg-destructive text-destructive-foreground",
                      !isSelected && showExplanation && option.isCorrect && "bg-success/50 text-success-foreground",
                      !isSelected && !showExplanation && "bg-muted text-muted-foreground"
                    )}
                  >
                    {showCorrectness ? (
                      option.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>
                  <span className="text-lg font-medium text-foreground">{option.text}</span>
                </div>
              </button>
            )
          })}
        </CardContent>
      </Card>

      {/* Explanation */}
      {showExplanation && (
        <Card
          className={cn(
            "relative overflow-hidden border-2 animate-in fade-in slide-in-from-bottom-4 duration-300",
            isCorrect ? "border-success/50 bg-success/5" : "border-warning/50 bg-warning/5"
          )}
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  isCorrect ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"
                )}
              >
                {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
              </div>
              <div>
                <p className={cn("font-semibold mb-1", isCorrect ? "text-success" : "text-warning")}>
                  {isCorrect ? t.check_correct : t.check_incorrect}
                </p>
                <p className="text-foreground">{currentQ.explanation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Button */}
      {showExplanation && (
        <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Button
            onClick={handleNext}
            size="lg"
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              {currentQuestion < questions.length - 1 ? t.check_next : t.check_results}
              <ArrowRight className="w-5 h-5" />
            </span>
          </Button>
        </div>
      )}
    </div>
  )
}
