"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useToast } from "@/components/ui/use-toast"
import { Edit, Plus, Trash, Upload } from "lucide-react"
import { useState, useEffect } from "react"
import { adminService } from "@/services/local-storage"

export default function AdminCelebritiesPage() {
  const { toast } = useToast()
  const [voiceModels, setVoiceModels] = useState<typeof newModel[]>([])
  const [newModel, setNewModel] = useState({
    id: "",
    name: "",
    image: "/placeholder.svg?height=40&width=40",
    description: "",
  })
  const [editingModel, setEditingModel] = useState<null | typeof newModel>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchVoiceModels = async () => {
      try {
        const data = await adminService.getVoiceModels()
        setVoiceModels(data)
      } catch (error) {
        console.error("Failed to fetch voice models:", error)
        toast({
          title: "Failed to fetch voice models",
          description: "Please try again later.",
          variant: "destructive",
        })
      }
    }

    fetchVoiceModels()
  }, [])

  const handleAddModel = async () => {
    if (!newModel.id || !newModel.name) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await adminService.createVoiceModel(newModel)
      setVoiceModels([...voiceModels, newModel])
      setNewModel({
        id: "",
        name: "",
        image: "/placeholder.svg?height=40&width=40",
        description: "",
      })
      setIsAddDialogOpen(false)
      toast({
        title: "Voice model added",
        description: `${newModel.name} has been added to voice models`,
      })
    } catch (error) {
      console.error("Failed to add voice model:", error)
      toast({
        title: "Failed to add voice model",
        description: "There was an error adding the voice model. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditModel = async () => {
    if (!editingModel || !editingModel.id) return

    setIsSubmitting(true)

    try {
      await adminService.updateVoiceModel(editingModel.id, {
        name: editingModel.name,
        image: editingModel.image,
        description: editingModel.description,
      })
      setVoiceModels(
        voiceModels.map((model) => (model.id === editingModel.id ? editingModel : model)),
      )
      setIsEditDialogOpen(false)
      toast({
        title: "Voice model updated",
        description: `${editingModel.name} has been updated`,
      })
    } catch (error) {
      console.error("Failed to update voice model:", error)
      toast({
        title: "Failed to update voice model",
        description: "There was an error updating the voice model. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteModel = async (id: string) => {
    setIsSubmitting(true)

    try {
      await adminService.deleteVoiceModel(id)
      setVoiceModels(voiceModels.filter((model) => model.id !== id))
      toast({
        title: "Voice model deleted",
        description: "The voice model has been removed",
      })
    } catch (error) {
      console.error("Failed to delete voice model:", error)
      toast({
        title: "Failed to delete voice model",
        description: "There was an error deleting the voice model. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voice Models</h1>
          <p className="text-muted-foreground">Manage the voice models available for text-to-speech</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Voice Model
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Voice Model</DialogTitle>
              <DialogDescription>Add a new voice model for text-to-speech</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="model-id" className="text-right">
                  ID
                </Label>
                <Input
                  id="model-id"
                  value={newModel.id}
                  onChange={(e) => setNewModel({ ...newModel, id: e.target.value })}
                  className="col-span-3"
                  placeholder="rachel"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="model-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="model-name"
                  value={newModel.name}
                  onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Rachel"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="model-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="model-description"
                  value={newModel.description}
                  onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddModel}>
                Add Voice Model
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {voiceModels.map((model) => (
          <Card key={model.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <img
                  src={model.image || "/placeholder.svg"}
                  alt={model.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <CardTitle>{model.name}</CardTitle>
                  <CardDescription>ID: {model.id}</CardDescription>
                  <CardDescription>{model.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="flex justify-between">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setEditingModel(model)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Voice Model</DialogTitle>
                    <DialogDescription>Make changes to the voice model</DialogDescription>
                  </DialogHeader>
                  {editingModel && (
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-model-name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="edit-model-name"
                          value={editingModel.name}
                          onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-model-description" className="text-right">
                          Description
                        </Label>
                        <Input
                          id="edit-model-description"
                          value={editingModel.description}
                          onChange={(e) => setEditingModel({ ...editingModel, description: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button type="submit" onClick={handleEditModel}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="destructive" onClick={() => handleDeleteModel(model.id)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
