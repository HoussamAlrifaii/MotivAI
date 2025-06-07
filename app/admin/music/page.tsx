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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { adminService, contentService } from "@/services/local-storage"
import { Edit, Music, Pause, Play, Plus, Trash, Upload } from "lucide-react"
import { useEffect, useRef, useState } from "react"

// Initial music data
interface MusicItem {
  id: string
  name: string
  file: string
  category: string
}

export default function AdminMusicPage() {
  const { toast } = useToast()
  const [music, setMusic] = useState<MusicItem[]>([])
  const [newMusic, setNewMusic] = useState<MusicItem>({ id: "", name: "", file: "", category: "" })
  const [editingMusic, setEditingMusic] = useState<null | MusicItem>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const data = await contentService.getMusic()
        setMusic(data)
      } catch (error) {
        console.error("Failed to fetch music:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMusic()
  }, [])

  const handleAddMusic = () => {
    if (!newMusic.id || !newMusic.name || !newMusic.file || !newMusic.category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    adminService
      .createMusic(newMusic)
      .then(() => {
        setMusic([...music, newMusic])
        setNewMusic({ id: "", name: "", file: "", category: "" })
        setIsAddDialogOpen(false)
        toast({
          title: "Music added",
          description: `${newMusic.name} has been added to background music`,
        })
      })
      .catch((error) => {
        console.error("Failed to add music:", error)
        toast({
          title: "Failed to add music",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
      })
  }

  const handleEditMusic = () => {
    if (!editingMusic || !editingMusic.id) return

    adminService
      .updateMusic(editingMusic.id, {
        name: editingMusic.name,
        file: editingMusic.file,
        category: editingMusic.category,
      })
      .then(() => {
        setMusic(music.map((item) => (item.id === editingMusic.id ? editingMusic : item)))
        setIsEditDialogOpen(false)
        toast({
          title: "Music updated",
          description: `${editingMusic.name} has been updated`,
        })
      })
      .catch((error) => {
        console.error("Failed to update music:", error)
        toast({
          title: "Failed to update music",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
      })
  }

  const handleDeleteMusic = (id: string) => {
    adminService
      .deleteMusic(id)
      .then(() => {
        setMusic(music.filter((item) => item.id !== id))
        toast({
          title: "Music deleted",
          description: "The music has been removed",
        })
      })
      .catch((error) => {
        console.error("Failed to delete music:", error)
        toast({
          title: "Failed to delete music",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
      })
  }

  const togglePlay = (id: string) => {
    if (playingId === id) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setPlayingId(null)
    } else {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // Start playing new audio
      const musicItem = music.find((item) => item.id === id)
      if (musicItem && audioRef.current) {
        audioRef.current.src = musicItem.file
        audioRef.current.play().catch((err) => {
          console.error("Error playing audio:", err)
          toast({
            title: "Playback Error",
            description: "Could not play the audio file",
            variant: "destructive",
          })
        })
        setPlayingId(id)

        // Set up ended event to reset playing state
        audioRef.current.onended = () => {
          setPlayingId(null)
        }
      }
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Background Music</h1>
          <p className="text-muted-foreground">Manage the background music available for messages</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Music
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Background Music</DialogTitle>
              <DialogDescription>Upload a new background music track</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="music-id" className="text-right">
                  ID
                </Label>
                <Input
                  id="music-id"
                  value={newMusic.id}
                  onChange={(e) => setNewMusic({ ...newMusic, id: e.target.value })}
                  className="col-span-3"
                  placeholder="motivational"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="music-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="music-name"
                  value={newMusic.name}
                  onChange={(e) => setNewMusic({ ...newMusic, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Motivational Upbeat"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="music-file" className="text-right">
                  Audio File
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="music-file"
                    value={newMusic.file}
                    onChange={(e) => setNewMusic({ ...newMusic, file: e.target.value })}
                    className="flex-1"
                    placeholder="https://example.com/audio/music.mp3"
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="music-category" className="text-right">
                  Category
                </Label>
                <Select
                  value={newMusic.category}
                  onValueChange={(value) => setNewMusic({ ...newMusic, category: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motivation">Motivation</SelectItem>
                    <SelectItem value="compliment">Compliment</SelectItem>
                    <SelectItem value="joke">Joke</SelectItem>
                    <SelectItem value="advice">Advice</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddMusic}>
                Add Music
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {music.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>Category: {item.category}</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={() => togglePlay(item.id)}>
                  {playingId === item.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm truncate">File: {item.file}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setEditingMusic(item)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Background Music</DialogTitle>
                    <DialogDescription>Make changes to the background music</DialogDescription>
                  </DialogHeader>
                  {editingMusic && (
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-music-name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="edit-music-name"
                          value={editingMusic.name}
                          onChange={(e) => setEditingMusic({ ...editingMusic, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-music-file" className="text-right">
                          Audio File
                        </Label>
                        <div className="col-span-3 flex gap-2">
                          <Input
                            id="edit-music-file"
                            value={editingMusic.file}
                            onChange={(e) => setEditingMusic({ ...editingMusic, file: e.target.value })}
                            className="flex-1"
                          />
                          <Button variant="outline" size="icon">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-music-category" className="text-right">
                          Category
                        </Label>
                        <Select
                          value={editingMusic.category}
                          onValueChange={(value) => setEditingMusic({ ...editingMusic, category: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="motivation">Motivation</SelectItem>
                            <SelectItem value="compliment">Compliment</SelectItem>
                            <SelectItem value="joke">Joke</SelectItem>
                            <SelectItem value="advice">Advice</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button type="submit" onClick={handleEditMusic}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="destructive" onClick={() => handleDeleteMusic(item.id)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}
