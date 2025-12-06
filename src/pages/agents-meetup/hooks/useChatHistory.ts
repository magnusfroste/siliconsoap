import { useState, useEffect, useRef, useCallback } from 'react';
import { chatRepository } from '@/repositories';
import { chatService } from '@/services';
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
  const isMounted = useRef(true);
  const isLoading = useRef(false);

  const loadGuestChats = useCallback(() => {
    try {
      const guestChats = chatRepository.getGuestChats();
      const chatList: ChatHistoryItem[] = guestChats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        created_at: chat.created_at || '',
        updated_at: chat.updated_at || ''
      }));

      // Sort by updated_at descending
      chatList.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      
      if (isMounted.current) {
        setChats(chatList);
      }
    } catch (error) {
      console.error('Error loading guest chats:', error);
      if (isMounted.current) {
        setChats([]);
      }
    }
  }, []);

  const loadChats = useCallback(async () => {
    if (!userId || isLoading.current) return;
    
    isLoading.current = true;

    try {
      const chatData = await chatRepository.getChatsByUserId(userId);
      const chatList: ChatHistoryItem[] = chatData.map((chat) => ({
        id: chat.id,
        title: chat.title,
        created_at: chat.created_at || '',
        updated_at: chat.updated_at || ''
      }));
      
      if (isMounted.current) {
        setChats(chatList);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chat history');
    } finally {
      isLoading.current = false;
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    isMounted.current = true;
    
    if (!userId) {
      loadGuestChats();
      setLoading(false);
      
      // Listen for guest chat updates
      const handleChatsUpdated = () => loadGuestChats();
      window.addEventListener('chatsUpdated', handleChatsUpdated);
      return () => {
        isMounted.current = false;
        window.removeEventListener('chatsUpdated', handleChatsUpdated);
      };
    }

    loadChats();

    // Set up realtime subscription using repository
    const channel = chatRepository.subscribeToChats(userId, () => {
      loadChats();
    });

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [userId, loadChats, loadGuestChats]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      const success = await chatService.deleteChat(chatId, !userId);
      
      if (success) {
        toast.success('Chat deleted');
        userId ? loadChats() : loadGuestChats();
      } else {
        toast.error('Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  }, [userId, loadChats, loadGuestChats]);

  return { 
    chats, 
    loading, 
    deleteChat, 
    refreshChats: userId ? loadChats : loadGuestChats 
  };
};
