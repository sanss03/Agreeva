import { useCallback, useEffect, useRef, useState } from 'react'

export type TTSStatus = 'idle' | 'playing' | 'paused'

interface SpeakOptions {
  onEnd?: () => void
  onBoundary?: (progress: number) => void
}

export function useTTS() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [status, setStatus] = useState<TTSStatus>('idle')

  const speak = useCallback((text: string, language: string = 'en', options: SpeakOptions = {}) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    // Stop any current speech
    window.speechSynthesis.cancel()

    // Clean text - remove special chars
    const cleanText = text
      .replace(/[*#]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!cleanText) return

    const synth = window.speechSynthesis
    const utterance = new SpeechSynthesisUtterance(cleanText)
    const voices = synth.getVoices()

    const normalizedLang = language.toLowerCase()
    let selectedVoice

    if (normalizedLang === "hindi" || normalizedLang === "hi") {
      selectedVoice = voices.find(v => v.lang.includes("hi"));
    } else if (normalizedLang === "marathi" || normalizedLang === "mr") {
      selectedVoice =
        voices.find(v => v.lang.includes("mr")) ||
        voices.find(v => v.lang.includes("hi")); // fallback to hindi for marathi
    } else {
      selectedVoice = voices.find(v => v.lang.includes("en"));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      // Fallback to simple lang code if no explicit voice found
      const langMap: Record<string, string> = {
        english: "en-IN", en: "en-IN",
        hindi: "hi-IN", hi: "hi-IN",
        marathi: "hi-IN", mr: "hi-IN" // Fallback to Hindi-India for Marathi if no voice found
      }
      utterance.lang = langMap[normalizedLang] || "en-IN";
    }

    utterance.rate = 0.9;  // Slightly slow for better understanding
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setStatus('playing')
    utterance.onpause = () => setStatus('paused')
    utterance.onresume = () => setStatus('playing')
    utterance.onend = () => {
      setStatus('idle')
      options.onEnd?.()
    }
    utterance.onerror = () => {
      setStatus('idle')
      options.onEnd?.()
    }
    if (options.onBoundary) {
      utterance.onboundary = (event) => {
        const progress = cleanText.length > 0 ? Math.min(100, (event.charIndex / cleanText.length) * 100) : 0
        options.onBoundary?.(progress)
      }
    }

    utteranceRef.current = utterance;
    synth.speak(utterance);
  }, [])

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
    }
  }, [])

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
  }, [])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setStatus('idle')
  }, [])

  const isSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      return window.speechSynthesis.speaking
    }
    return false
  }, [])

  // Initialize voices on browsers where they load asynchronously
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return { speak, pause, resume, stop, isSpeaking, status }
}
