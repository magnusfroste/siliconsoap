import { useState, useRef, useCallback, useEffect } from 'react';
import { generateSpeech, playBase64Audio, stopAudio, PlaybackControls } from '@/utils/elevenlabs/ttsService';
import { ConversationMessage } from '../types';
import { parseAgentResponse } from '../utils/parseAgentResponse';
import { toast } from 'sonner';

export const useConversationPlayback = (messages: ConversationMessage[]) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const playbackControlsRef = useRef<PlaybackControls | null>(null);
  const isPlayingRef = useRef(false);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    stopAudio(playbackControlsRef);
    
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentMessageIndex(-1);
    setIsGenerating(false);
    setTheaterMode(false);
    setAudioDuration(null);
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const playSequentially = useCallback(async (startIndex: number = 0, withTheater: boolean = false) => {
    if (isPlayingRef.current) {
      console.log('Playback already in progress, ignoring request');
      return;
    }
    
    if (messages.length === 0) return;

    isPlayingRef.current = true;
    abortControllerRef.current = new AbortController();
    setIsPlaying(true);
    setIsPaused(false);
    
    if (withTheater) {
      setTheaterMode(true);
    }

    try {
      for (let i = startIndex; i < messages.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        setCurrentMessageIndex(i);
        setAudioDuration(null); // Reset for each message
        const message = messages[i];

        if (withTheater) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        setIsGenerating(true);
        try {
          // Strip private <thinking> scratchpad so TTS never reads it aloud.
          const { publicMessage } = parseAgentResponse(message.message);
          const base64Audio = await generateSpeech(publicMessage, message.agent);
          setIsGenerating(false);

          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          await playBase64Audio(base64Audio, playbackControlsRef, (durationMs) => {
            setAudioDuration(durationMs);
          });
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

        if (withTheater) {
          // Brief pause between messages in theater mode
          await new Promise(resolve => setTimeout(resolve, 500));
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
      setTheaterMode(false);
      setAudioDuration(null);
    }
  }, [messages, stop]);

  const play = useCallback(() => {
    if (isPlayingRef.current) {
      console.log('Already playing, ignoring play request');
      return;
    }
    
    if (isPaused) {
      playSequentially(currentMessageIndex, theaterMode);
    } else {
      playSequentially(0, false);
    }
  }, [isPaused, currentMessageIndex, playSequentially, theaterMode]);

  const playTheater = useCallback(() => {
    if (isPlayingRef.current) {
      console.log('Already playing, ignoring theater request');
      return;
    }
    playSequentially(0, true);
  }, [playSequentially]);

  const pause = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
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
    theaterMode,
    audioDuration,
    play,
    playTheater,
    pause,
    stop,
  };
};
