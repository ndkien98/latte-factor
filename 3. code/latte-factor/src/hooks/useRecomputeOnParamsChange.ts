// src/hooks/useRecomputeOnParamsChange.ts — Hook that recomputes algorithms when params change

import { useMemo } from 'react';
import { useAlgorithmParamsStore } from '../store/algorithmParamsStore';
import { useTransactionStore } from '../store/transactionStore';
import { kmeans } from '../algorithms/kmeans';
import { linearRegression } from '../algorithms/linearRegression';
import { futureValueAnnuity, estimateMonthlySavings } from '../algorithms/futureValue';
import { knapsack01 } from '../algorithms/knapsack';
import { apriori } from '../algorithms/apriori';
import type { Cluster, RegressionResult, FVResult, KnapsackResult, AssociationRule, BudgetItem, Transaction } from '../types';

export interface ComputedResults {
  clusters: Cluster[];
  latteTransactions: Transaction[];
  regression: RegressionResult | null;
  futureValue: FVResult | null;
  knapsackResult: KnapsackResult | null;
  rules: AssociationRule[];
  totalAmount: number;
  latteAmount: number;
  essentialAmount: number;
  lattePercent: number;
}

export function useComputedResults(): ComputedResults {
  const { params } = useAlgorithmParamsStore();
  const { transactions } = useTransactionStore();

  const results = useMemo(() => {
    if (transactions.length === 0) {
      return {
        clusters: [],
        latteTransactions: [],
        regression: null,
        futureValue: null,
        knapsackResult: null,
        rules: [],
        totalAmount: 0,
        latteAmount: 0,
        essentialAmount: 0,
        lattePercent: 0,
      };
    }

    const normalizedTx = transactions.map(t => ({
      ...t,
      timestamp: t.timestamp instanceof Date ? t.timestamp : new Date(t.timestamp as unknown as string),
    }));

    const clusters = kmeans(normalizedTx, params.k);

    const latteClusters = clusters.filter(c => c.isLatteFactor);
    const latteTransactions = latteClusters.flatMap(c => c.transactions);
    const latteTransactionsLabeled = normalizedTx.filter(
      t => t.label === 'latte' || latteTransactions.some(lt => lt.id === t.id)
    );

    const regression = latteTransactionsLabeled.length >= 2
      ? linearRegression(latteTransactionsLabeled, params.lrForecastDays)
      : null;

    const monthlySavings = estimateMonthlySavings(latteTransactionsLabeled);
    const futureValue = monthlySavings > 0
      ? futureValueAnnuity(monthlySavings, params.fvRate, params.fvMonths)
      : null;

    const categoryTotals = new Map<string, { amount: number; count: number }>();
    latteTransactionsLabeled.forEach(t => {
      const cat = t.category ?? 'Khác';
      const curr = categoryTotals.get(cat) ?? { amount: 0, count: 0 };
      categoryTotals.set(cat, { amount: curr.amount + t.amount, count: curr.count + 1 });
    });

    const budgetItems: BudgetItem[] = Array.from(categoryTotals.entries()).map(([name, { amount, count }]) => ({
      id: name,
      name,
      weight: Math.round(amount / 3),
      value: Math.min(100, Math.round(50 + count * 5)),
    }));

    const knapsackResult = budgetItems.length > 0
      ? knapsack01(budgetItems, params.budget)
      : null;

    const rules = apriori(normalizedTx, params.minSupport, params.minConfidence);

    const totalAmount = normalizedTx.reduce((s, t) => s + t.amount, 0);
    const latteAmount = latteTransactionsLabeled.reduce((s, t) => s + t.amount, 0);
    const essentialAmount = totalAmount - latteAmount;
    const lattePercent = totalAmount > 0 ? (latteAmount / totalAmount) * 100 : 0;

    return {
      clusters,
      latteTransactions: latteTransactionsLabeled,
      regression,
      futureValue,
      knapsackResult,
      rules,
      totalAmount,
      latteAmount,
      essentialAmount,
      lattePercent,
    };
  }, [transactions, params]);

  return results;
}
