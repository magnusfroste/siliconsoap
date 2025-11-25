import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChatHistoryItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useChatHistory = (userId: string | undefined) => {
  const [chats, setChats] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setChats([]);
      setLoading(false);
      return;
    }

    loadChats();

    // Set up realtime subscription
    const channel = supabase
      .channel('agent_chats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_chats',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadChats = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('agent_chats')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chat history');
    } else {
      setChats(data || []);
    }
    setLoading(false);
  };

  const deleteChat = async (chatId: string) => {
    const { error } = await supabase
      .from('agent_chats')
      .delete()
      .eq('id', chatId);

    if (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    } else {
      toast.success('Chat deleted');
      loadChats();
    }
  };

  return { chats, loading, deleteChat, refreshChats: loadChats };
};
