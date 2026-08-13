// src/nlp/intentDetector.ts — Rule-based Intent Detector for Vietnamese chatbot

import { extractAmount, extractDateTime, normalizeVi } from './tokenizeVi';
import type { TransactionSource } from '../types';
import { v4 as uuidv4 } from 'uuid';

export type Intent =
  | 'add_transaction'
  | 'query_report'
  | 'query_transactions'
  | 'set_budget'
  | 'query_trend'
  | 'query_savings'
  | 'help'
  | 'unknown';

export interface IntentResult {
  intent: Intent;
  confidence: number;
  extractedData?: any;
  query?: string;
}

const ADD_PATTERNS = [
  /mua|mua sam|an|uong|di|tra|nap|thanh toan|chi|ton|spend|buy/i,
  /\d+\s*[kK]|\d{4,}|nghin|ngan|trieu|dong/i,
];

const REPORT_PATTERNS = [
  /thang nay|tuan nay|hom nay|bao nhieu|tong|ton bao|chi tieu|thong ke|bao cao|toan chi/i,
  /how much|total|spent|report|summary/i,
];

const TX_QUERY_PATTERNS = [
  /lich su|danh sach|xem lai|giao dich|da mua|da chi|da tieu|liet ke|show|list|history|transactions/i,
];

const BUDGET_PATTERNS = [
  /dat ngan sach|set budget|ngan sach|gioi han|limit/i,
];

const TREND_PATTERNS = [
  /xu huong|trend|du doan|tuong lai|forecast|du bao/i,
];

const SAVINGS_PATTERNS = [
  /tiet kiem|tiet kiem duoc|neu bo|neu khong|tich luy|saving/i,
];

export interface DateRange {
  startDate: Date;
  endDate: Date;
  description: string;
}

export function extractDateRange(text: string): DateRange {
  const now = new Date();
  const lowerText = normalizeVi(text);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // 1. Check "hom qua"
  if (/hom qua/.test(lowerText)) {
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(endOfToday);
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);
    return {
      startDate: startOfYesterday,
      endDate: endOfYesterday,
      description: 'hôm qua',
    };
  }

  // 2. Check "n ngay truoc" or "n ngay qua"
  const daysMatch = lowerText.match(/(\d+)\s*ngay\s*(vua\s*)?(qua|truoc)/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    const startDate = new Date(startOfToday);
    startDate.setDate(startDate.getDate() - days);
    return {
      startDate,
      endDate: endOfToday,
      description: `${days} ngày vừa qua`,
    };
  }

  // 3. Check "thang nay"
  if (/thang nay/.test(lowerText)) {
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    return {
      startDate,
      endDate: endOfToday,
      description: 'tháng này',
    };
  }

  // 4. Check "thang (\d+)"
  const monthMatch = lowerText.match(/thang\s*(\d+)/i);
  if (monthMatch) {
    const month = parseInt(monthMatch[1]) - 1; // 0-indexed
    const year = now.getFullYear();
    const startDate = new Date(year, month, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return {
      startDate,
      endDate,
      description: `tháng ${month + 1}`,
    };
  }

  // 5. Check "tuan nay" or "tuan qua" or "tuan vua qua"
  if (/tuan (nay|qua|vua qua)/.test(lowerText)) {
    const startDate = new Date(startOfToday);
    startDate.setDate(startDate.getDate() - 7);
    return {
      startDate,
      endDate: endOfToday,
      description: 'tuần vừa qua',
    };
  }

  // Default: Today
  return {
    startDate: startOfToday,
    endDate: endOfToday,
    description: 'hôm nay',
  };
}

export function detectIntent(text: string): IntentResult {
  const normText = normalizeVi(text);

  const addScore = ADD_PATTERNS.filter(p => p.test(normText)).length;
  const reportScore = REPORT_PATTERNS.filter(p => p.test(normText)).length;
  const txQueryScore = TX_QUERY_PATTERNS.filter(p => p.test(normText)).length;
  const budgetScore = BUDGET_PATTERNS.filter(p => p.test(normText)).length;
  const trendScore = TREND_PATTERNS.filter(p => p.test(normText)).length;
  const savingsScore = SAVINGS_PATTERNS.filter(p => p.test(normText)).length;

  const hasAmount = extractAmount(text) !== null;

  if (hasAmount && addScore > 0) {
    const amount = extractAmount(text)!;
    const timestamp = extractDateTime(text);

    return {
      intent: 'add_transaction',
      confidence: Math.min(0.5 + addScore * 0.2, 0.95),
      extractedData: {
        id: uuidv4(),
        amount,
        timestamp,
        note: text,
        source: 'chatbot' as TransactionSource,
      },
    };
  }

  if (txQueryScore > 0) {
    const range = extractDateRange(text);
    return {
      intent: 'query_transactions',
      confidence: 0.85,
      extractedData: range,
    };
  }

  if (budgetScore > 0) {
    const amount = extractAmount(text);
    return {
      intent: 'set_budget',
      confidence: 0.85,
      extractedData: amount ? { amount } : undefined,
    };
  }

  if (savingsScore > 0) return { intent: 'query_savings', confidence: 0.8 };
  if (trendScore > 0) return { intent: 'query_trend', confidence: 0.8 };
  if (reportScore > 0) return { intent: 'query_report', confidence: 0.75, query: text };
  if (/help|giup|huong dan|cach|lam sao|lam the nao/i.test(normText)) {
    return { intent: 'help', confidence: 0.9 };
  }

  return { intent: 'unknown', confidence: 0.3 };
}
