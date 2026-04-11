"use client"

import { useState } from "react"
import { CheckCircle2, Shield, Mic, MicOff, FileCheck, Sparkles, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { AgreementData } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ConsentScreenProps {
  data: AgreementData
  quizPassed: boolean
}

export function ConsentScreen({ data, quizPassed }: ConsentScreenProps) {
  const [consent1, setConsent1] = useState(false)
  const [consent2, setConsent2] = useState(false)
  const [consent3, setConsent3] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceConfirmed, setVoiceConfirmed] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

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
    try {
      const sessionRes = await fetch("http://localhost:5000/api/consent/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: "User",
          document_summary: data.simplifiedPoints.join(". ")
        })
      })
      const { session_id } = await sessionRes.json()
      await fetch(`http://localhost:5000/api/consent/session/${session_id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent_checks: {
            readUnderstood: consent1,
            financialCommitment: consent2,
            risksAcknowledged: consent3
          },
          voice_confirmed: voiceConfirmed,
          quiz_passed: quizPassed
        })
      })
    } catch (e) {
      console.error("Consent error:", e)
    }
    setIsSubmitted(true)
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
            Consent Verified!
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Your informed consent has been recorded securely. You can now proceed with the agreement.
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
                  <p className="font-semibold text-foreground">Consent ID</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    SS-{Date.now().toString(36).toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Verified By</p>
              <p className="font-semibold text-foreground flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                SamarthaSign AI
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Date & Time</p>
              <p className="font-semibold text-foreground">
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-sm text-success font-medium">
          <Shield className="w-4 h-4" />
          Final Step
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Verified Consent
        </h2>
        <p className="text-muted-foreground">
          Review the summary and confirm your understanding
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
            Agreement Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground mb-1">Loan Amount</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(data.principal)}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground mb-1">Monthly EMI</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(data.emi)}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
              <p className="text-lg font-bold text-foreground">{data.interestRate}%</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Payment</p>
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
                {quizPassed ? "Understanding Verified" : "Partial Understanding"}
              </p>
              <p className="text-sm text-muted-foreground">
                {quizPassed
                  ? "You answered all questions correctly"
                  : "You may want to review the agreement again"}
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
              <p className="font-medium text-foreground">I have read and understood the agreement</p>
              <p className="text-sm text-muted-foreground">
                Including all terms, conditions, and my obligations
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
              <p className="font-medium text-foreground">I understand the financial commitments</p>
              <p className="text-sm text-muted-foreground">
                Including EMI of {formatCurrency(data.emi)}/month for {data.tenure} months
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
              <p className="font-medium text-foreground">I acknowledge all risks and penalties</p>
              <p className="text-sm text-muted-foreground">
                Including late fees and consequences of missed payments
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
              <p className="font-semibold text-foreground">Voice Confirmation (Optional)</p>
              <p className="text-sm text-muted-foreground">
                Say &ldquo;I agree to this loan&rdquo; for additional verification
              </p>
            </div>
          </div>

          {voiceConfirmed ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/30">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="font-medium text-success">Voice confirmation recorded</span>
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
                  Recording... Speak now
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Tap to Record Voice
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
        <Button
          onClick={handleSubmit}
          disabled={!allConsentsGiven}
          size="lg"
          className={cn(
            "h-16 px-10 text-lg font-bold transition-all duration-300 shadow-xl",
            allConsentsGiven
              ? "bg-gradient-to-r from-success to-success/80 hover:opacity-90 shadow-success/30 hover:shadow-2xl hover:shadow-success/40 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <span className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            Give My Verified Consent
          </span>
        </Button>
      </div>

      {!allConsentsGiven && (
        <p className="text-center text-sm text-muted-foreground animate-in fade-in duration-300">
          Please check all boxes above to proceed
        </p>
      )}
    </div>
  )
}
