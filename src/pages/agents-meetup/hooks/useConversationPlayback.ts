import { useState, useRef, useCallback } from 'react';
import { generateSpeech, playBase64Audio } from '@/utils/elevenlabs/ttsService';
import { ConversationMessage } from '../types';
import { toast } from 'sonner';

export const useConversationPlayback = (messages: ConversationMessage[]) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentMessageIndex(-1);
    setIsGenerating(false);
  }, []);

  const playSequentially = useCallback(async (startIndex: number = 0) => {
    if (messages.length === 0) return;

    abortControllerRef.current = new AbortController();
    setIsPlaying(true);
    setIsPaused(false);

    try {
      for (let i = startIndex; i < messages.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        setCurrentMessageIndex(i);
        const message = messages[i];

        setIsGenerating(true);
        try {
          const base64Audio = await generateSpeech(message.message, message.agent);
          setIsGenerating(false);

          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          await playBase64Audio(base64Audio);
        } catch (err) {
          setIsGenerating(false);
          toast.error('Audio playback is currently unavailable. The text-to-speech service may be temporarily down.');
          console.error('TTS error:', err);
          stop();
          break;
        }

        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast.error('Failed to play audio');
    } finally {
      stop();
    }
  }, [messages, stop]);

  const play = useCallback(() => {
    if (isPaused) {
      // Resume from current position
      playSequentially(currentMessageIndex);
    } else {
      // Start from beginning
      playSequentially(0);
    }
  }, [isPaused, currentMessageIndex, playSequentially]);

  const pause = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  return {
    isPlaying,
    isPaused,
    currentMessageIndex,
    isGenerating,
    play,
    pause,
    stop,
  };
};
