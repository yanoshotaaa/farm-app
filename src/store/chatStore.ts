import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage } from '../types';

interface ChatStore {
  messages: ChatMessage[];
  addMessage: (text: string, sender: 'user' | 'system', cropId?: string) => void;
  clearMessages: () => void;
  deleteMessage: (id: string) => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],

      addMessage: (text, sender, cropId) => {
        const newMessage: ChatMessage = {
          id: generateId(),
          text,
          sender,
          timestamp: new Date().toISOString(),
          cropId,
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      deleteMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        }));
      },
    }),
    {
      name: 'farm-chat-storage',
    }
  )
);

