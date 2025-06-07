"use client"

import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { messageService, contentService, type Celebrity } from "@/services/local-storage"
import { ArrowLeft, Download, Loader2, Play } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Message {
  id: number
  content: string
  audio_url: string
  theme: {
    id: string
    name: string
  }
  celebrity: {
    id: string
    name: string
  }
  background_music: {
    id: string
    name: string
  } | null
  created_at: string
}

export default function HistoryPage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [celebrities, setCelebrities] = useState<Celebrity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirect to login if not logged in
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [messagesData, celebritiesData] = await Promise.all([
          messageService.getUserMessages(),
          contentService.getCelebrities(),
        ])

        setMessages(messagesData)
        setCelebrities(celebritiesData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        // Fallback to sample data if API fails
        setMessages([
          {
            id: 1,
            content:
              "Remember, every morning you have two choices: continue to sleep with your dreams, or wake up and chase them. The difference between who you are and who you want to be is what you do.",
            audio_url: "/sample-audio.mp3",
            theme: { id: "motivation", name: "Motivation" },
            celebrity: { id: "morgan-freeman", name: "Morgan Freeman" },
            background_music: null,
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            content:
              "Your energy is contagious. When you walk into a room, people notice. You have this incredible ability to make others feel valued and heard.",
            audio_url: "/sample-audio.mp3",
            theme: { id: "compliment", name: "Compliment" },
            celebrity: { id: "oprah-winfrey", name: "Oprah Winfrey" },
            background_music: { id: "happy", name: "Happy Acoustic" },
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          },
          {
            id: 3,
            content:
              "Why don't scientists trust atoms? Because they make up everything! Speaking of making things up, have you heard about the new restaurant on the moon?",
            audio_url: "/sample-audio.mp3",
            theme: { id: "joke", name: "Joke" },
            celebrity: { id: "dwayne-johnson", name: "Dwayne Johnson" },
            background_music: { id: "funny", name: "Funny Tunes" },
            created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isLoggedIn, router])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Get celebrity image
  const getCelebrityImage = (celebrityId: string) => {
    const celebrity = celebrities.find((c) => c.id === celebrityId)
    return celebrity?.image || "/placeholder.svg?height=40&width=40"
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container max-w-5xl py-8 px-4 md:py-12">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Your Message History</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">You haven't generated any messages yet.</p>
              <Button asChild>
                <Link href="/">Create Your First Message</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <Card key={message.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={getCelebrityImage(message.celebrity.id)} alt={message.celebrity.name} />
                        <AvatarFallback>{message.celebrity.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>
                          {message.theme.name} by {message.celebrity.name}
                        </CardTitle>
                        <CardDescription>{formatDate(message.created_at)}</CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="icon">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{message.content}</p>
                  {message.background_music && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Background music: {message.background_music.name}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
