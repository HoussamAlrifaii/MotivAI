// This file is kept for compatibility but is no longer used
// Voice synthesis is now handled directly in the MessageGenerator component

export const celebrityVoiceIds: Record<string, string> = {
  "morgan-freeman": "voice_morgan_freeman",
  "oprah-winfrey": "voice_oprah_winfrey",
  "dwayne-johnson": "voice_dwayne_johnson",
  beyonce: "voice_beyonce",
  "tom-hanks": "voice_tom_hanks",
  "jennifer-lawrence": "voice_jennifer_lawrence",
}

// Interface for the response from the text-to-speech API
interface TextToSpeechResponse {
  audioUrl: string
  taskId?: string
  status: "success" | "processing" | "failed"
  error?: string
}

/**
 * Generate speech from text using FineVoice's API
 * This is a placeholder function and is no longer used
 */
export async function generateSpeech(
  text: string,
  voiceId: string,
  options: {
    speed?: number
    pitch?: number
    emotion?: "neutral" | "happy" | "sad" | "excited" | "serious"
  } = {},
): Promise<TextToSpeechResponse> {
  return {
    audioUrl: "",
    status: "success",
  }
}

/**
 * Check the status of a text-to-speech task
 * This is a placeholder function and is no longer used
 */
export async function checkTaskStatus(taskId: string): Promise<TextToSpeechResponse> {
  return {
    audioUrl: "",
    status: "success",
    taskId: taskId,
  }
}

// Emotion mapping for different themes
export const themeToEmotion: Record<string, "neutral" | "happy" | "sad" | "excited" | "serious"> = {
  motivation: "excited",
  compliment: "happy",
  joke: "happy",
  advice: "serious",
}

// Voice characteristics for each celebrity
export const celebrityVoiceConfig: Record<
  string,
  {
    speed: number
    pitch: number
    description: string
  }
> = {
  "morgan-freeman": {
    speed: 0.8,
    pitch: 0.9,
    description: "Deep, resonant voice with a slow, deliberate pace",
  },
  "oprah-winfrey": {
    speed: 1.0,
    pitch: 1.1,
    description: "Warm, expressive voice with dynamic intonation",
  },
  "dwayne-johnson": {
    speed: 0.9,
    pitch: 0.8,
    description: "Strong, energetic voice with confident delivery",
  },
  beyonce: {
    speed: 1.0,
    pitch: 1.2,
    description: "Smooth, melodic voice with rhythmic cadence",
  },
  "tom-hanks": {
    speed: 0.9,
    pitch: 1.0,
    description: "Friendly, approachable voice with a gentle tone",
  },
  "jennifer-lawrence": {
    speed: 1.0,
    pitch: 1.1,
    description: "Youthful, vibrant voice with a casual delivery",
  },
}
