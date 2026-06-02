import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatRepository } from '@/repositories';
import { chatService } from '@/services';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChatHistoryItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_shared: boolean;
}

const mapGuestChats = (): ChatHistoryItem[] => {
  const guestChats = chatRepository.getGuestChats();
  return guestChats
    .map((chat) => ({
      id: chat.id,
      title: chat.title,
      created_at: chat.created_at || '',
      updated_at: chat.updated_at || '',
      is_shared: false,
    }))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
};

const mapUserChats = async (userId: string): Promise<ChatHistoryItem[]> => {
  const chatData = await chatRepository.getChatsByUserId(userId);
  return chatData.map((chat) => ({
    id: chat.id,
    title: chat.title,
    created_at: chat.created_at || '',
    updated_at: chat.updated_at || '',
    is_shared: chat.is_public === true && !!chat.share_id,
  }));
};

export const useChatHistory = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const queryKey = ['chatHistory', userId ?? 'guest'];

  const { data: chats = [], isLoading: loading, refetch } = useQuery({
    queryKey,
    queryFn: async () => (userId ? mapUserChats(userId) : mapGuestChats()),
    staleTime: 30_000,
  });

  // Realtime subscription (logged-in users) + guest update events
  useEffect(() => {
    if (!userId) {
      const handler = () => queryClient.invalidateQueries({ queryKey });
      window.addEventListener('chatsUpdated', handler);
      return () => window.removeEventListener('chatsUpdated', handler);
    }

    const channel = chatRepository.subscribeToChats(userId, () => {
      queryClient.invalidateQueries({ queryKey });
    });
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const deleteChat = async (chatId: string) => {
    try {
      const success = await chatService.deleteChat(chatId, !userId);
      if (success) {
        toast.success('Chat deleted');
        queryClient.invalidateQueries({ queryKey });
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
    refreshChats: () => refetch(),
  };
};
