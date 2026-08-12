// src/services/backupService.ts — Local File Database & JSON Backup/Restore System

import { useTransactionStore } from '../store/transactionStore';
import { useAlgorithmParamsStore } from '../store/algorithmParamsStore';
import { useChatStore } from '../store/chatStore';
import { saveAs } from 'file-saver';
import initialDbData from '../data/db.json';

export interface BackupData {
  version: string;
  timestamp: string;
  transactions: unknown[];
  categories: unknown[];
  params: unknown;
  chatMessages: unknown[];
}

// 1. Export JSON File to user's download folder
export function exportBackupJSON() {
  const transactions = useTransactionStore.getState().transactions;
  const categories = useTransactionStore.getState().categories;
  const params = useAlgorithmParamsStore.getState().params;
  const chatMessages = useChatStore.getState().messages;

  const data: BackupData = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    transactions,
    categories,
    params,
    chatMessages,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const filename = `lo-thung-vi-backup-${new Date().toISOString().slice(0, 10)}.json`;
  saveAs(blob, filename);
}

// 2. Import JSON File from disk
export async function importBackupJSON(file: File): Promise<{ success: boolean; count: number; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text) as Partial<BackupData>;

        if (!data || typeof data !== 'object') {
          resolve({ success: false, count: 0, message: 'File JSON không hợp lệ.' });
          return;
        }

        let count = 0;
        if (Array.isArray(data.transactions)) {
          useTransactionStore.getState().setTransactions(
            data.transactions.map((t: any) => ({
              ...t,
              timestamp: new Date(t.timestamp),
            }))
          );
          count = data.transactions.length;
        }

        if (Array.isArray(data.categories)) {
          useTransactionStore.setState({ categories: data.categories as any });
        }

        if (data.params && typeof data.params === 'object') {
          useAlgorithmParamsStore.setState({ params: data.params as any });
        }

        if (Array.isArray(data.chatMessages)) {
          useChatStore.setState({
            messages: data.chatMessages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            })),
          });
        }

        await saveDatabaseToFile();

        resolve({
          success: true,
          count,
          message: `Đã khôi phục thành công ${count} giao dịch và lưu trực tiếp vào db.json!`,
        });
      } catch (err) {
        resolve({ success: false, count: 0, message: 'Lỗi khi đọc file JSON: ' + String(err) });
      }
    };
    reader.onerror = () => resolve({ success: false, count: 0, message: 'Không thể đọc file.' });
    reader.readAsText(file);
  });
}

// 3. Save state directly to src/data/db.json via /api/db endpoint
export async function saveDatabaseToFile(): Promise<boolean> {
  try {
    const payload = {
      transactions: useTransactionStore.getState().transactions,
      categories: useTransactionStore.getState().categories,
      params: useAlgorithmParamsStore.getState().params,
      chatMessages: useChatStore.getState().messages,
    };
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 4. Fetch database from src/data/db.json on app startup
export async function syncFromFileDatabase(): Promise<boolean> {
  try {
    let data: any = null;
    const res = await fetch('/api/db');
    if (res.ok) {
      data = await res.json();
    } else {
      data = initialDbData;
    }

    if (data) {
      if (Array.isArray(data.transactions) && data.transactions.length > 0) {
        useTransactionStore.getState().setTransactions(
          data.transactions.map((t: any) => ({
            ...t,
            timestamp: new Date(t.timestamp),
          }))
        );
      } else if (useTransactionStore.getState().transactions.length === 0 && Array.isArray(initialDbData.transactions)) {
        useTransactionStore.getState().setTransactions(
          initialDbData.transactions.map((t: any) => ({
            ...t,
            timestamp: new Date(t.timestamp),
          }))
        );
      }

      if (Array.isArray(data.categories) && data.categories.length > 0) {
        useTransactionStore.setState({ categories: data.categories });
      }
      if (data.params) {
        useAlgorithmParamsStore.setState({ params: data.params });
      }
      if (Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
        useChatStore.setState({
          messages: data.chatMessages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        });
      }
      return true;
    }
  } catch {
    // fallback to initial sample data if offline
    if (useTransactionStore.getState().transactions.length === 0) {
      useTransactionStore.getState().setTransactions(
        initialDbData.transactions.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        }))
      );
    }
  }
  return false;
}

// 5. Reset database back to clean empty state in db.json
export async function resetFileDatabase(): Promise<boolean> {
  try {
    useTransactionStore.getState().clearAll();
    useChatStore.getState().clearMessages();
    useAlgorithmParamsStore.getState().resetParams();

    await fetch('/api/db/reset', { method: 'POST' });
    return true;
  } catch {
    return false;
  }
}
