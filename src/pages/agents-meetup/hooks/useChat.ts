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
  share_id?: string | null;
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

    // Handle guest chats - inline to avoid hoisting issues
    if (chatRepository.isGuestChat(chatId)) {
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
      setLoading(false);
      return;
    }

    // Handle logged-in user chats
    if (!userId) {
      setLoading(false);
      return;
    }

    // Load chat from database
    const loadChatFromDb = async () => {
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
          settings: chatData.settings,
          share_id: chatData.share_id
        });
        setMessages(messagesData);
      } catch (error) {
        console.error('Error loading chat:', error);
        toast.error('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    loadChatFromDb();

    // Set up real-time subscription for new messages
    // Use a Set to track message IDs to prevent duplicates
    const seenMessageIds = new Set<string>();
    
    const channel: RealtimeChannel = messageRepository.subscribeToMessages(
      chatId,
      (newMessage) => {
        // Prevent duplicate messages from realtime subscription
        const messageKey = newMessage.id || `${newMessage.agent}-${newMessage.message?.substring(0, 50)}`;
        if (seenMessageIds.has(messageKey)) return;
        seenMessageIds.add(messageKey);
        
        setMessages(prev => {
          // Additional check: don't add if message already exists in state
          const exists = prev.some(m => 
            m.id === newMessage.id || 
            (m.agent === newMessage.agent && m.message === newMessage.message && m.created_at === newMessage.created_at)
          );
          if (exists) return prev;
          return [...prev, newMessage];
        });
      }
    );

    return () => {
      messageRepository.unsubscribe(channel);
    };
  }, [chatId, userId]);

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
      // For guest chats, we update local state immediately since there's no realtime
      setMessages(prev => {
        // Prevent duplicates
        const exists = prev.some(m => 
          m.agent === message.agent && m.message === message.message
        );
        if (exists) return prev;
        return [...prev, message];
      });
      return;
    }

    // For logged-in users, the realtime subscription will update state
    // so we don't update state here to avoid duplicates
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

  // Refresh function to reload chat data
  const refreshChat = useCallback(async () => {
    if (!chatId) return;
    
    if (chatRepository.isGuestChat(chatId)) {
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
      return;
    }

    if (!userId) return;

    try {
      const { chat: chatData, messages: messagesData } = await chatService.getChatWithMessages(chatId, userId);
      if (chatData) {
        setChat({
          id: chatData.id,
          title: chatData.title,
          scenario_id: chatData.scenario_id,
          prompt: chatData.prompt,
          settings: chatData.settings,
          share_id: chatData.share_id
        });
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error refreshing chat:', error);
    }
  }, [chatId, userId]);

  return { 
    chat, 
    messages, 
    loading, 
    saveChat, 
    updateChatTitle, 
    refreshChat, 
    saveMessage, 
    setMessages, 
    shareChat 
  };
};
