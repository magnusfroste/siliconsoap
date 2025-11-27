import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!userId) {
      loadGuestChats();
      setLoading(false);
      
      // Listen for guest chat updates
      const handleChatsUpdated = () => loadGuestChats();
      window.addEventListener('chatsUpdated', handleChatsUpdated);
      return () => window.removeEventListener('chatsUpdated', handleChatsUpdated);
    }

    loadChats();

    // Set up realtime subscription using repository
    const channel = chatRepository.subscribeToChats(userId, () => {
      loadChats();
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadGuestChats = () => {
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
      setChats(chatList);
    } catch (error) {
      console.error('Error loading guest chats:', error);
      setChats([]);
    }
  };

  const loadChats = async () => {
    if (!userId) return;

    try {
      const chatData = await chatRepository.getChatsByUserId(userId);
      const chatList: ChatHistoryItem[] = chatData.map((chat) => ({
        id: chat.id,
        title: chat.title,
        created_at: chat.created_at || '',
        updated_at: chat.updated_at || ''
      }));
      setChats(chatList);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId: string) => {
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
  };

  return { 
    chats, 
    loading, 
    deleteChat, 
    refreshChats: userId ? loadChats : loadGuestChats 
  };
};
