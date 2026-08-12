// src/data/importers/csvImporter.ts — CSV file importer

import Papa from 'papaparse';
import type { Transaction } from '../../types';
import { v4 as uuidv4 } from 'uuid';

type TransactionLabelType = 'essential' | 'latte' | 'unknown';

function parseAmount(raw: string | number): number {
  if (typeof raw === 'number') return Math.abs(raw);
  const cleaned = String(raw)
    .replace(/[^\d.,]/g, '')
    .replace(/\.(?=\d{3}(?:[.,]|$))/g, '')
    .replace(',', '.');
  return Math.abs(parseFloat(cleaned) || 0);
}

function parseDate(raw: string): Date {
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/,
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/,
    /^(\d{2})\/(\d{2})\/(\d{4})/,
    /^(\d{4})-(\d{2})-(\d{2})/,
    /^(\d{2})-(\d{2})-(\d{4})/,
  ];

  for (const fmt of formats) {
    const m = raw.match(fmt);
    if (m) {
      try {
        if (fmt === formats[0]) return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00`);
        if (fmt === formats[1]) return new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:00`);
        if (fmt === formats[2]) return new Date(`${m[3]}-${m[2]}-${m[1]}`);
        if (fmt === formats[3]) return new Date(raw);
        if (fmt === formats[4]) return new Date(`${m[3]}-${m[2]}-${m[1]}`);
      } catch { /* continue */ }
    }
  }

  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date() : d;
}

const COL_ALIASES: Record<string, string[]> = {
  date: ['date', 'ngay', 'ngày', 'ngày gd', 'ngày giao dịch', 'transaction date', 'datetime', 'thoi gian'],
  amount: ['amount', 'sotien', 'so tien', 'số tiền', 'credit', 'debit', 'số tiền nợ', 'so tien no', 'so tien co'],
  note: ['note', 'noidung', 'noi dung', 'nội dung', 'description', 'mo ta', 'mô tả', 'ghi chu'],
  category: ['category', 'danhmuc', 'danh muc', 'danh mục'],
  label: ['label', 'nhan', 'nhãn', 'type'],
};

export async function importCSV(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        if (rows.length === 0) { resolve([]); return; }

        const headers = Object.keys(rows[0]).map(h => h.toLowerCase().trim());
        const dateCol = COL_ALIASES.date.find(a => headers.includes(a)) ?? 'date';
        const amountCol = COL_ALIASES.amount.find(a => headers.includes(a)) ?? 'amount';
        const noteCol = COL_ALIASES.note.find(a => headers.includes(a)) ?? 'note';
        const categoryCol = COL_ALIASES.category.find(a => headers.includes(a)) ?? 'category';
        const labelCol = COL_ALIASES.label.find(a => headers.includes(a)) ?? 'label';

        const transactions: Transaction[] = rows
          .map(row => {
            const amount = parseAmount(row[amountCol] ?? row['amount'] ?? '0');
            if (amount <= 0) return null;

            const rawLabel = (row[labelCol] ?? '').toLowerCase();
            const label: TransactionLabelType =
              rawLabel === 'latte' || rawLabel === 'linh tinh' ? 'latte' :
              rawLabel === 'essential' || rawLabel === 'thiet yeu' || rawLabel === 'thiết yếu' ? 'essential' :
              'unknown';

            const tx: Transaction = {
              id: uuidv4(),
              amount,
              timestamp: parseDate(row[dateCol] ?? row['date'] ?? ''),
              note: String(row[noteCol] ?? row['note'] ?? ''),
              category: row[categoryCol] || undefined,
              label,
              source: 'csv',
            };
            return tx;
          })
          .filter((t): t is Transaction => t !== null);

        resolve(transactions);
      },
      error: (err) => reject(err),
    });
  });
}
