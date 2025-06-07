// Base API URL - change this to your Flask server URL in production
const API_URL = "http://localhost:5000/api"

// Helper function for making API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong")
  }

  return data
}

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    return fetchAPI("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  },

  login: async (email: string, password: string) => {
    return fetchAPI("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },
}

// Themes API
export const themesAPI = {
  getAll: async () => {
    return fetchAPI("/themes")
  },
}

// Celebrities API
export const celebritiesAPI = {
  getAll: async () => {
    return fetchAPI("/celebrities")
  },
}

// Background Music API
export const musicAPI = {
  getAll: async () => {
    return fetchAPI("/music")
  },
}

// Messages API
export const messagesAPI = {
  create: async (messageData: {
    theme_id: string
    celebrity_id: string
    content: string
    audio_url?: string
    background_music_id?: string
  }) => {
    return fetchAPI("/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    })
  },

  getUserMessages: async () => {
    return fetchAPI("/messages")
  },
}

// Admin API
export const adminAPI = {
  // Themes
  createTheme: async (themeData: {
    id: string
    name: string
    description: string
    icon: string
  }) => {
    return fetchAPI("/admin/themes", {
      method: "POST",
      body: JSON.stringify(themeData),
    })
  },

  updateTheme: async (
    id: string,
    themeData: {
      name?: string
      description?: string
      icon?: string
    },
  ) => {
    return fetchAPI(`/admin/themes/${id}`, {
      method: "PUT",
      body: JSON.stringify(themeData),
    })
  },

  deleteTheme: async (id: string) => {
    return fetchAPI(`/admin/themes/${id}`, {
      method: "DELETE",
    })
  },

  // Celebrities
  createCelebrity: async (celebrityData: {
    id: string
    name: string
    image: string
  }) => {
    return fetchAPI("/admin/celebrities", {
      method: "POST",
      body: JSON.stringify(celebrityData),
    })
  },

  updateCelebrity: async (
    id: string,
    celebrityData: {
      name?: string
      image?: string
    },
  ) => {
    return fetchAPI(`/admin/celebrities/${id}`, {
      method: "PUT",
      body: JSON.stringify(celebrityData),
    })
  },

  deleteCelebrity: async (id: string) => {
    return fetchAPI(`/admin/celebrities/${id}`, {
      method: "DELETE",
    })
  },

  // Music
  createMusic: async (musicData: {
    id: string
    name: string
    file: string
    category: string
  }) => {
    return fetchAPI("/admin/music", {
      method: "POST",
      body: JSON.stringify(musicData),
    })
  },

  updateMusic: async (
    id: string,
    musicData: {
      name?: string
      file?: string
      category?: string
    },
  ) => {
    return fetchAPI(`/admin/music/${id}`, {
      method: "PUT",
      body: JSON.stringify(musicData),
    })
  },

  deleteMusic: async (id: string) => {
    return fetchAPI(`/admin/music/${id}`, {
      method: "DELETE",
    })
  },

  // Users
  getUsers: async () => {
    return fetchAPI("/admin/users")
  },
}
