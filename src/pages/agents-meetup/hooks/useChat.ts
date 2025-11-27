import { useState, useEffect, useCallback } from 'react';
import { chatRepository, messageRepository } from '@/repositories';
import { chatService } from '@/services';
import { Chat, ChatMessage, ChatSettings } from '@/models/chat';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Re-export for backward compatibility
export interface ChatData {
  id: string;
  title: string;
  scenario_id: string;
  prompt: string;
  settings: ChatSettings;
}

export const useChat = (chatId: string | undefined, userId: string | undefined) => {
  const [chat, setChat] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    // Handle guest chats
    if (chatRepository.isGuestChat(chatId)) {
      loadGuestChat();
      setLoading(false);
      return;
    }

    // Handle logged-in user chats
    if (!userId) {
      setLoading(false);
      return;
    }

    loadChat();

    // Set up real-time subscription for new messages
    const channel: RealtimeChannel = messageRepository.subscribeToMessages(
      chatId,
      (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
      }
    );

    return () => {
      messageRepository.unsubscribe(channel);
    };
  }, [chatId, userId]);

  const loadGuestChat = () => {
    if (!chatId) return;

    const guestChat = chatRepository.getGuestChat(chatId);
    if (guestChat) {
      setChat({
        id: guestChat.id,
        title: guestChat.title,
        scenario_id: guestChat.scenario_id,
        prompt: guestChat.prompt,
        settings: guestChat.settings
      });
      setMessages(guestChat.messages || []);
    }
  };

  const loadChat = async () => {
    if (!chatId || !userId) return;

    try {
      const { chat: chatData, messages: messagesData } = await chatService.getChatWithMessages(chatId, userId);

      if (!chatData) {
        toast.error('Failed to load chat');
        setLoading(false);
        return;
      }

      setChat({
        id: chatData.id,
        title: chatData.title,
        scenario_id: chatData.scenario_id,
        prompt: chatData.prompt,
        settings: chatData.settings
      });
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading chat:', error);
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const saveChat = async (
    title: string,
    scenarioId: string,
    prompt: string,
    settings: ChatSettings,
    conversation: ChatMessage[]
  ): Promise<string | null> => {
    if (!userId) return null;

    try {
      const chat = await chatService.createChat({
        user_id: userId,
        title,
        scenario_id: scenarioId,
        prompt,
        settings
      });

      // Save messages
      if (conversation.length > 0) {
        await messageRepository.createMessages(chat.id, conversation);
      }

      toast.success('Chat saved!');
      return chat.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to save chat');
      return null;
    }
  };

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    const success = await chatService.updateTitle(chatId, newTitle);
    if (success) {
      setChat(prev => prev ? { ...prev, title: newTitle } : null);
    } else {
      toast.error('Failed to update title');
    }
  };

  const saveMessage = useCallback(async (chatId: string, message: ChatMessage) => {
    if (chatRepository.isGuestChat(chatId)) {
      messageRepository.saveGuestMessage(chatId, message);
      setMessages(prev => [...prev, message]);
      return;
    }

    await chatService.saveMessage(chatId, message);
  }, []);

  const shareChat = async (chatId: string): Promise<string | null> => {
    if (!userId) {
      toast.error('You must be logged in to share chats');
      return null;
    }

    try {
      const shareId = await chatService.shareChat(chatId, userId);
      return shareId;
    } catch (error) {
      console.error('Error sharing chat:', error);
      toast.error('Failed to share chat');
      return null;
    }
  };

  return { 
    chat, 
    messages, 
    loading, 
    saveChat, 
    updateChatTitle, 
    refreshChat: loadChat, 
    saveMessage, 
    setMessages, 
    shareChat 
  };
};
