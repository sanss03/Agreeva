"use client"

import { useState } from "react"
import { CheckCircle2, Shield, Mic, MicOff, FileCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import type { AgreementData } from "@/lib/types"
import { cn } from "@/lib/utils"

import { useLocale } from "next-intl"
import { translations, getLanguageKey } from "@/lib/translations"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface ConsentScreenProps {
  data: AgreementData
  quizPassed: boolean
  quizScore?: number
  quizTotal?: number
  documentName?: string
}

export function ConsentScreen({ data, quizPassed, quizScore, quizTotal, documentName }: ConsentScreenProps) {
  const locale = useLocale()
  const langKey = getLanguageKey(locale)
  const t = translations[langKey]
  const [consent1, setConsent1] = useState(false)
  const [consent2, setConsent2] = useState(false)
  const [consent3, setConsent3] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceConfirmed, setVoiceConfirmed] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null)

  const allConsentsGiven = consent1 && consent2 && consent3

  const handleVoiceConfirm = () => {
    setIsRecording(true)
    // Simulate voice recording
    setTimeout(() => {
      setIsRecording(false)
      setVoiceConfirmed(true)
    }, 3000)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const sessionRes = await fetch(`${API_BASE}/api/consent/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: "User",
          document_name: documentName || "Untitled document",
          document_summary: data.simplifiedPoints.join(". ")
        })
      })
      if (!sessionRes.ok) throw new Error("Could not start the consent session")
      const { session_id } = await sessionRes.json()

      const confirmRes = await fetch(`${API_BASE}/api/consent/session/${session_id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent_checks: {
            readUnderstood: consent1,
            financialCommitment: consent2,
            risksAcknowledged: consent3
          },
          voice_confirmed: voiceConfirmed,
          quiz_passed: quizPassed,
          quiz_score: quizScore,
          quiz_total: quizTotal
        })
      })
      if (!confirmRes.ok) {
        const errBody = await confirmRes.json().catch(() => null)
        throw new Error(errBody?.error || "Could not record your confirmation")
      }
      const confirmData = await confirmRes.json()
      setConfirmedAt(confirmData.timestamp || new Date().toISOString())
      setIsSubmitted(true)
    } catch (e) {
      console.error("Consent error:", e)
      setSubmitError(t.consent_submit_error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-success/30 blur-3xl rounded-full" />
            <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-success to-success/60 rounded-full flex items-center justify-center shadow-xl shadow-success/30">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t.consent_verified_title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {t.consent_verified_desc}
          </p>
        </div>

        <Card className="relative overflow-hidden border-success/30 bg-success/5 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{t.consent_id}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    SS-{Date.now().toString(36).toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-success font-bold text-sm">{t.consent_verified_badge}</p>
                <p className="text-[10px] text-muted-foreground">
                  {t.verified_on}: {new Date(confirmedAt || Date.now()).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{t.consent_document_label}</p>
              <p className="font-semibold text-foreground truncate" title={documentName}>
                {documentName || "Untitled document"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{t.date_time}</p>
              <p className="font-semibold text-foreground">
                {new Date(confirmedAt || Date.now()).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{t.consent_quiz_score_label}</p>
              <p className="font-semibold text-foreground">
                {typeof quizScore === "number" && typeof quizTotal === "number" && quizTotal > 0
                  ? `${quizScore} / ${quizTotal}`
                  : "-"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{t.verified_by}</p>
              <p className="font-semibold text-foreground flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Agreeva AI
              </p>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground max-w-md mx-auto">
          {t.consent_disclaimer}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-sm text-success font-medium">
          <Shield className="w-4 h-4" />
          {t.final_step}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {t.consent_title}
        </h2>
        <p className="text-muted-foreground">
          {t.consent_subtitle}
        </p>
      </div>

      {/* Agreement Summary */}
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            {t.agreement_summary}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t.loan_amount}</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(data.principal)}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t.monthly_emi}</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(data.emi)}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t.interest_rate}</p>
              <p className="text-lg font-bold text-foreground">{data.interestRate}%</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t.total_payment}</p>
              <p className="text-lg font-bold text-destructive">{formatCurrency(data.totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Status */}
      <Card
        className={cn(
          "relative overflow-hidden border-2 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-200",
          quizPassed
            ? "border-success/50 bg-success/5"
            : "border-warning/50 bg-warning/5"
        )}
      >
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                quizPassed
                  ? "bg-success text-success-foreground"
                  : "bg-warning text-warning-foreground"
              )}
            >
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className={cn("font-bold", quizPassed ? "text-success" : "text-warning")}>
                {quizPassed ? t.understanding_verified : t.partial_understanding}
              </p>
              <p className="text-sm text-muted-foreground">
                {quizPassed
                  ? t.quiz_all_correct
                  : t.quiz_review_needed}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent Checkboxes */}
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardContent className="relative p-6 space-y-4">
          <div
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer",
              consent1 ? "border-success/50 bg-success/5" : "border-border/50 hover:border-primary/30"
            )}
            onClick={() => setConsent1(!consent1)}
          >
            <Checkbox
              checked={consent1}
              onCheckedChange={(checked) => setConsent1(checked as boolean)}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-foreground">{t.consent_check_1}</p>
              <p className="text-sm text-muted-foreground">
                {t.consent_check_1_sub}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer",
              consent2 ? "border-success/50 bg-success/5" : "border-border/50 hover:border-primary/30"
            )}
            onClick={() => setConsent2(!consent2)}
          >
            <Checkbox
              checked={consent2}
              onCheckedChange={(checked) => setConsent2(checked as boolean)}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-foreground">{t.consent_check_2}</p>
              <p className="text-sm text-muted-foreground">
                {t.consent_check_2_sub.replace("{amount}", formatCurrency(data.emi)).replace("{tenure}", data.tenure.toString())}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer",
              consent3 ? "border-success/50 bg-success/5" : "border-border/50 hover:border-primary/30"
            )}
            onClick={() => setConsent3(!consent3)}
          >
            <Checkbox
              checked={consent3}
              onCheckedChange={(checked) => setConsent3(checked as boolean)}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-foreground">{t.consent_check_3}</p>
              <p className="text-sm text-muted-foreground">
                {t.consent_check_3_sub}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Confirmation (Optional) */}
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-9 duration-700 delay-400">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
        <CardContent className="relative p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t.voice_confirm_title}</p>
              <p className="text-sm text-muted-foreground">
                {t.voice_confirm_sub}
              </p>
            </div>
          </div>

          {voiceConfirmed ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/30">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="font-medium text-success">{t.voice_recorded}</span>
            </div>
          ) : (
            <Button
              onClick={handleVoiceConfirm}
              disabled={isRecording}
              variant="outline"
              className={cn(
                "w-full h-14 gap-3 transition-all duration-300",
                isRecording && "border-primary bg-primary/10"
              )}
            >
              {isRecording ? (
                <>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-4 bg-primary rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                  {t.voice_recording}
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  {t.voice_tap_record}
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground max-w-lg mx-auto">
        {t.consent_disclaimer}
      </p>

      {/* Submit Button */}
      <div className="flex justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
        <Button
          onClick={handleSubmit}
          disabled={!allConsentsGiven || isSubmitting}
          size="lg"
          className={cn(
            "h-16 px-10 text-lg font-bold transition-all duration-300 shadow-xl",
            allConsentsGiven
              ? "bg-gradient-to-r from-success to-success/80 hover:opacity-90 shadow-success/30 hover:shadow-2xl hover:shadow-success/40 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-3">
              <Spinner className="w-5 h-5" />
              {t.consent_submitting}
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              {t.consent}
            </span>
          )}
        </Button>
      </div>

      {submitError && (
        <p className="text-center text-sm text-destructive animate-in fade-in duration-300">
          {submitError}
        </p>
      )}

      {!allConsentsGiven && (
        <p className="text-center text-sm text-muted-foreground animate-in fade-in duration-300">
          {t.proceed_helper}
        </p>
      )}
    </div>
  )
}
