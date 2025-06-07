"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Loader2, MessageCircle, X } from "lucide-react"
import { useState } from "react"

// Predefined questions and answers
const predefinedQuestions = [
  {
    id: "q1",
    question: "How do I download my audio messages?",
    answer:
      'After generating a message, you\'ll see a "Download Audio" button at the bottom of the message card. Click that button to download your audio as an MP3 file.',
  },
  {
    id: "q2",
    question: "How do I select a celebrity voice?",
    answer:
      "First, select a theme from the available options. Once you've chosen a theme, you'll be able to select a celebrity voice from the list of available celebrities.",
  },
  {
    id: "q3",
    question: "What themes are available?",
    answer:
      "We offer several themes including Motivation, Compliments, Jokes, and Advice. Each theme provides a different type of message tailored to your needs.",
  },
  {
    id: "q4",
    question: "Can I use background music?",
    answer:
      "Yes! You can select from various background music options when generating a message. This will add appropriate background music to enhance the emotional impact of your message.",
  },
]

export function ChatbotPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi there! I'm the MotivAI assistant. How can I help you today? Please select a question below.",
    },
  ])
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false)

  const handleQuestionClick = (questionId: string) => {
    const selectedQuestion = predefinedQuestions.find((q) => q.id === questionId)
    if (!selectedQuestion) return

    // Hide questions while waiting for answer
    setIsWaitingForAnswer(true)

    // Add user question to messages
    const updatedMessages = [...messages, { role: "user", content: selectedQuestion.question }]
    setMessages(updatedMessages)

    // Add assistant answer after a short delay
    setTimeout(() => {
      setMessages([...updatedMessages, { role: "assistant", content: selectedQuestion.answer }])
      setIsWaitingForAnswer(false)
    }, 1000)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-80 md:w-96 shadow-lg">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">MotivAI Assistant</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 h-80 overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] p-3 rounded-lg",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="p-4 pt-0 flex flex-col gap-2">
            {isWaitingForAnswer ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-1">Select a question:</div>
                <div className="flex flex-col gap-2 w-full">
                  {predefinedQuestions.map((q) => (
                    <Button
                      key={q.id}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2 font-normal"
                      onClick={() => handleQuestionClick(q.id)}
                    >
                      {q.question}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </CardFooter>
        </Card>
      ) : (
        <Button onClick={() => setIsOpen(true)} size="icon" className="h-12 w-12 rounded-full shadow-lg">
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
