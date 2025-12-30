// Chat Repository - handles all chat data access
import { supabase } from '@/integrations/supabase/client';
import { Chat, ChatSettings, CreateChatInput, GuestChat } from '@/models/chat';

const GUEST_CHATS_KEY = 'guest_chats';

export const chatRepository = {
  // Check if chat ID is a guest chat
  isGuestChat(chatId: string): boolean {
    return chatId?.startsWith('guest_');
  },

  // Create a new chat in the database
  async createChat(input: CreateChatInput): Promise<Chat | null> {
    const { data, error } = await supabase
      .from('agent_chats')
      .insert({
        user_id: input.user_id,
        title: input.title,
        scenario_id: input.scenario_id,
        prompt: input.prompt,
        settings: input.settings as any
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      throw error;
    }

    return data ? {
      ...data,
      settings: data.settings as unknown as ChatSettings
    } : null;
  },

  // Get a chat by ID
  async getChatById(chatId: string, userId: string): Promise<Chat | null> {
    const { data, error } = await supabase
      .from('agent_chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error loading chat:', error);
      return null;
    }

    return data ? {
      ...data,
      settings: data.settings as unknown as ChatSettings
    } : null;
  },

  // Get chat by share ID (public) - uses secure function that excludes user_id
  async getChatByShareId(shareId: string): Promise<Chat | null> {
    const { data, error } = await supabase
      .rpc('get_shared_chat', { p_share_id: shareId })
      .maybeSingle();

    if (error) {
      console.error('Error loading shared chat:', error);
      return null;
    }

    return data ? {
      ...data,
      user_id: null, // Explicitly null for shared chats (privacy)
      settings: data.settings as unknown as ChatSettings
    } : null;
  },

  // Get all chats for a user
  async getChatsByUserId(userId: string): Promise<Chat[]> {
    const { data, error } = await supabase
      .from('agent_chats')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading chats:', error);
      return [];
    }

    return (data || []).map(chat => ({
      ...chat,
      settings: chat.settings as unknown as ChatSettings
    }));
  },

  // Update chat title
  async updateChatTitle(chatId: string, title: string): Promise<boolean> {
    const { error } = await supabase
      .from('agent_chats')
      .update({ title })
      .eq('id', chatId);

    if (error) {
      console.error('Error updating title:', error);
      return false;
    }

    return true;
  },

  // Update chat settings (for storing analysis, etc.)
  async updateChatSettings(chatId: string, settings: Partial<ChatSettings>): Promise<boolean> {
    // First get existing settings
    const { data: existing } = await supabase
      .from('agent_chats')
      .select('settings')
      .eq('id', chatId)
      .single();

    const existingSettings = (existing?.settings as Record<string, unknown>) || {};
    const mergedSettings = { ...existingSettings, ...settings };

    const { error } = await supabase
      .from('agent_chats')
      .update({ settings: mergedSettings })
      .eq('id', chatId);

    if (error) {
      console.error('Error updating settings:', error);
      return false;
    }

    return true;
  },

  // Soft delete a chat
  async deleteChat(chatId: string): Promise<boolean> {
    const { error } = await supabase
      .from('agent_chats')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', chatId);

    if (error) {
      console.error('Error deleting chat:', error);
      return false;
    }

    return true;
  },

  // Share a chat (generate share_id and set is_public)
  async shareChat(chatId: string): Promise<string | null> {
    // Check if already shared
    const { data: existing } = await supabase
      .from('agent_chats')
      .select('share_id')
      .eq('id', chatId)
      .single();

    if (existing?.share_id) {
      return existing.share_id;
    }

    // Generate unique share_id
    const shareId = Array.from({ length: 8 }, () => 
      'abcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 36))
    ).join('');

    const { error } = await supabase
      .from('agent_chats')
      .update({ share_id: shareId, is_public: true })
      .eq('id', chatId);

    if (error) {
      console.error('Error sharing chat:', error);
      return null;
    }

    return shareId;
  },

  // Guest chat operations (localStorage)
  getGuestChat(chatId: string): GuestChat | null {
    try {
      const guestChats = JSON.parse(localStorage.getItem(GUEST_CHATS_KEY) || '{}');
      return guestChats[chatId] || null;
    } catch {
      return null;
    }
  },

  saveGuestChat(chat: GuestChat): void {
    try {
      const guestChats = JSON.parse(localStorage.getItem(GUEST_CHATS_KEY) || '{}');
      guestChats[chat.id] = chat;
      localStorage.setItem(GUEST_CHATS_KEY, JSON.stringify(guestChats));
    } catch (error) {
      console.error('Error saving guest chat:', error);
    }
  },

  getGuestChats(): GuestChat[] {
    try {
      const guestChats = JSON.parse(localStorage.getItem(GUEST_CHATS_KEY) || '{}');
      return Object.values(guestChats);
    } catch {
      return [];
    }
  },

  deleteGuestChat(chatId: string): void {
    try {
      const guestChats = JSON.parse(localStorage.getItem(GUEST_CHATS_KEY) || '{}');
      delete guestChats[chatId];
      localStorage.setItem(GUEST_CHATS_KEY, JSON.stringify(guestChats));
    } catch (error) {
      console.error('Error deleting guest chat:', error);
    }
  },

  // Subscribe to chat updates
  subscribeToChats(userId: string, callback: () => void) {
    return supabase
      .channel(`user_chats_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_chats',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
};
