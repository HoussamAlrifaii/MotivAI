"use client"

import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { contentService, messageService, type BackgroundMusic } from "@/services/local-storage"
import { generateSpeech } from "@/services/elevenlabs"
import { cn } from "@/lib/utils"
import { Copy, Download, History, Loader2, LogIn, Music, Pause, Play, RefreshCw, Volume2, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { VoiceModelSelector } from "./voice-model-selector"
import { ThemeSelector } from "./theme-selector"
import Link from "next/link"

// Emotion mapping for different themes
const themeToEmotion: Record<string, string> = {
  motivation: "Excited and energetic",
  compliment: "Warm and friendly",
  joke: "Playful and light",
  advice: "Serious and thoughtful",
}

export function MessageGenerator() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("")
  const [backgroundMusic, setBackgroundMusic] = useState("")
  const [selectedMusicData, setSelectedMusicData] = useState<BackgroundMusic | null>(null)
  const [generatedText, setGeneratedText] = useState("")
  const [musicOptions, setMusicOptions] = useState<BackgroundMusic[]>([])
  const [isLoadingMusic, setIsLoadingMusic] = useState(true)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)
  const voiceCardRef = useRef<HTMLDivElement>(null)
  const optionsCardRef = useRef<HTMLDivElement>(null)

  // Reset selections if user logs out
  useEffect(() => {
    if (!isLoggedIn) {
      setSelectedTheme("")
      setSelectedVoice("")
    }
  }, [isLoggedIn])

  // Fetch background music options
  useEffect(() => {
    const fetchMusic = () => {
      setIsLoadingMusic(true)
      contentService
        .getMusic()
        .then((data) => {
          setMusicOptions(data)
        })
        .catch((error) => {
          console.error("Failed to fetch background music:", error)
        })
        .finally(() => {
          setIsLoadingMusic(false)
        })
    }

    fetchMusic()
  }, [])

  // Fetch music data when selected
  useEffect(() => {
    if (backgroundMusic) {
      contentService
        .getMusic()
        .then((musicList) => {
          const music = musicList.find((m) => m.id === backgroundMusic)
          if (music) {
            setSelectedMusicData(music)
          }
        })
        .catch((error) => {
          console.error("Failed to fetch music data:", error)
        })
    } else {
      setSelectedMusicData(null)
    }
  }, [backgroundMusic])

  // Auto-scroll to voice selection when theme is selected
  useEffect(() => {
    if (selectedTheme && voiceCardRef.current) {
      setTimeout(() => {
        voiceCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }, 100)
    }
  }, [selectedTheme])

  // Auto-scroll to options when voice is selected
  useEffect(() => {
    if (selectedVoice && optionsCardRef.current) {
      setTimeout(() => {
        optionsCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }, 100)
    }
  }, [selectedVoice])

  const handleGenerate = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "You need to log in to generate messages.",
        action: (
          <Button variant="default" size="sm" onClick={() => router.push("/login")}>
            Login
          </Button>
        ),
      })
      return
    }

    if (!selectedTheme || !selectedVoice) {
      toast({
        title: "Missing selection",
        description: "Please select both a theme and a voice model.",
        variant: "destructive",
      })
      return
    }

    // Reset states
    setIsGenerating(true)
    setGeneratedText("")
    setAudioUrl(null)
    setIsPlaying(false)

    // Stop any current audio playback
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // Stop any background music
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause()
      backgroundMusicRef.current.currentTime = 0
    }

    try {
      // Generate text based on theme
      let text = ""
      if (selectedTheme === "motivation") {
        text =
          "Remember, every morning you have two choices: continue to sleep with your dreams, or wake up and chase them. The difference between who you are and who you want to be is what you do. So get out there and make it happen!"
      } else if (selectedTheme === "compliment") {
        text =
          "Your energy is contagious. When you walk into a room, people notice. You have this incredible ability to make others feel valued and heard. Never underestimate the impact you have on those around you."
      } else if (selectedTheme === "joke") {
        text =
          "Why don't scientists trust atoms? Because they make up everything! Speaking of making things up, have you heard about the new restaurant on the moon? Great food, but no atmosphere."
      } else {
        text =
          "Life is about the journey, not the destination. Embrace each moment, learn from challenges, and celebrate victories, no matter how small. You're exactly where you need to be right now."
      }

      // Simulate typing effect
      let i = 0
      const typingInterval = setInterval(() => {
        setGeneratedText(text.substring(0, i))
        i++
        if (i > text.length) {
          clearInterval(typingInterval)
          generateVoice(text)
        }
      }, 30)
    } catch (error) {
      console.error("Error generating message:", error)
      toast({
        title: "Generation Error",
        description: "There was an error generating the message. Please try again.",
        variant: "destructive",
      })
      setIsGenerating(false)
    }
  }

  const generateVoice = async (text: string) => {
    if (!selectedVoice) return

    setIsGeneratingVoice(true)

    try {
      // Generate speech using ElevenLabs API
      const audioBuffer = await generateSpeech(text, selectedVoice)
      
      // Create blob URL from the audio buffer
      const blob = new Blob([audioBuffer], { type: "audio/mpeg" })
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      // Save message if user is logged in
      if (isLoggedIn) {
        messageService
          .createMessage({
            theme_id: selectedTheme,
            voice_id: selectedVoice,
            content: text,
            audio_url: url,
            background_music_id: backgroundMusic || undefined,
          })
          .catch((error) => {
            console.error("Failed to save message:", error)
          })
      }

      toast({
        title: "Voice Generated",
        description: "Your message has been generated successfully!",
      })
    } catch (error) {
      console.error("Error generating voice:", error)
      toast({
        title: "Voice Generation Error",
        description: "There was an error generating the voice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingVoice(false)
      setIsGenerating(false)
    }
  }

  const handlePlayPause = () => {
    if (!audioUrl || !audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)

      // Stop background music
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause()
      }
    } else {
      try {
        // Play the generated audio
        audioRef.current.play()
        setIsPlaying(true)

        // Play background music if selected
        if (selectedMusicData && backgroundMusicRef.current) {
          backgroundMusicRef.current.src = selectedMusicData.file
          backgroundMusicRef.current.volume = 0.3
          backgroundMusicRef.current.loop = true
          backgroundMusicRef.current.play().catch((err) => {
            console.error("Error playing background music:", err)
          })
        }
      } catch (error) {
        console.error("Error playing audio:", error)
        toast({
          title: "Playback Error",
          description: "Could not play the audio. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedText)
    toast({
      title: "Text copied",
      description: "The message has been copied to your clipboard.",
    })
  }

  const handleDownloadAudio = () => {
    if (!audioUrl) return

    const link = document.createElement("a")
    link.href = audioUrl
    link.download = "generated-message.mp3"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter music options based on selected theme
  const filteredMusicOptions = selectedTheme
    ? musicOptions.filter((option) => option.category === selectedTheme || option.category === "general")
    : musicOptions

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create Your Personalized Message</h1>
        <p className="text-muted-foreground">Select a theme and voice model to generate a personalized audio message</p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>1. Select a Theme</CardTitle>
              <CardDescription>Choose the type of message you want to generate</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSelector value={selectedTheme} onValueChange={setSelectedTheme} />
            </CardContent>
          </Card>

          <Card ref={voiceCardRef} className={selectedTheme && isLoggedIn ? "" : "opacity-50 pointer-events-none"}>
            <CardHeader>
              <CardTitle>2. Choose a Voice</CardTitle>
              <CardDescription>
                {!isLoggedIn
                  ? "Please log in and select a theme first"
                  : selectedTheme
                    ? "Select a voice model for your message"
                    : "Please select a theme first"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceModelSelector
                value={selectedVoice}
                onValueChange={setSelectedVoice}
                disabled={!selectedTheme || !isLoggedIn}
              />
            </CardContent>
          </Card>
        </div>

        <Card
          ref={optionsCardRef}
          className={selectedTheme && selectedVoice && isLoggedIn ? "" : "opacity-50 pointer-events-none"}
        >
          <CardHeader>
            <CardTitle>3. Options</CardTitle>
            <CardDescription>Customize your message experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center">
                <Music className="h-5 w-5 mr-2 text-primary" />
                <Label className="text-base font-medium">Background Music</Label>
              </div>

              {isLoadingMusic ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <RadioGroup
                  value={backgroundMusic}
                  onValueChange={setBackgroundMusic}
                  className="grid grid-cols-2 gap-2"
                  disabled={!selectedTheme || !selectedVoice || !isLoggedIn}
                >
                  <div className="col-span-2">
                    <div
                      className={cn(
                        "flex items-center space-x-2 rounded-md border p-3",
                        backgroundMusic === "" ? "border-primary bg-accent" : "",
                        (!selectedTheme || !selectedVoice || !isLoggedIn) && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <RadioGroupItem
                        value=""
                        id="no-music"
                        disabled={!selectedTheme || !selectedVoice || !isLoggedIn}
                      />
                      <Label
                        htmlFor="no-music"
                        className={cn(
                          "flex-1",
                          !selectedTheme || !selectedVoice || !isLoggedIn ? "cursor-not-allowed" : "cursor-pointer",
                        )}
                      >
                        No background music
                      </Label>
                    </div>
                  </div>

                  {filteredMusicOptions.map((option) => (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-center space-x-2 rounded-md border p-3",
                        backgroundMusic === option.id ? "border-primary bg-accent" : "",
                        (!selectedTheme || !selectedVoice || !isLoggedIn) && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        disabled={!selectedTheme || !selectedVoice || !isLoggedIn}
                      />
                      <Label
                        htmlFor={option.id}
                        className={cn(
                          "flex-1",
                          !selectedTheme || !selectedVoice || !isLoggedIn ? "cursor-not-allowed" : "cursor-pointer",
                        )}
                      >
                        {option.name}
                      </Label>
                      {option.file && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()

                            // Create a temporary audio element to preview the music
                            const audio = new Audio(option.file)
                            audio.volume = 0.5
                            audio.play()

                            // Stop after 3 seconds
                            setTimeout(() => {
                              audio.pause()
                              audio.currentTime = 0
                            }, 3000)
                          }}
                          disabled={!selectedTheme || !selectedVoice || !isLoggedIn}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || isGeneratingVoice || !selectedTheme || !selectedVoice || !isLoggedIn}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating message...
                </>
              ) : isGeneratingVoice ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating voice...
                </>
              ) : !isLoggedIn ? (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login to Generate
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Message
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {generatedText && (
          <Card>
            <CardHeader>
              <CardTitle>Your Personalized Message</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>
                  Generated with ElevenLabs voice synthesis
                  {selectedMusicData && ` and ${selectedMusicData.name} background music`}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative rounded-lg border p-4 min-h-[100px]">
                <p className="whitespace-pre-wrap">{generatedText}</p>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePlayPause}
                  disabled={isGeneratingVoice || !audioUrl}
                  className={cn(
                    "transition-colors",
                    isPlaying && "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className={cn("bg-primary h-2 rounded-full transition-all", isPlaying ? "w-[60%]" : "w-0")} />
                </div>
                {/* Hidden audio elements */}
                <audio
                  ref={audioRef}
                  src={audioUrl || undefined}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    setIsPlaying(false)
                    if (backgroundMusicRef.current) {
                      backgroundMusicRef.current.pause()
                      backgroundMusicRef.current.currentTime = 0
                    }
                  }}
                />
                <audio ref={backgroundMusicRef} className="hidden" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <Button variant="outline" size="icon">
                          <Volume2 className="h-4 w-4" />
                        </Button>
                        {isGeneratingVoice && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isGeneratingVoice
                          ? "Generating voice..."
                          : audioUrl
                            ? "Voice generated using ElevenLabs"
                            : "Voice generation not started yet"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleCopyText}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Text
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/history">
                    <History className="mr-2 h-4 w-4" />
                    View History
                  </Link>
                </Button>
                <Button onClick={handleDownloadAudio} disabled={isGeneratingVoice || !audioUrl}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Audio
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
