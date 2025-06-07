"use client"

import type React from "react"

import { AdminSidebar } from "@/components/admin/sidebar"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  // Skip auth check for the login page
  const isLoginPage = pathname === "/admin/login"

  // In a real app, this would check the session/auth state
  const isAuthenticated = () => {
    // This is a placeholder. In a real app, you would check if the user is authenticated
    return true
  }

  useEffect(() => {
    // Redirect to login if not authenticated and not already on login page
    if (!isLoginPage && !isAuthenticated()) {
      router.push("/admin/login")
    }
  }, [isLoginPage, router])

  // Don't show sidebar on login page
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
