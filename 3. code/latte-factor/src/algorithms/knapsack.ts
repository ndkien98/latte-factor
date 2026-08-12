// src/algorithms/knapsack.ts — 0/1 Knapsack with Dynamic Programming

import type { BudgetItem, KnapsackResult } from '../types';

export function knapsack01(items: BudgetItem[], W: number): KnapsackResult {
  if (items.length === 0 || W <= 0) {
    return { selectedItems: [], totalValue: 0, totalWeight: 0, budget: W, remaining: W };
  }

  const n = items.length;
  const scale = 1000;
  const Ws = Math.floor(W / scale);

  const dp: number[] = new Array(Ws + 1).fill(0);
  const keep: boolean[][] = Array.from({ length: n }, () => new Array(Ws + 1).fill(false));

  for (let i = 0; i < n; i++) {
    const wi = Math.floor(items[i].weight / scale);
    const vi = items[i].value;

    for (let w = Ws; w >= wi; w--) {
      if (dp[w - wi] + vi > dp[w]) {
        dp[w] = dp[w - wi] + vi;
        keep[i][w] = true;
      }
    }
  }

  const selectedItems: BudgetItem[] = [];
  let w = Ws;
  for (let i = n - 1; i >= 0; i--) {
    if (keep[i][w]) {
      selectedItems.push({ ...items[i], selected: true });
      w -= Math.floor(items[i].weight / scale);
    }
  }

  const totalWeight = selectedItems.reduce((s, item) => s + item.weight, 0);
  const totalValue = selectedItems.reduce((s, item) => s + item.value, 0);

  return {
    selectedItems,
    totalValue,
    totalWeight,
    budget: W,
    remaining: W - totalWeight,
  };
}
