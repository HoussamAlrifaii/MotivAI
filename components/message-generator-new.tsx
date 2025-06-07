"use client"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { contentService, messageService, type BackgroundMusic } from "@/services/local-storage"
import { generateSpeech } from "@/services/elevenlabs"
import { cn } from "@/lib/utils"
import { Copy, Download, History, Loader2, LogIn, Music, Pause, Play, RefreshCw, Volume2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { VoiceModelSelector } from "./voice-model-selector"
import { ThemeSelector } from "./theme-selector"
import Link from "next/link"

// Theme-based content variations
const contentVariations = {
  motivation: [
    "Remember, every morning you have two choices: continue to sleep with your dreams, or wake up and chase them. The difference between who you are and who you want to be is what you do. So get out there and make it happen!",
    "Success isn't about how much money you make, it's about the difference you make in people's lives. Your potential is infinite. Keep pushing your limits and inspiring others along the way.",
    "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. As with all matters of the heart, you'll know when you find it.",
    "Your time is limited, don't waste it living someone else's life. Have the courage to follow your heart and intuition. They somehow already know what you truly want to become.",
    "The future belongs to those who believe in the beauty of their dreams. Every expert was once a beginner. Start now, start where you are, start with fear, start with doubt, start with hands shaking, but start!",
  ],
  compliment: [
    "Your energy is contagious. When you walk into a room, people notice. You have this incredible ability to make others feel valued and heard. Never underestimate the impact you have on those around you.",
    "Your creativity knows no bounds. The way you think and solve problems is truly unique. You bring fresh perspectives that others might miss, and that's what makes you invaluable.",
    "The kindness you show to others doesn't go unnoticed. Your genuine care for people creates ripples of positivity that extend far beyond what you can see. Keep being your amazing self!",
    "Your resilience is inspiring. The way you handle challenges with grace and determination shows incredible strength of character. You're stronger than you know.",
    "There's something special about your presence that lights up any room. Your authenticity and warmth create a space where others feel comfortable being themselves.",
  ],
  joke: [
    "Why don't scientists trust atoms? Because they make up everything! Speaking of making things up, have you heard about the new restaurant on the moon? Great food, but no atmosphere.",
    "What did the grape say when it got stepped on? Nothing, it just let out a little wine! And why did the scarecrow win an award? Because he was outstanding in his field!",
    "What do you call a bear with no teeth? A gummy bear! And what do you call a fake noodle? An impasta! These jokes might not be that funny, but they're pasta point of no return.",
    "Why did the math book look so sad? Because it had too many problems! Speaking of problems, why don't eggs tell jokes? They'd crack up!",
    "What do you call a can opener that doesn't work? A can't opener! And why don't skeletons fight each other? They don't have the guts!",
  ],
  advice: [
    "Life is about the journey, not the destination. Embrace each moment, learn from challenges, and celebrate victories, no matter how small. You're exactly where you need to be right now.",
    "Sometimes the best thing you can do is take a step back and breathe. Not every moment requires action. Trust your intuition and give yourself permission to pause when needed.",
    "Build bridges, not walls. Every relationship, whether personal or professional, is an opportunity for growth. Invest time in understanding others' perspectives.",
    "Your mistakes don't define you, they refine you. Learn from them, grow through them, but don't let them hold you back. Every setback is setting you up for a comeback.",
    "Focus on progress, not perfection. Small steps forward are still steps in the right direction. Celebrate your progress and keep moving forward at your own pace.",
  ],
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

  useEffect(() => {
    if (!isLoggedIn) {
      setSelectedTheme("")
      setSelectedVoice("")
    }
  }, [isLoggedIn])

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

  const [lastMessageIndex, setLastMessageIndex] = useState<number | null>(null)

  const generateMessage = async () => {
    if (!selectedTheme || !selectedVoice) {
      toast({
        title: "Missing selection",
        description: "Please select both a theme and a voice model.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedText("")
    setAudioUrl(null)
    setIsPlaying(false)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause()
      backgroundMusicRef.current.currentTime = 0
    }

    try {
      const themeTexts = contentVariations[selectedTheme as keyof typeof contentVariations]
      let index = Math.floor(Math.random() * themeTexts.length)

      if (themeTexts.length === 1) {
        index = 0
      } else {
        // Keep track of previously generated indices for the current theme
        const generatedIndicesKey = `generatedIndices_${selectedTheme}`
        let generatedIndices = JSON.parse(localStorage.getItem(generatedIndicesKey) || "[]") as number[]

        // Filter out indices that have been generated before
        const availableIndices = themeTexts
          .map((_, i) => i)
          .filter((i) => !generatedIndices.includes(i))

        if (availableIndices.length === 0) {
          // Reset if all messages have been generated
          generatedIndices = []
          localStorage.setItem(generatedIndicesKey, JSON.stringify(generatedIndices))
          availableIndices.push(...themeTexts.map((_, i) => i))
        }

        // Pick a random index from available indices
        index = availableIndices[Math.floor(Math.random() * availableIndices.length)]

        // Update generated indices
        generatedIndices.push(index)
        localStorage.setItem(generatedIndicesKey, JSON.stringify(generatedIndices))
      }

      setLastMessageIndex(index)
      const text = themeTexts[index]

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
    await generateMessage()
  }

  const handleRegenerate = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "You need to log in to regenerate messages.",
        action: (
          <Button variant="default" size="sm" onClick={() => router.push("/login")}>
            Login
          </Button>
        ),
      })
      return
    }
    await generateMessage()
  }

  const generateVoice = async (text: string) => {
    if (!selectedVoice) return

    setIsGeneratingVoice(true)

    try {
      const audioBuffer = await generateSpeech(text, selectedVoice)

      const blob = new Blob([audioBuffer], { type: "audio/mpeg" })
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

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

      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause()
      }
    } else {
      try {
        audioRef.current.play()
        setIsPlaying(true)

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

  const handleDownloadAudio = async () => {
    if (!audioUrl) {
      toast({
        title: "Download Error",
        description: "No audio available to download",
        variant: "destructive"
      });
      return
    }

    try {
      const audioContext = new AudioContext()

      const voiceResponse = await fetch(audioUrl)
      if (!voiceResponse.ok) throw new Error("Failed to fetch voice audio")
      const voiceArrayBuffer = await voiceResponse.arrayBuffer()
      const voiceAudioBuffer = await audioContext.decodeAudioData(voiceArrayBuffer)

      let musicAudioBuffer = null
      if (selectedMusicData) {
        const musicResponse = await fetch(selectedMusicData.file)
        if (!musicResponse.ok) throw new Error("Failed to fetch background music")
        const musicArrayBuffer = await musicResponse.arrayBuffer()
        musicAudioBuffer = await audioContext.decodeAudioData(musicArrayBuffer)
      }

      const offlineContext = new OfflineAudioContext(2, voiceAudioBuffer.length, audioContext.sampleRate)

      const voiceSource = offlineContext.createBufferSource()
      voiceSource.buffer = voiceAudioBuffer
      voiceSource.connect(offlineContext.destination)

      if (musicAudioBuffer) {
        const musicSource = offlineContext.createBufferSource()

        musicSource.buffer = musicAudioBuffer

        const musicGain = offlineContext.createGain()
        musicGain.gain.value = 0.3

        musicSource.connect(musicGain)
        musicGain.connect(offlineContext.destination)
        musicSource.start(0)
      }

      voiceSource.start(0)

      const renderedBuffer = await offlineContext.startRendering()

      const numOfChan = renderedBuffer.numberOfChannels
      const length = renderedBuffer.length * numOfChan * 2
      const buffer = new ArrayBuffer(44 + length)
      const view = new DataView(buffer)

      const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i))
        }
      }

      writeString(view, 0, "RIFF")
      view.setUint32(4, 36 + length, true)
      writeString(view, 8, "WAVE")
      writeString(view, 12, "fmt ")
      view.setUint32(16, 16, true)
      view.setUint16(20, 1, true)
      view.setUint16(22, numOfChan, true)
      view.setUint32(24, renderedBuffer.sampleRate, true)
      view.setUint32(28, renderedBuffer.sampleRate * numOfChan * 2, true)
      view.setUint16(32, numOfChan * 2, true)
      view.setUint16(34, 16, true)
      writeString(view, 36, "data")
      view.setUint32(40, length, true)

      const offset = 44
      for (let i = 0; i < renderedBuffer.length; i++) {
        for (let channel = 0; channel < numOfChan; channel++) {
          const sample = Math.max(-1, Math.min(1, renderedBuffer.getChannelData(channel)[i]))
          const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff
          view.setInt16(offset + (i * numOfChan + channel) * 2, int16, true)
        }
      }

      const wav = new Blob([buffer], { type: "audio/wav" })
      const url = URL.createObjectURL(wav)

      const link = document.createElement("a")
      link.href = url
      link.download = `message-${Date.now()}.wav`
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      audioContext.close()

      toast({
        title: "Success",
        description: "Audio downloaded successfully with background music",
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download Error",
        description: "Failed to download audio. Please try again.",
        variant: "destructive",
      })
    }
  }

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

                            const audio = new Audio(option.file)
                            audio.volume = 0.5
                            audio.play()

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
              className="w-full mb-2"
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
            {generatedText && (
              <Button
                onClick={handleRegenerate}
                disabled={isGenerating || isGeneratingVoice || !selectedTheme || !selectedVoice || !isLoggedIn}
                className="w-full"
              >
                Regenerate Message
              </Button>
            )}
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
