// src/nlp/intentDetector.ts — Rule-based Intent Detector for Vietnamese chatbot

import { extractAmount, extractDateTime, normalizeVi } from './tokenizeVi';
import type { Transaction, TransactionSource } from '../types';
import { v4 as uuidv4 } from 'uuid';

export type Intent =
  | 'add_transaction'
  | 'query_report'
  | 'set_budget'
  | 'query_trend'
  | 'query_savings'
  | 'help'
  | 'unknown';

export interface IntentResult {
  intent: Intent;
  confidence: number;
  extractedData?: Partial<Transaction>;
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

const BUDGET_PATTERNS = [
  /dat ngan sach|set budget|ngan sach|gioi han|limit/i,
];

const TREND_PATTERNS = [
  /xu huong|trend|du doan|tuong lai|forecast|du bao/i,
];

const SAVINGS_PATTERNS = [
  /tiet kiem|tiet kiem duoc|neu bo|neu khong|tich luy|saving/i,
];

export function detectIntent(text: string): IntentResult {
  const normText = normalizeVi(text);

  const addScore = ADD_PATTERNS.filter(p => p.test(normText)).length;
  const reportScore = REPORT_PATTERNS.filter(p => p.test(normText)).length;
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
