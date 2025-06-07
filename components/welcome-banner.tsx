"use client"

import { useAuth } from "@/context/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserCircle } from "lucide-react"
import { useState, useEffect } from "react"

export function WelcomeBanner() {
  const { user, isLoggedIn } = useAuth()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isLoggedIn) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
      }, 5000) // Hide after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [isLoggedIn])

  if (!isLoggedIn || !visible) return null

  return (
    <Alert className="bg-primary/20 border-primary mb-4">
      <UserCircle className="h-4 w-4 text-primary" />
      <AlertDescription>
        Hello, <span className="font-semibold">{user?.name}</span>! Welcome to MotivAI.
      </AlertDescription>
    </Alert>
  )
}
