const ELEVENLABS_API_KEY = 'sk_2a3812635822c687f9265e146904177f219986190681a9d2';
const API_BASE_URL = 'https://api.elevenlabs.io/v1';

export interface VoiceModel {
  voice_id: string;
  name: string;
  preview_url: string;
  description?: string;
  category?: string;
}

export async function listVoices(): Promise<VoiceModel[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.statusText}`);
    }

    const data = await response.json();
    return data.voices.map((voice: any) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      preview_url: voice.preview_url,
      description: voice.description || 'Professional voice model',
      category: voice.category || 'professional',
    }));
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
}

export async function generateSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(`${API_BASE_URL}/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate speech: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}
