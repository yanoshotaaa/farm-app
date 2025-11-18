import { create } from 'zustand';
import type { ChatMessage } from '../types';
import * as firestoreService from '../services/firestoreService';

interface ChatStore {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  
  // データ読み込み
  loadMessages: () => Promise<void>;
  
  addMessage: (text: string, sender: 'user' | 'system', cropId?: string) => Promise<void>;
  clearMessages: () => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  loading: false,
  error: null,

  loadMessages: async () => {
    set({ loading: true, error: null });
    try {
      const messages = await firestoreService.chatMessageService.getAll();
      set({ messages, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'メッセージの読み込みに失敗しました',
        loading: false 
      });
    }
  },

  addMessage: async (text, sender, cropId) => {
    try {
      const message: Omit<ChatMessage, 'id'> = {
        text,
        sender,
        timestamp: new Date().toISOString(),
        cropId,
      };
      const id = await firestoreService.chatMessageService.create(message);
      const newMessage: ChatMessage = { ...message, id };
      set((state) => ({ messages: [...state.messages, newMessage] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'メッセージの送信に失敗しました' });
      throw error;
    }
  },

  clearMessages: async () => {
    try {
      await firestoreService.chatMessageService.clearAll();
      set({ messages: [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'メッセージの削除に失敗しました' });
      throw error;
    }
  },

  deleteMessage: async (id) => {
    try {
      await firestoreService.chatMessageService.delete(id);
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'メッセージの削除に失敗しました' });
      throw error;
    }
  },
}));
