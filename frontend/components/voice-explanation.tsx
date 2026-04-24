"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, Volume2, ArrowRight, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AgreementData } from "@/lib/types"
import { cn } from "@/lib/utils"
import { SpeakButton } from '@/components/ui/speak-button'
import { useLocale } from "next-intl"
import { useTTS } from "@/hooks/useTTS"
import { translations, getLanguageKey } from "@/lib/translations"

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000"

interface VoiceExplanationProps {
  data: AgreementData
  onComplete: () => void
}

const languages = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧", voice: "en-US" },
  { code: "hi", name: "Hindi", native: "हिंदी", flag: "🇮🇳", voice: "hi-IN" },
  { code: "mr", name: "Marathi", native: "मराठी", flag: "🇮🇳", voice: "mr-IN" },
]

export function VoiceExplanation({ data, onComplete }: VoiceExplanationProps) {
  const locale = useLocale()
  const langKey = getLanguageKey(locale)
  const t = translations[langKey]
  const [selectedLang, setSelectedLang] = useState(locale)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [hasListened, setHasListened] = useState(false)
  
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis
      audioRef.current = new Audio()
      audioRef.current.onended = () => {
        setIsPlaying(false)
        setProgress(100)
        setHasListened(true)
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      }
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          const p = (audioRef.current.currentTime / audioRef.current.duration) * 100
          setProgress(p)
        }
      }
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  const { speak, stop, isSpeaking: checkIsSpeaking } = useTTS()

  const togglePlayback = () => {
    const payloadText = data.simplifiedPoints.join('. ') + '. ' +
      data.risks.map((r: { description: string }) => r.description).join('. ');

    if (isPlaying) {
      stop();
      setIsPlaying(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    if (progress >= 100) setProgress(0);
    setIsPlaying(true);

    speak(payloadText, selectedLang);

    // Monitor speech end
    const monitorInterval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setIsPlaying(false);
        setProgress(100);
        setHasListened(true);
        clearInterval(monitorInterval);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
    }, 500);

    // Simulate progress
    const estDuration = payloadText.length * 85; // approximate duration
    const start = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const p = Math.min(((Date.now() - start) / estDuration) * 100, 99.5);
      setProgress(p);
    }, 200);
  }

  const [waveformTick, setWaveformTick] = useState(0)

  useEffect(() => {
    let animationId: number
    if (isPlaying) {
      const animate = () => {
        setWaveformTick((prev) => prev + 1)
        animationId = requestAnimationFrame(animate)
      }
      animationId = requestAnimationFrame(animate)
    }
    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [isPlaying])

  const AudioWaveform = () => {
    return (
      <div className="flex items-center justify-center gap-1 h-20">
        {Array.from({ length: 40 }).map((_, i) => {
          const height = isPlaying
            ? Math.sin((waveformTick / 10 + i) * 0.5) * 30 + 35
            : 20
          return (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-75",
                isPlaying
                  ? "bg-gradient-to-t from-primary to-accent"
                  : "bg-muted-foreground/30"
              )}
              style={{
                height: `${height}%`,
                opacity: isPlaying ? 0.6 + Math.sin((waveformTick / 8 + i) * 0.3) * 0.4 : 0.3,
              }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm text-accent font-medium">
          <Volume2 className="w-4 h-4" />
          {t.voice_header}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {t.voice_title_main}
        </h2>
        <p className="text-muted-foreground">
          {t.voice_desc}
        </p>
      </div>

      {/* Language Selector */}
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            {t.voice_select_lang}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-muted-foreground">{t.voice_select_lang}:</p>
            <div className="flex gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिन्दी' },
                { code: 'mr', label: 'मराठी' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    selectedLang === lang.code 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang.code)
                  setProgress(0)
                  if (isPlaying) togglePlayback() // stop if playing
                }}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-300 text-center",
                  selectedLang === lang.code
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border/50 bg-muted/30 hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                <span className="text-2xl mb-2 block">{lang.flag}</span>
                <span className="font-semibold text-foreground block">
                  {lang.native}
                </span>
                <span className="text-xs text-muted-foreground">{lang.name}</span>
              </button>
            ))}
          </div>
          
          <div className="flex justify-center pt-4">
            <SpeakButton 
              text={data.simplifiedPoints.join('. ')} 
              language={selectedLang}
              size="md"
              className="bg-primary/10 hover:bg-primary/20"
            />
            <span className="ml-2 text-sm text-muted-foreground flex items-center">Listen to full summary</span>
          </div>
        </CardContent>
      </Card>

      {/* Audio Player */}
      <div className="pt-8 text-center">
        <h3 className="text-xl font-bold text-foreground mb-4">{t.voice_listen_in}</h3>
        <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <CardContent className="relative p-6 md:p-8">
            {/* Waveform Visualization */}
            <div className="mb-6 overflow-hidden rounded-xl bg-muted/30 p-4">
              <AudioWaveform />
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Playing locally...</span>
                <span>{Math.floor(progress)}%</span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent transition-all duration-100 rounded-full"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-100",
                    !isPlaying && progress === 0 && "opacity-0"
                  )}
                  style={{ left: `calc(${progress}% - 8px)` }}
                />
              </div>
            </div>

            {/* Play Button */}
            <div className="flex justify-center">
              <button
                onClick={togglePlayback}
                className={cn(
                  "relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                  "bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/30",
                  "hover:scale-105 hover:shadow-2xl hover:shadow-primary/40",
                  "active:scale-95"
                )}
              >
                {isPlaying && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                  </>
                )}
                <div className="relative">
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </div>
              </button>
            </div>

            {/* Helper Text */}
            <p className="text-center text-sm text-muted-foreground mt-4">
              {isPlaying
                ? t.voice_playing
                : progress >= 100
                ? t.voice_complete
                : t.voice_tap}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
        <Button
          onClick={onComplete}
          disabled={!hasListened && progress < 30}
          size="lg"
          className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
        >
          <span className="flex items-center gap-3">
            {t.voice_proceed}
            <ArrowRight className="w-5 h-5" />
          </span>
        </Button>
      </div>
    </div>
  )
}
