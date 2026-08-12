// src/nlp/tokenizeVi.ts — Vietnamese Tokenizer

import { STOPWORDS_VI } from './stopwordsVi';

/**
 * Normalize Vietnamese text: remove diacritics variant normalization,
 * lowercase, remove punctuation
 */
export function normalizeVi(text: string): string {
  return text
    .toLowerCase()
    .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a')
    .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
    .replace(/[íìỉĩị]/g, 'i')
    .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
    .replace(/[úùủũụưứừửữự]/g, 'u')
    .replace(/[ýỳỷỹỵ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenize Vietnamese text (whitespace-based + remove stopwords)
 */
export function tokenizeVi(text: string, removeStopwords = true): string[] {
  const normalized = normalizeVi(text);
  const tokens = normalized.split(' ').filter(t => t.length > 1);

  if (!removeStopwords) return tokens;
  return tokens.filter(t => !STOPWORDS_VI.has(t));
}

/**
 * Extract monetary amount from Vietnamese text
 * Handles: 35k, 35.000đ, 35000, 35,000 VND, 35 nghìn, etc.
 */
export function extractAmount(text: string): number | null {
  // Pattern: number followed by k/K, nghìn, triệu, đ, VND, vnd
  const patterns = [
    /(\d+(?:[.,]\d{3})*)\s*(?:triệu|tr)/i,  // X triệu
    /(\d+(?:[.,]\d+)?)\s*(?:k|K|nghìn|ngàn)/i, // Xk or X nghìn
    /(\d+(?:[.,]\d{3})+)/,                    // X.XXX (already formatted)
    /(\d{4,})/,                                // bare number >= 1000
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let value = parseFloat(match[1].replace(/[.,]/g, ''));
      if (/triệu|tr/i.test(match[0])) value *= 1_000_000;
      else if (/k|nghìn|ngàn/i.test(match[0])) value *= 1_000;
      return value;
    }
  }
  return null;
}

/**
 * Extract date/time context from Vietnamese text
 * Handles: hôm nay, hôm qua, lúc Xh, X giờ chiều, etc.
 */
export function extractDateTime(text: string): Date {
  const now = new Date();
  const lowerText = text.toLowerCase();

  let date = new Date(now);

  // Date references
  if (/hôm qua|hom qua/.test(lowerText)) {
    date.setDate(date.getDate() - 1);
  } else if (/hôm kia|hom kia/.test(lowerText)) {
    date.setDate(date.getDate() - 2);
  }

  // Time references
  const timeMatch = lowerText.match(/(?:lúc|luc|khoảng)\s*(\d{1,2})\s*(?:h|giờ|gio)/i) ||
                    lowerText.match(/(\d{1,2})\s*(?:h|giờ|gio)\s*(?:sáng|sang|trưa|trua|chiều|chieu|tối|toi)?/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const period = timeMatch[0].toLowerCase();
    if (/chiều|chieu|tối|toi/.test(period) && hour < 12) hour += 12;
    date.setHours(hour, 0, 0, 0);
  }

  return date;
}
