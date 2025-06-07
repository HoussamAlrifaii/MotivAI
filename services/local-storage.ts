// Types
export interface User {
  id: number
  name: string
  email: string
}

export interface Theme {
  id: string
  name: string
  description: string
  icon: string
}

export interface VoiceModel {
  id: string
  name: string
  description: string
}

export interface BackgroundMusic {
  id: string
  name: string
  file: string
  category: string
}

export interface Message {
  id: number
  content: string
  audio_url: string
  user_id: number
  theme: {
    id: string
    name: string
  }
  voice: {
    id: string
    name: string
  }
  background_music: {
    id: string
    name: string
  } | null
  created_at: string
}

// Initial data
const initialThemes: Theme[] = [
  {
    id: "motivation",
    name: "Motivation",
    description: "Inspiring messages to boost your day",
    icon: "Flame",
  },
  {
    id: "compliment",
    name: "Compliment",
    description: "Kind words to make you feel special",
    icon: "Heart",
  },
  {
    id: "joke",
    name: "Joke",
    description: "Funny content to make you laugh",
    icon: "Sparkles",
  },
  {
    id: "advice",
    name: "Advice",
    description: "Wisdom to guide your decisions",
    icon: "Lightbulb",
  },
]

const initialMusic: BackgroundMusic[] = [
  {
    id: "motivational",
    name: "Motivational Upbeat",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    category: "motivation",
  },
  {
    id: "inspirational",
    name: "Inspirational Piano",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    category: "motivation",
  },
  {
    id: "happy",
    name: "Happy Acoustic",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    category: "compliment",
  },
  {
    id: "funny",
    name: "Funny Tunes",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    category: "joke",
  },
  {
    id: "calm",
    name: "Calm Meditation",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    category: "advice",
  },
  {
    id: "energetic",
    name: "Energetic Pop",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    category: "general",
  },
]

// Helper functions
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue

  const item = localStorage.getItem(key)
  if (!item) return defaultValue

  try {
    return JSON.parse(item) as T
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error)
    return defaultValue
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// Initialize data if not exists
function initializeData(): void {
  if (typeof window === "undefined") return

  if (!localStorage.getItem("themes")) {
    setItem("themes", initialThemes)
  }

  if (!localStorage.getItem("music")) {
    setItem("music", initialMusic)
  }

  if (!localStorage.getItem("messages")) {
    setItem("messages", [])
  }

  if (!localStorage.getItem("users")) {
    setItem("users", [
      {
        id: 1,
        name: "Admin",
        email: "admin@example.com",
        password: "admin123", // In a real app, this would be hashed
        created_at: new Date().toISOString(),
        isAdmin: true,
      },
    ])
  }
}

// Content services
export const contentService = {
  getThemes: () => {
    if (typeof window !== "undefined") {
      initializeData()
      return Promise.resolve(getItem<Theme[]>("themes", initialThemes))
    }
    return Promise.resolve(initialThemes)
  },

  getMusic: () => {
    if (typeof window !== "undefined") {
      initializeData()
      return Promise.resolve(getItem<BackgroundMusic[]>("music", initialMusic))
    }
    return Promise.resolve(initialMusic)
  },
}

// Message service
export const messageService = {
  createMessage: (messageData: {
    theme_id: string
    voice_id: string
    content: string
    audio_url?: string
    background_music_id?: string
  }) => {
    if (typeof window === "undefined") {
      return Promise.resolve({ id: 1 })
    }

    initializeData()
    const messages = getItem<Message[]>("messages", [])
    const themes = getItem<Theme[]>("themes", initialThemes)
    const music = getItem<BackgroundMusic[]>("music", initialMusic)

    // Get current user from localStorage
    const currentUser = localStorage.getItem("user")
    if (!currentUser) {
      return Promise.reject(new Error("User not authenticated"))
    }

    const user = JSON.parse(currentUser)
    const theme = themes.find((t) => t.id === messageData.theme_id)

    if (!theme) {
      return Promise.reject(new Error("Invalid theme"))
    }

    let backgroundMusic = null
    if (messageData.background_music_id) {
      const musicItem = music.find((m) => m.id === messageData.background_music_id)
      if (musicItem) {
        backgroundMusic = {
          id: musicItem.id,
          name: musicItem.name,
        }
      }
    }

    const newMessage: Message = {
      id: messages.length ? Math.max(...messages.map((m) => m.id)) + 1 : 1,
      content: messageData.content,
      audio_url: messageData.audio_url || "",
      user_id: user.id,
      theme: {
        id: theme.id,
        name: theme.name,
      },
      voice: {
        id: messageData.voice_id,
        name: "ElevenLabs Voice", // This would be updated with the actual voice name
      },
      background_music: backgroundMusic,
      created_at: new Date().toISOString(),
    }

    messages.push(newMessage)
    setItem("messages", messages)

    return Promise.resolve({ id: newMessage.id })
  },

  getUserMessages: () => {
    if (typeof window === "undefined") {
      return Promise.resolve([])
    }

    initializeData()

    // Get current user from localStorage
    const currentUser = localStorage.getItem("user")
    if (!currentUser) {
      return Promise.reject(new Error("User not authenticated"))
    }

    const user = JSON.parse(currentUser)
    const messages = getItem<Message[]>("messages", [])

    // Filter messages by user ID
    const userMessages = messages.filter((message) => message.user_id === user.id)

    return Promise.resolve(userMessages)
  },
}

import axios from "axios";

const API_BASE_URL = "/api/admin";

function getAuthToken() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  if (!user) return null;
  try {
    const parsed = JSON.parse(user);
    return parsed.token || null;
  } catch {
    return null;
  }
}

function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const adminService = {
  getUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // Themes
  createTheme: async (themeData: Theme) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/themes`, themeData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  updateTheme: async (id: string, themeData: Partial<Theme>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/themes/${id}`, themeData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  deleteTheme: async (id: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/themes/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Music
  createMusic: async (musicData: BackgroundMusic) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/music`, musicData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  updateMusic: async (id: string, musicData: Partial<BackgroundMusic>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/music/${id}`, musicData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  deleteMusic: async (id: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/music/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Voice Models
  getVoiceModels: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/voice-models`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  createVoiceModel: async (modelData: VoiceModel) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/voice-models`, modelData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  updateVoiceModel: async (id: string, modelData: Partial<VoiceModel>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/voice-models/${id}`, modelData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  deleteVoiceModel: async (id: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/voice-models/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

// Initialize data on import if in browser
if (typeof window !== "undefined") {
  initializeData()
}
