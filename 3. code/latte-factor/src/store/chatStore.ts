// src/store/chatStore.ts — Zustand store for chatbot

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
          messages: [...state.messages.slice(-499), msg],
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    { name: 'latte-factor-chat' }
  )
);
