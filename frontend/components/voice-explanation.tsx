"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, Volume2, ArrowRight, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AgreementData } from "@/lib/types"
import { cn } from "@/lib/utils"

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
  const [selectedLang, setSelectedLang] = useState("en")
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

  const togglePlayback = async () => {
    const payloadText = data.simplifiedPoints.join('. ') + '. ' +
      data.risks.map((r: { description: string }) => r.description).join('. ');

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    // Start playback
    if (progress >= 100) setProgress(0);
    setIsPlaying(true);

    try {
      console.log(`Starting TTS for language: ${selectedLang}`)
      const response = await fetch(`${API_BASE}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: payloadText,
          lang: selectedLang,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('TTS API Error:', response.status, errorData)
        throw new Error(`TTS request failed: ${response.status}`)
      }

      const audioBlob = await response.blob();
      console.log(`Received audio blob: ${audioBlob.size} bytes`)
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current.src = audioUrl;
        console.log(`Playing audio from blob URL`)
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlaying(false);
      // Fallback to browser TTS
      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(payloadText);
        const targetLang = languages.find(l => l.code === selectedLang)?.voice || "en-US";
        utterance.lang = targetLang;
        utterance.rate = 0.9;

        utterance.onend = () => {
          setIsPlaying(false);
          setProgress(100);
          setHasListened(true);
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };

        synthRef.current.speak(utterance);

        // Simulate progress
        const estDuration = payloadText.length * 60;
        const start = Date.now();

        progressIntervalRef.current = setInterval(() => {
          if (!synthRef.current?.speaking) return;
          const p = Math.min(((Date.now() - start) / estDuration) * 100, 99);
          setProgress(p);
        }, 200);
      }
    }
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
          Voice Explanation
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Listen to Your Explanation
        </h2>
        <p className="text-muted-foreground">
          Hear the agreement read aloud by our Voice Assistant
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
            Select Voice Language
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
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
        </CardContent>
      </Card>

      {/* Audio Player */}
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
              ? "Reading aloud..."
              : progress >= 100
              ? "Playback complete! You can replay or continue."
              : "Tap to listen to the explanation aloud"}
          </p>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
        <Button
          onClick={onComplete}
          disabled={!hasListened && progress < 30}
          size="lg"
          className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
        >
          <span className="flex items-center gap-3">
            View Visual Breakdown
            <ArrowRight className="w-5 h-5" />
          </span>
        </Button>
      </div>
    </div>
  )
}
