"use client"
import { Volume2, VolumeX } from 'lucide-react'
import { useTTS } from '@/hooks/useTTS'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SpeakButtonProps {
  text: string
  language?: string
  size?: 'sm' | 'md'
  className?: string
}

export function SpeakButton({
  text,
  language = 'en',
  size = 'sm',
  className
}: SpeakButtonProps) {
  const { speak, stop, status } = useTTS()
  const isSpeaking = status !== 'idle'

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering parent click handlers
    if (isSpeaking) {
      stop()
    } else {
      speak(text, language)
    }
  }

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full transition-all duration-200",
        size === 'sm' ? "h-8 w-8" : "h-10 w-10",
        isSpeaking
          ? "bg-primary/20 text-primary animate-pulse"
          : "hover:bg-muted text-muted-foreground hover:text-foreground",
        className
      )}
      title={isSpeaking ? "Stop speaking" : "Listen to this"}
    >
      {isSpeaking
        ? <VolumeX className={size === 'sm' ? "h-4 w-4" : "h-5 w-5"} />
        : <Volume2 className={size === 'sm' ? "h-4 w-4" : "h-5 w-5"} />
      }
    </Button>
  )
}
