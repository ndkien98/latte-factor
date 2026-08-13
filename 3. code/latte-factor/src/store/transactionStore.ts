// src/store/transactionStore.ts — Zustand store for transactions with db.json auto-sync

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Transaction, Category } from '../types';
import { saveDatabaseToFile } from '../services/backupService';

interface TransactionState {
  transactions: Transaction[];
  categories: Category[];
  isInitialized: boolean;

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
  { id: 'tra-sua', label: 'Trà sữa', icon: '', defaultLabel: 'latte', color: '#6366f1' },
  { id: 'an-vat', label: 'Ăn vặt', icon: '', defaultLabel: 'latte', color: '#f59e0b' },
  { id: 'an-uong', label: 'Ăn uống', icon: '', defaultLabel: 'essential', color: '#10b981' },
  { id: 'xang-xe', label: 'Xăng xe', icon: '', defaultLabel: 'essential', color: '#3b82f6' },
  { id: 'tien-nha', label: 'Tiền nhà', icon: '', defaultLabel: 'essential', color: '#8b5cf6' },
  { id: 'dien-nuoc', label: 'Điện nước', icon: '', defaultLabel: 'essential', color: '#06b6d4' },
  { id: 'mua-sam', label: 'Mua sắm', icon: '', defaultLabel: 'latte', color: '#ec4899' },
  { id: 'giai-tri', label: 'Giải trí', icon: '', defaultLabel: 'latte', color: '#ef4444' },
  { id: 'y-te', label: 'Y tế', icon: '', defaultLabel: 'essential', color: '#14b8a6' },
  { id: 'khac', label: 'Khác', icon: '', defaultLabel: 'unknown', color: '#94a3b8' },
];

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      isInitialized: false,

      addTransaction: (t) => {
        set((state) => ({
          transactions: [
            { ...t, timestamp: t.timestamp instanceof Date ? t.timestamp : new Date(t.timestamp) },
            ...state.transactions,
          ],
        }));
        setTimeout(() => saveDatabaseToFile(), 100);
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...updates,
                  timestamp: updates.timestamp
                    ? (updates.timestamp instanceof Date ? updates.timestamp : new Date(updates.timestamp))
                    : t.timestamp,
                }
              : t
          ),
        }));
        setTimeout(() => saveDatabaseToFile(), 100);
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
        setTimeout(() => saveDatabaseToFile(), 100);
      },

      setTransactions: (transactions) => {
        set({
          transactions: transactions.map((t) => ({
            ...t,
            timestamp: t.timestamp instanceof Date ? t.timestamp : new Date(t.timestamp),
          })),
        });
        setTimeout(() => saveDatabaseToFile(), 100);
      },

      addCategory: (c) => {
        set((state) => ({ categories: [...state.categories, c] }));
        setTimeout(() => saveDatabaseToFile(), 100);
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
        setTimeout(() => saveDatabaseToFile(), 100);
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
        setTimeout(() => saveDatabaseToFile(), 100);
      },

      clearAll: () => {
        set({ transactions: [], categories: DEFAULT_CATEGORIES, isInitialized: true });
        setTimeout(() => saveDatabaseToFile(), 100);
      },
    }),
    {
      name: 'latte-factor-transactions-v2',
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
