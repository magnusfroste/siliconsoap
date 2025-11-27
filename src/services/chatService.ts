// Chat Service - business logic for chat operations
import { chatRepository, messageRepository } from '@/repositories';
import { Chat, ChatMessage, ChatSettings, CreateChatInput, GuestChat } from '@/models/chat';

export const chatService = {
  // Create a new chat for logged-in user
  async createChat(input: CreateChatInput): Promise<Chat> {
    const chat = await chatRepository.createChat(input);
    if (!chat) {
      throw new Error('Failed to create chat');
    }
    return chat;
  },

  // Create a guest chat (localStorage)
  createGuestChat(
    prompt: string,
    scenarioId: string,
    settings: ChatSettings
  ): GuestChat {
    const chatId = `guest_${Date.now()}`;
    const title = prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '');
    
    const chat: GuestChat = {
      id: chatId,
      title,
      scenario_id: scenarioId,
      prompt,
      settings,
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    chatRepository.saveGuestChat(chat);
    
    // Dispatch event for sidebar update
    window.dispatchEvent(new CustomEvent('chatsUpdated'));
    
    return chat;
  },

  // Get chat with messages
  async getChatWithMessages(
    chatId: string,
    userId?: string
  ): Promise<{ chat: Chat | null; messages: ChatMessage[] }> {
    if (chatRepository.isGuestChat(chatId)) {
      const guestChat = chatRepository.getGuestChat(chatId);
      return {
        chat: guestChat,
        messages: guestChat?.messages || []
      };
    }

    if (!userId) {
      return { chat: null, messages: [] };
    }

    const chat = await chatRepository.getChatById(chatId, userId);
    if (!chat) {
      return { chat: null, messages: [] };
    }

    const messages = await messageRepository.getMessagesByChatId(chatId);
    return { chat, messages };
  },

  // Get shared chat (public)
  async getSharedChat(shareId: string): Promise<{ chat: Chat | null; messages: ChatMessage[] }> {
    const chat = await chatRepository.getChatByShareId(shareId);
    
    if (!chat) {
      return { chat: null, messages: [] };
    }

    if (chat.deleted_at) {
      return { chat: { ...chat, title: 'Chat Removed' }, messages: [] };
    }

    if (!chat.is_public) {
      return { chat: null, messages: [] };
    }

    const messages = await messageRepository.getMessagesByChatId(chat.id);
    return { chat, messages };
  },

  // Save a message to a chat
  async saveMessage(chatId: string, message: ChatMessage): Promise<void> {
    if (chatRepository.isGuestChat(chatId)) {
      messageRepository.saveGuestMessage(chatId, message);
    } else {
      await messageRepository.createMessage(chatId, message);
    }
  },

  // Share a chat
  async shareChat(chatId: string, userId: string): Promise<string | null> {
    if (!userId) {
      throw new Error('Must be logged in to share chats');
    }

    return chatRepository.shareChat(chatId);
  },

  // Update chat title
  async updateTitle(chatId: string, title: string): Promise<boolean> {
    return chatRepository.updateChatTitle(chatId, title);
  },

  // Delete a chat
  async deleteChat(chatId: string, isGuest: boolean): Promise<boolean> {
    if (isGuest || chatRepository.isGuestChat(chatId)) {
      chatRepository.deleteGuestChat(chatId);
      window.dispatchEvent(new CustomEvent('chatsUpdated'));
      return true;
    }

    const success = await chatRepository.deleteChat(chatId);
    return success;
  },

  // Get chat history for user
  async getChatHistory(userId?: string): Promise<Chat[]> {
    if (!userId) {
      return chatRepository.getGuestChats();
    }

    return chatRepository.getChatsByUserId(userId);
  },

  // Generate title from prompt
  generateTitle(prompt: string): string {
    return prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '');
  }
};
