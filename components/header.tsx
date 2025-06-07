"use client"

import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { UserButton } from "@/components/user-button"
import { useAuth } from "@/context/auth-context"
import { History, LogOut, ShieldCheck, Sparkles } from "lucide-react"
import Link from "next/link"

export function Header() {
  const { isLoggedIn, logout } = useAuth()

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">MotivAI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="flex items-center gap-1">
            <Link href="/history">
              <History className="mr-2 h-4 w-4" />
              History
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/support">Support</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin/login">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </Button>
          {isLoggedIn && (
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          )}
          <ModeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  )
}
