// Guest to User Migration Service
// Migrates localStorage guest chats to the database when a user signs up

import { supabase } from '@/integrations/supabase/client';
import { GuestChat, ChatMessage } from '@/models/chat';

const GUEST_CHATS_KEY = 'guest_chats';

export const guestMigrationService = {
  /**
   * Get all guest chats from localStorage
   */
  getGuestChats(): GuestChat[] {
    try {
      const guestChats = JSON.parse(localStorage.getItem(GUEST_CHATS_KEY) || '{}');
      return Object.values(guestChats);
    } catch {
      return [];
    }
  },

  /**
   * Check if there are guest chats to migrate
   */
  hasGuestChats(): boolean {
    return this.getGuestChats().length > 0;
  },

  /**
   * Migrate all guest chats to the database for a new user
   */
  async migrateGuestChats(userId: string): Promise<{ success: number; failed: number }> {
    const guestChats = this.getGuestChats();
    let success = 0;
    let failed = 0;

    console.log(`[Migration] Starting migration of ${guestChats.length} guest chats for user ${userId}`);

    for (const guestChat of guestChats) {
      try {
        // Create the chat in the database
        const { data: newChat, error: chatError } = await supabase
          .from('agent_chats')
          .insert({
            user_id: userId,
            title: guestChat.title,
            scenario_id: guestChat.scenario_id,
            prompt: guestChat.prompt,
            settings: guestChat.settings as any,
            created_at: guestChat.created_at,
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (chatError) {
          console.error(`[Migration] Failed to create chat: ${chatError.message}`);
          failed++;
          continue;
        }

        // Migrate all messages for this chat
        if (guestChat.messages && guestChat.messages.length > 0) {
          const messagesToInsert = guestChat.messages.map((msg: ChatMessage) => ({
            chat_id: newChat.id,
            agent: msg.agent,
            message: msg.message,
            model: msg.model,
            persona: msg.persona,
            created_at: msg.created_at || new Date().toISOString()
          }));

          const { error: messagesError } = await supabase
            .from('agent_chat_messages')
            .insert(messagesToInsert);

          if (messagesError) {
            console.error(`[Migration] Failed to migrate messages: ${messagesError.message}`);
            // Chat was created but messages failed - still count as partial success
          }
        }

        // Remove migrated chat from localStorage
        this.removeGuestChat(guestChat.id);
        success++;
        console.log(`[Migration] Successfully migrated chat: ${guestChat.title}`);
      } catch (error) {
        console.error(`[Migration] Error migrating chat:`, error);
        failed++;
      }
    }

    console.log(`[Migration] Complete. Success: ${success}, Failed: ${failed}`);
    return { success, failed };
  },

  /**
   * Remove a specific guest chat from localStorage
   */
  removeGuestChat(chatId: string): void {
    try {
      const guestChats = JSON.parse(localStorage.getItem(GUEST_CHATS_KEY) || '{}');
      delete guestChats[chatId];
      localStorage.setItem(GUEST_CHATS_KEY, JSON.stringify(guestChats));
    } catch (error) {
      console.error('[Migration] Error removing guest chat:', error);
    }
  },

  /**
   * Clear all guest chats from localStorage
   */
  clearAllGuestChats(): void {
    try {
      localStorage.removeItem(GUEST_CHATS_KEY);
    } catch (error) {
      console.error('[Migration] Error clearing guest chats:', error);
    }
  }
};
