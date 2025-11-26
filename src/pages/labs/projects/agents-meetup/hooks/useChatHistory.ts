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
      // Load guest chats from localStorage
      loadGuestChats();
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

  const loadGuestChats = () => {
    try {
      const guestChatsStr = localStorage.getItem('guest_chats');
      if (!guestChatsStr) {
        setChats([]);
        return;
      }

      const guestChats = JSON.parse(guestChatsStr);
      const chatList: ChatHistoryItem[] = Object.values(guestChats).map((chat: any) => ({
        id: chat.id,
        title: chat.title,
        created_at: chat.created_at,
        updated_at: chat.updated_at
      }));

      // Sort by updated_at descending
      chatList.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      setChats(chatList);
    } catch (error) {
      console.error('Error loading guest chats:', error);
      setChats([]);
    }
  };

  const loadChats = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('agent_chats')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
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
    // Handle guest chat deletion
    if (chatId.startsWith('guest_')) {
      try {
        const guestChatsStr = localStorage.getItem('guest_chats');
        if (guestChatsStr) {
          const guestChats = JSON.parse(guestChatsStr);
          delete guestChats[chatId];
          localStorage.setItem('guest_chats', JSON.stringify(guestChats));
          toast.success('Chat deleted');
          loadGuestChats();
        }
      } catch (error) {
        console.error('Error deleting guest chat:', error);
        toast.error('Failed to delete chat');
      }
      return;
    }

    // Handle logged-in user chat deletion (soft delete)
    const { error } = await supabase
      .from('agent_chats')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', chatId);

    if (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    } else {
      toast.success('Chat deleted');
      loadChats();
    }
  };

  return { chats, loading, deleteChat, refreshChats: userId ? loadChats : loadGuestChats };
};
