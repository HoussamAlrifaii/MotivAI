"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type User = {
  id: number
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for existing token on load
  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")

      // Find user with matching email
      const user = users.find((u: any) => u.email === email)

      // Check if user exists and password matches
      if (!user || user.password !== password) {
        throw new Error("Invalid email or password")
      }

      // Create user object without password
      const authenticatedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
      }

      // Create mock token
      const mockToken = `mock-token-${Date.now()}`

      localStorage.setItem("token", mockToken)
      localStorage.setItem("user", JSON.stringify(authenticatedUser))

      setUser(authenticatedUser)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem("users") || "[]")

      // Check if email already exists
      if (users.some((u: any) => u.email === email)) {
        throw new Error("Email already registered")
      }

      // Create new user
      const newUser = {
        id: users.length ? Math.max(...users.map((u: any) => u.id)) + 1 : 1,
        name,
        email,
        password,
        created_at: new Date().toISOString(),
        isAdmin: false,
      }

      // Add to users array
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      // Create user object without password for auth context
      const registeredUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      }

      // Create mock token
      const mockToken = `mock-token-${Date.now()}`

      localStorage.setItem("token", mockToken)
      localStorage.setItem("user", JSON.stringify(registeredUser))

      setUser(registeredUser)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        register,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
