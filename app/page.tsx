import { AudioDebugger } from "@/components/audio-debugger"
import { ChatbotPopup } from "@/components/chatbot-popup"
import { Header } from "@/components/header"
import { MessageGenerator } from "@/components/message-generator"
import { WelcomeBanner } from "@/components/welcome-banner"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container max-w-5xl py-8 px-4 md:py-12">
        <WelcomeBanner />
        <AudioDebugger />
        <MessageGenerator />
      </div>
      <ChatbotPopup />
    </main>
  )
}
