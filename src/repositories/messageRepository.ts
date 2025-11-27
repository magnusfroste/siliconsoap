// Message Repository - handles all message data access
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, GuestChat } from '@/models/chat';
import type { RealtimeChannel } from '@supabase/supabase-js';

const GUEST_CHATS_KEY = 'guest_chats';

export const messageRepository = {
  // Get messages for a chat
  async getMessagesByChatId(chatId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('agent_chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return [];
    }

    return data || [];
  },

  // Create a message
  async createMessage(chatId: string, message: ChatMessage): Promise<boolean> {
    const { error } = await supabase
      .from('agent_chat_messages')
      .insert({
        chat_id: chatId,
        agent: message.agent,
        message: message.message,
        model: message.model,
        persona: message.persona
      });

    if (error) {
      console.error('Error saving message:', error);
      throw error;
    }

    return true;
  },

  // Create multiple messages at once
  async createMessages(chatId: string, messages: ChatMessage[]): Promise<boolean> {
    const messagesToInsert = messages.map(msg => ({
      chat_id: chatId,
      agent: msg.agent,
      message: msg.message,
      model: msg.model,
      persona: msg.persona
    }));

    const { error } = await supabase
      .from('agent_chat_messages')
      .insert(messagesToInsert);

    if (error) {
      console.error('Error saving messages:', error);
      throw error;
    }

    return true;
  },

  // Guest chat message operations
  getGuestMessages(chatId: string): ChatMessage[] {
    try {
      const guestChats = JSON.parse(localStorage.getItem(GUEST_CHATS_KEY) || '{}');
      return guestChats[chatId]?.messages || [];
    } catch {
      return [];
    }
  },

  saveGuestMessage(chatId: string, message: ChatMessage): void {
    try {
      const guestChats = JSON.parse(localStorage.getItem(GUEST_CHATS_KEY) || '{}');
      if (guestChats[chatId]) {
        guestChats[chatId].messages = guestChats[chatId].messages || [];
        guestChats[chatId].messages.push(message);
        guestChats[chatId].updated_at = new Date().toISOString();
        localStorage.setItem(GUEST_CHATS_KEY, JSON.stringify(guestChats));
      }
    } catch (error) {
      console.error('Error saving guest message:', error);
    }
  },

  // Subscribe to real-time message updates
  subscribeToMessages(
    chatId: string,
    onMessage: (message: ChatMessage) => void
  ): RealtimeChannel {
    return supabase
      .channel(`chat_messages_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          onMessage(payload.new as ChatMessage);
        }
      )
      .subscribe();
  },

  // Unsubscribe from real-time updates
  unsubscribe(channel: RealtimeChannel): void {
    supabase.removeChannel(channel);
  }
};
