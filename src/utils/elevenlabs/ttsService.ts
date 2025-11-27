import { supabase } from '@/integrations/supabase/client';

// Voice mapping per agent
export const AGENT_VOICES: Record<string, string> = {
  'Agent A': 'JBFqnCBsd6RMkjVDRZzb', // George
  'Agent B': 'EXAVITQu4vr4xnSDxMaL', // Sarah
  'Agent C': 'IKne3meq5aSn9XLyUdCD', // Charlie
};

export const generateSpeech = async (text: string, agent: string): Promise<string> => {
  const voiceId = AGENT_VOICES[agent] || AGENT_VOICES['Agent A'];
  
  const { data, error } = await supabase.functions.invoke('text-to-speech', {
    body: { text, voiceId },
  });

  if (error) {
    console.error('TTS generation error:', error);
    throw new Error(`Failed to generate speech: ${error.message}`);
  }

  if (!data?.audioContent) {
    throw new Error('No audio content returned from TTS service');
  }

  return data.audioContent;
};

export const playBase64Audio = (base64Audio: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };

      audio.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      };

      audio.play().catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};
