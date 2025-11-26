import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ConversationMessage } from '../types';

interface ChatData {
  id: string;
  title: string;
  scenario_id: string;
  prompt: string;
  settings: any;
}

export const useSharedChat = (shareId: string | undefined) => {
  const [chat, setChat] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Fetch chat by share_id (no auth required due to RLS policy)
      const { data: chatData, error: chatError } = await supabase
        .from('agent_chats')
        .select('*')
        .eq('share_id', shareId)
        .eq('is_public', true)
        .maybeSingle();

      if (chatError) throw chatError;
      
      if (!chatData) {
        setError('Chat not found or not shared');
        setLoading(false);
        return;
      }

      setChat({
        id: chatData.id,
        title: chatData.title,
        scenario_id: chatData.scenario_id,
        prompt: chatData.prompt,
        settings: chatData.settings,
      });

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('agent_chat_messages')
        .select('*')
        .eq('chat_id', chatData.id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      setMessages(messagesData || []);
    } catch (err) {
      console.error('Error loading shared chat:', err);
      setError('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  return { chat, messages, loading, error };
};
