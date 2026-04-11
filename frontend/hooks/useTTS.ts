import { useCallback, useEffect, useRef } from 'react'

export function useTTS() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string, language: string = 'en') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    
    // Stop any current speech
    window.speechSynthesis.cancel()
    
    const langMap: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN', 
      mr: 'mr-IN'
    }
    
    // Clean text - remove special chars but keep meaningful content
    const cleanText = text
      .replace(/[*#]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 500) // max 500 chars per speak call
    
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = langMap[language] || 'en-IN'
    utterance.rate = 0.85  // slightly slow for clarity
    utterance.pitch = 1
    utterance.volume = 1
    
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const isSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      return window.speechSynthesis.speaking
    }
    return false
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return { speak, stop, isSpeaking }
}
