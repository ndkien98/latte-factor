// src/store/chatStore.ts — Zustand store for chatbot with Date hydration

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatMessage } from '../types';

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (msg) =>
        set((state) => ({
          messages: [
            ...state.messages.slice(-499),
            { ...msg, timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp) },
          ],
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'latte-factor-chat-v2',
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          if (key === 'timestamp' && typeof value === 'string') {
            const d = new Date(value);
            return isNaN(d.getTime()) ? value : d;
          }
          return value;
        },
      }),
    }
  )
);
