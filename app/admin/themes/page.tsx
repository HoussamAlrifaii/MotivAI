"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { adminService, contentService, type Theme } from "@/services/local-storage"
import { Edit, Loader2, Plus, Trash } from "lucide-react"
import { useEffect, useState } from "react"

export default function AdminThemesPage() {
  const { toast } = useToast()
  const [themes, setThemes] = useState<Theme[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newTheme, setNewTheme] = useState<Theme>({ id: "", name: "", description: "", icon: "" })
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const data = await contentService.getThemes()
        setThemes(data)
      } catch (error) {
        console.error("Failed to fetch themes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchThemes()
  }, [])

  const handleAddTheme = async () => {
    if (!newTheme.id || !newTheme.name || !newTheme.description || !newTheme.icon) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await adminService.createTheme(newTheme)
      setThemes([...themes, newTheme])
      setNewTheme({ id: "", name: "", description: "", icon: "" })
      setIsAddDialogOpen(false)
      toast({
        title: "Theme added",
        description: `${newTheme.name} has been added to themes`,
      })
    } catch (error) {
      console.error("Failed to add theme:", error)
      toast({
        title: "Failed to add theme",
        description: "There was an error adding the theme. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTheme = async () => {
    if (!editingTheme || !editingTheme.id) return

    setIsSubmitting(true)

    try {
      await adminService.updateTheme(editingTheme.id, {
        name: editingTheme.name,
        description: editingTheme.description,
        icon: editingTheme.icon,
      })

      setThemes(themes.map((theme) => (theme.id === editingTheme.id ? editingTheme : theme)))
      setIsEditDialogOpen(false)
      toast({
        title: "Theme updated",
        description: `${editingTheme.name} has been updated`,
      })
    } catch (error) {
      console.error("Failed to update theme:", error)
      toast({
        title: "Failed to update theme",
        description: "There was an error updating the theme. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTheme = async (id: string) => {
    try {
      await adminService.deleteTheme(id)
      setThemes(themes.filter((theme) => theme.id !== id))
      toast({
        title: "Theme deleted",
        description: "The theme has been removed",
      })
    } catch (error) {
      console.error("Failed to delete theme:", error)
      toast({
        title: "Failed to delete theme",
        description: "There was an error deleting the theme. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Themes</h1>
          <p className="text-muted-foreground">Manage the themes available to users</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Theme
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Theme</DialogTitle>
              <DialogDescription>Create a new theme for users to select</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="theme-id" className="text-right">
                  ID
                </Label>
                <Input
                  id="theme-id"
                  value={newTheme.id}
                  onChange={(e) => setNewTheme({ ...newTheme, id: e.target.value })}
                  className="col-span-3"
                  placeholder="motivation"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="theme-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="theme-name"
                  value={newTheme.name}
                  onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Motivation"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="theme-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="theme-description"
                  value={newTheme.description}
                  onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Inspiring messages to boost your day"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="theme-icon" className="text-right">
                  Icon
                </Label>
                <Input
                  id="theme-icon"
                  value={newTheme.icon}
                  onChange={(e) => setNewTheme({ ...newTheme, icon: e.target.value })}
                  className="col-span-3"
                  placeholder="Flame"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddTheme} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Theme"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {themes.map((theme) => (
            <Card key={theme.id}>
              <CardHeader>
                <CardTitle>{theme.name}</CardTitle>
                <CardDescription>{theme.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p>
                    <strong>ID:</strong> {theme.id}
                  </p>
                  <p>
                    <strong>Icon:</strong> {theme.icon}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setEditingTheme(theme)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Theme</DialogTitle>
                      <DialogDescription>Make changes to the theme</DialogDescription>
                    </DialogHeader>
                    {editingTheme && (
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-theme-name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="edit-theme-name"
                            value={editingTheme.name}
                            onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-theme-description" className="text-right">
                            Description
                          </Label>
                          <Textarea
                            id="edit-theme-description"
                            value={editingTheme.description}
                            onChange={(e) => setEditingTheme({ ...editingTheme, description: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-theme-icon" className="text-right">
                            Icon
                          </Label>
                          <Input
                            id="edit-theme-icon"
                            value={editingTheme.icon}
                            onChange={(e) => setEditingTheme({ ...editingTheme, icon: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button type="submit" onClick={handleEditTheme} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="destructive" onClick={() => handleDeleteTheme(theme.id)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
