"use client"

import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Loader2, LogIn, LockKeyhole, Play, Pause, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import type { VoiceModel } from "@/services/elevenlabs"
import { listVoices } from "@/services/elevenlabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const voiceDescriptions: Record<string, { description: string; category: string; image: string }> = {
  "Rachel": {
    description: "Warm and professional female voice, perfect for narration and storytelling",
    category: "professional",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop"
  },
  "Drew": {
    description: "Deep and authoritative male voice, ideal for motivational content and speeches",
    category: "motivation",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop"
  },
  "Clyde": {
    description: "Friendly and approachable male voice, great for casual conversations and storytelling",
    category: "casual",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=256&h=256&fit=crop"
  },
  "Domi": {
    description: "Energetic and youthful female voice, suited for upbeat messages and lively content",
    category: "energetic",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop"
  },
  "Antoni": {
    description: "Sophisticated and articulate male voice, excellent for formal presentations and announcements",
    category: "formal",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop"
  },
  "Thomas": {
    description: "Gentle and calming male voice, perfect for advice, guidance, and meditation content",
    category: "calming",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=256&h=256&fit=crop"
  },
  "Charlie": {
    description: "Playful and entertaining voice, ideal for jokes, light-hearted stories, and fun content",
    category: "entertainment",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop"
  },
  "Emily": {
    description: "Empathetic and soothing female voice, great for compliments, support, and comforting messages",
    category: "supportive",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop"
  }
}

interface VoiceModelSelectorProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function VoiceModelSelector({ value, onValueChange, disabled = false }: VoiceModelSelectorProps) {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const [voices, setVoices] = useState<VoiceModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [playingPreview, setPlayingPreview] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const fetchVoices = async () => {
      if (disabled) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const voiceModels = await listVoices()
        // Enhance voice models with descriptions and categories
        const enhancedVoices = voiceModels.map(voice => ({
          ...voice,
          description: voiceDescriptions[voice.name]?.description || "Professional voice model",
          category: voiceDescriptions[voice.name]?.category || "professional",
          image: voiceDescriptions[voice.name]?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${voice.name}`
        }))
        setVoices(enhancedVoices)
      } catch (error) {
        console.error("Failed to fetch voice models:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVoices()
  }, [disabled])

  const handlePreviewPlay = (voiceId: string, previewUrl: string) => {
    if (playingPreview === voiceId) {
      audioRef.current?.pause()
      setPlayingPreview(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      audioRef.current = new Audio(previewUrl)
      audioRef.current.play()
      audioRef.current.onended = () => setPlayingPreview(null)
      setPlayingPreview(voiceId)
    }
  }

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  if (isLoading && !disabled) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isLoggedIn && !disabled) {
    return (
      <div className="flex flex-col items-center justify-center h-40 space-y-4">
        <LockKeyhole className="h-10 w-10 text-muted-foreground" />
        <p className="text-center text-muted-foreground">Please log in to select a voice model</p>
        <Button onClick={() => router.push("/login")} size="sm">
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Button>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[220px] pr-4">
      <RadioGroup value={value} onValueChange={onValueChange} disabled={disabled}>
        <div className="space-y-2">
          {voices.map((voice) => (
            <label
              key={voice.voice_id}
              htmlFor={voice.voice_id}
              className={cn(
                "flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors",
                value === voice.voice_id && "border-primary bg-accent",
                disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
              )}
            >
              <RadioGroupItem value={voice.voice_id} id={voice.voice_id} className="sr-only" disabled={disabled} />
              <Avatar className="h-12 w-12 border">
                <AvatarFallback>{voice.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{voice.name}</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{voice.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground truncate">{voice.description}</p>
              </div>
              {voice.preview_url && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePreviewPlay(voice.voice_id, voice.preview_url)
                  }}
                  disabled={disabled}
                >
                  {playingPreview === voice.voice_id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              )}
            </label>
          ))}
        </div>
      </RadioGroup>
    </ScrollArea>
  )
}
