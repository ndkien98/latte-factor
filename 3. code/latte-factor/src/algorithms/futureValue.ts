// src/algorithms/futureValue.ts — Future Value of Annuity

import type { FVResult } from '../types';

export function futureValueAnnuity(C: number, r: number, n: number): FVResult {
  const fv = r === 0 ? C * n : C * ((Math.pow(1 + r, n) - 1) / r);
  const totalSaved = C * n;
  const interestEarned = fv - totalSaved;

  const schedule = Array.from({ length: n }, (_, i) => {
    const month = i + 1;
    const fvAtMonth = r === 0 ? C * month : C * ((Math.pow(1 + r, month) - 1) / r);
    return { month, fv: fvAtMonth, saved: C * month };
  });

  return {
    fv,
    totalSaved,
    interestEarned,
    schedule,
    params: { C, r, n },
  };
}

export function estimateMonthlySavings(latteTransactions: { amount: number; timestamp: Date }[]): number {
  if (latteTransactions.length === 0) return 0;

  const byMonth = new Map<string, number>();
  latteTransactions.forEach(t => {
    const key = `${new Date(t.timestamp).getFullYear()}-${new Date(t.timestamp).getMonth()}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + t.amount);
  });

  const totals = Array.from(byMonth.values());
  return totals.reduce((s, v) => s + v, 0) / totals.length;
}
