import { useState, useEffect, useRef } from 'react';
import { recordDisplayedDebateView, recordSharedDebateView } from '@/services/debateViewsService';
import { chatService } from '@/services';
import { Chat, ChatMessage, ChatSettings } from '@/models/chat';

interface ChatData {
  id: string;
  title: string;
  scenario_id: string;
  prompt: string;
  settings: ChatSettings;
  real_view_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const useSharedChat = (shareId: string | undefined) => {
  const recordedShares = useRef(new Set<string>());
  const displayedShares = useRef(new Set<string>());
  const [chat, setChat] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'not_found' | 'deleted' | 'not_public' | null>(null);

  useEffect(() => {
    if (!shareId || displayedShares.current.has(shareId)) return;
    displayedShares.current.add(shareId);
    void recordDisplayedDebateView(shareId);
  }, [shareId]);

  useEffect(() => {
    if (!shareId) {
      setLoading(false);
      return;
    }

    loadSharedChat();
  }, [shareId]);

  const loadSharedChat = async () => {
    if (!shareId) return;

    try {
      setLoading(true);
      setError(null);

      const { chat: chatData, messages: messagesData } = await chatService.getSharedChat(shareId);

      if (!chatData) {
        setError('not_found');
        setLoading(false);
        return;
      }

      if (chatData.deleted_at) {
        setError('deleted');
        setLoading(false);
        return;
      }

      if (!chatData.is_public) {
        setError('not_public');
        setLoading(false);
        return;
      }

      setChat({
        id: chatData.id,
        title: chatData.title,
        scenario_id: chatData.scenario_id,
        prompt: chatData.prompt,
        settings: chatData.settings,
        real_view_count: chatData.real_view_count,
        created_at: chatData.created_at,
        updated_at: chatData.updated_at,
      });

      setMessages(messagesData);
      if (!recordedShares.current.has(shareId)) {
        recordedShares.current.add(shareId);
        void recordSharedDebateView(shareId);
      }
    } catch (err) {
      console.error('Error loading shared chat:', err);
      setError('not_found');
    } finally {
      setLoading(false);
    }
  };

  return { chat, messages, loading, error };
};
