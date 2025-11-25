import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ConversationMessage } from '../types';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatData {
  id: string;
  title: string;
  scenario_id: string;
  prompt: string;
  settings: any;
}

export const useChat = (chatId: string | undefined, userId: string | undefined) => {
  const [chat, setChat] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId || !userId) {
      setLoading(false);
      return;
    }

    loadChat();

    // Set up real-time subscription for new messages
    const channel: RealtimeChannel = supabase
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
          const newMessage = payload.new as ConversationMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, userId]);

  const loadChat = async () => {
    if (!chatId || !userId) return;

    // Load chat metadata
    const { data: chatData, error: chatError } = await supabase
      .from('agent_chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', userId)
      .single();

    if (chatError) {
      console.error('Error loading chat:', chatError);
      toast.error('Failed to load chat');
      setLoading(false);
      return;
    }

    setChat(chatData);

    // Load messages
    const { data: messagesData, error: messagesError } = await supabase
      .from('agent_chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error loading messages:', messagesError);
      toast.error('Failed to load messages');
    } else {
      setMessages(messagesData || []);
    }

    setLoading(false);
  };

  const saveChat = async (
    title: string,
    scenarioId: string,
    prompt: string,
    settings: any,
    conversation: ConversationMessage[]
  ): Promise<string | null> => {
    if (!userId) return null;

    // Create chat
    const { data: chatData, error: chatError } = await supabase
      .from('agent_chats')
      .insert({
        user_id: userId,
        title,
        scenario_id: scenarioId,
        prompt,
        settings
      })
      .select()
      .single();

    if (chatError) {
      console.error('Error creating chat:', chatError);
      toast.error('Failed to save chat');
      return null;
    }

    // Save messages
    const messagesToInsert = conversation.map(msg => ({
      chat_id: chatData.id,
      agent: msg.agent,
      message: msg.message,
      model: msg.model,
      persona: msg.persona
    }));

    const { error: messagesError } = await supabase
      .from('agent_chat_messages')
      .insert(messagesToInsert);

    if (messagesError) {
      console.error('Error saving messages:', messagesError);
      toast.error('Failed to save messages');
      return null;
    }

    toast.success('Chat saved!');
    return chatData.id;
  };

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    const { error } = await supabase
      .from('agent_chats')
      .update({ title: newTitle })
      .eq('id', chatId);

    if (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title');
    } else {
      setChat(prev => prev ? { ...prev, title: newTitle } : null);
    }
  };

  const saveMessage = useCallback(async (chatId: string, message: ConversationMessage) => {
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
  }, []);

  return { chat, messages, loading, saveChat, updateChatTitle, refreshChat: loadChat, saveMessage, setMessages };
};
