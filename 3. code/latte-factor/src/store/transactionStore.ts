// src/store/transactionStore.ts — Zustand store for transactions

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction, Category } from '../types';

interface TransactionState {
  transactions: Transaction[];
  categories: Category[];

  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addCategory: (c: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  clearAll: () => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'tra-sua', label: 'Trà sữa', icon: '🧋', defaultLabel: 'latte', color: '#6366f1' },
  { id: 'an-vat', label: 'Ăn vặt', icon: '🍿', defaultLabel: 'latte', color: '#f59e0b' },
  { id: 'an-uong', label: 'Ăn uống', icon: '🍜', defaultLabel: 'essential', color: '#10b981' },
  { id: 'xang-xe', label: 'Xăng xe', icon: '⛽', defaultLabel: 'essential', color: '#3b82f6' },
  { id: 'tien-nha', label: 'Tiền nhà', icon: '🏠', defaultLabel: 'essential', color: '#8b5cf6' },
  { id: 'dien-nuoc', label: 'Điện nước', icon: '💡', defaultLabel: 'essential', color: '#06b6d4' },
  { id: 'mua-sam', label: 'Mua sắm', icon: '🛍️', defaultLabel: 'latte', color: '#ec4899' },
  { id: 'giai-tri', label: 'Giải trí', icon: '🎮', defaultLabel: 'latte', color: '#ef4444' },
  { id: 'y-te', label: 'Y tế', icon: '🏥', defaultLabel: 'essential', color: '#14b8a6' },
  { id: 'khac', label: 'Khác', icon: '📦', defaultLabel: 'unknown', color: '#94a3b8' },
];

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],
      categories: DEFAULT_CATEGORIES,

      addTransaction: (t) =>
        set((state) => ({ transactions: [t, ...state.transactions] })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      setTransactions: (transactions) => set({ transactions }),

      addCategory: (c) =>
        set((state) => ({ categories: [...state.categories, c] })),

      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      clearAll: () => set({ transactions: [], categories: DEFAULT_CATEGORIES }),
    }),
    {
      name: 'latte-factor-transactions',
      partialize: (state) => ({
        transactions: state.transactions.map(t => ({
          ...t,
          timestamp: t.timestamp instanceof Date ? t.timestamp.toISOString() : t.timestamp,
        })),
        categories: state.categories,
      }),
    }
  )
);
