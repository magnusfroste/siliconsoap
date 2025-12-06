import { useState, useRef, useCallback, useEffect } from 'react';
import { generateSpeech, playBase64Audio, stopAudio, PlaybackControls } from '@/utils/elevenlabs/ttsService';
import { ConversationMessage } from '../types';
import { toast } from 'sonner';

export const useConversationPlayback = (messages: ConversationMessage[]) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const playbackControlsRef = useRef<PlaybackControls | null>(null);
  const isPlayingRef = useRef(false); // Guard against multiple playback instances

  const stop = useCallback(() => {
    // Abort any pending API calls
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Stop current audio playback
    stopAudio(playbackControlsRef);
    
    // Reset state
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentMessageIndex(-1);
    setIsGenerating(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const playSequentially = useCallback(async (startIndex: number = 0) => {
    // Prevent multiple simultaneous playbacks
    if (isPlayingRef.current) {
      console.log('Playback already in progress, ignoring request');
      return;
    }
    
    if (messages.length === 0) return;

    isPlayingRef.current = true;
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

          await playBase64Audio(base64Audio, playbackControlsRef);
        } catch (err) {
          setIsGenerating(false);
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }
          toast.error('Audio playback is currently unavailable. The text-to-speech service may be temporarily down.');
          console.error('TTS error:', err);
          stop();
          return;
        }

        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast.error('Failed to play audio');
    } finally {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentMessageIndex(-1);
      setIsGenerating(false);
    }
  }, [messages, stop]);

  const play = useCallback(() => {
    // Guard against multiple plays
    if (isPlayingRef.current) {
      console.log('Already playing, ignoring play request');
      return;
    }
    
    if (isPaused) {
      // Resume from current position
      playSequentially(currentMessageIndex);
    } else {
      // Start from beginning
      playSequentially(0);
    }
  }, [isPaused, currentMessageIndex, playSequentially]);

  const pause = useCallback(() => {
    // Abort pending API calls
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Stop current audio
    stopAudio(playbackControlsRef);
    
    isPlayingRef.current = false;
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
