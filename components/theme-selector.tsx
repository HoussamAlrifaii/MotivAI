"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { Heart, Lightbulb, MessageSquare, Sparkles } from "lucide-react"

interface ThemeSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

const themes = [
  {
    id: "motivation",
    name: "Motivation",
    description: "Inspiring messages to boost confidence and drive",
    icon: Lightbulb,
  },
  {
    id: "compliment",
    name: "Compliment",
    description: "Kind words to brighten someone's day",
    icon: Heart,
  },
  {
    id: "joke",
    name: "Joke",
    description: "Humorous content to make people laugh",
    icon: MessageSquare,
  },
  {
    id: "advice",
    name: "Advice",
    description: "Thoughtful guidance for life's journey",
    icon: Sparkles,
  },
]

export function ThemeSelector({ value, onValueChange }: ThemeSelectorProps) {
  return (
    <RadioGroup value={value} onValueChange={onValueChange}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {themes.map((theme) => {
          const Icon = theme.icon
          return (
            <label
              key={theme.id}
              htmlFor={theme.id}
              className={cn(
                "flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors",
                value === theme.id && "border-primary bg-accent",
              )}
            >
              <RadioGroupItem value={theme.id} id={theme.id} className="sr-only" />
              <Icon className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{theme.name}</p>
                <p className="text-sm text-muted-foreground truncate">{theme.description}</p>
              </div>
            </label>
          )
        })}
      </div>
    </RadioGroup>
  )
}
