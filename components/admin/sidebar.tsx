"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, LogOut, Music, Users, Zap } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

interface SidebarProps {
  className?: string
}

export function AdminSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: Home,
    },
    {
      name: "Themes",
      href: "/admin/themes",
      icon: Zap,
    },
    {
      name: "Celebrities",
      href: "/admin/celebrities",
      icon: Users,
    },
    {
      name: "Background Music",
      href: "/admin/music",
      icon: Music,
    },
  ]

  const handleLogout = () => {
    // In a real app, this would clear the session/auth state
    router.push("/admin/login")
  }

  return (
    <div className={cn("pb-12 w-64 border-r h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">MotivAI Admin</h2>
          </Link>
        </div>
        <div className="px-4">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Navigation</h2>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
      <div className="px-4 absolute bottom-4 w-64">
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
