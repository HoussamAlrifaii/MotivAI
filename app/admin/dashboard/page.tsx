"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminService } from "@/services/local-storage"
import { BarChart3, Loader2, MessageSquare, Users } from "lucide-react"
import { useEffect, useState } from "react"

interface User {
  id: number
  name: string
  email: string
  created_at: string
  message_count: number
  isAdmin?: boolean
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = () => {
      setIsLoading(true)
      adminService
        .getUsers()
        .then((data) => {
          setUsers(data)
        })
        .catch((error) => {
          console.error("Failed to fetch users:", error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }

    fetchUsers()
  }, [])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate total messages
  const totalMessages = users.reduce((sum, user) => sum + user.message_count, 0)

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your MotivAI platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">+{Math.floor(users.length * 0.12)} from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Generated</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
            <p className="text-xs text-muted-foreground">+{Math.floor(totalMessages * 0.23)} from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(users.length * 0.6)}</div>
            <p className="text-xs text-muted-foreground">+7% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest user registrations on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 text-sm text-muted-foreground">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Joined</div>
                    <div>Status</div>
                  </div>
                  {users.map((user) => (
                    <div key={user.id} className="grid grid-cols-4 items-center">
                      <div>{user.name}</div>
                      <div>{user.email}</div>
                      <div>{formatDate(user.created_at)}</div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.message_count > 0
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                          }`}
                        >
                          {user.isAdmin ? "Admin" : user.message_count > 0 ? "Active" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.slice(0, 4).map((user, index) => (
                  <div key={index} className="border-b pb-2">
                    <p className="font-medium">Message Generated</p>
                    <p className="text-sm text-muted-foreground">
                      {user.name} generated a {index % 2 === 0 ? "motivation" : "joke"} message
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {index === 0
                        ? "2 minutes ago"
                        : index === 1
                          ? "15 minutes ago"
                          : index === 2
                            ? "1 hour ago"
                            : "3 hours ago"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
