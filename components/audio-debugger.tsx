"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

// Sample audio files that are known to work
const testAudioFiles = [
  {
    name: "Gettysburg Address",
    url: "https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg.wav",
  },
  {
    name: "Star Wars",
    url: "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav",
  },
  {
    name: "Taunt",
    url: "https://www2.cs.uic.edu/~i101/SoundFiles/taunt.wav",
  },
]

export function AudioDebugger() {
  const [expanded, setExpanded] = useState(false)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)

  const playAudio = (index: number) => {
    // If already playing this file, stop it
    if (playingIndex === index) {
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.src = ""
      }
      setCurrentAudio(null)
      setPlayingIndex(null)
      return
    }

    // If playing a different file, stop it first
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.src = ""
    }

    // Create a new audio element
    const audio = new Audio(testAudioFiles[index].url)

    // Set up event listeners
    audio.onended = () => {
      setPlayingIndex(null)
      setCurrentAudio(null)
    }

    audio.onpause = () => {
      setPlayingIndex(null)
      setCurrentAudio(null)
    }

    audio.onerror = (e) => {
      console.error("Audio error:", e)
      setPlayingIndex(null)
      setCurrentAudio(null)
    }

    // Play the audio
    audio
      .play()
      .then(() => {
        setPlayingIndex(index)
        setCurrentAudio(audio)
      })
      .catch((err) => {
        console.error("Error playing audio:", err)
        setPlayingIndex(null)
        setCurrentAudio(null)
      })
  }

  if (!expanded) {
    return (
      <Button variant="outline" size="sm" onClick={() => setExpanded(true)} className="mb-4">
        Debug Audio
      </Button>
    )
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Audio Debugger</CardTitle>
        <CardDescription>Test audio playback to troubleshoot issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {testAudioFiles.map((file, index) => (
            <Button
              key={index}
              variant={playingIndex === index ? "default" : "outline"}
              onClick={() => playAudio(index)}
            >
              {file.name}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={() => setExpanded(false)}>
          Close Debugger
        </Button>
      </CardFooter>
    </Card>
  )
}
