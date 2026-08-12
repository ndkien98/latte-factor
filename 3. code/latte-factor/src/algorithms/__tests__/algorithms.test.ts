// src/algorithms/__tests__/algorithms.test.ts — Unit tests for all 6 algorithms & NLP

import { describe, it, expect } from 'vitest';
import { kmeans } from '../kmeans';
import { NaiveBayesClassifier } from '../naiveBayes';
import { linearRegression } from '../linearRegression';
import { futureValueAnnuity } from '../futureValue';
import { knapsack01 } from '../knapsack';
import { apriori } from '../apriori';
import { extractAmount } from '../../nlp/tokenizeVi';
import { detectIntent } from '../../nlp/intentDetector';
import type { Transaction, BudgetItem } from '../../types';

describe('1. K-Means Clustering', () => {
  it('should cluster transactions into k groups', () => {
    const transactions: Transaction[] = [
      { id: '1', amount: 35000, timestamp: new Date('2024-01-01T15:00:00'), note: 'Tra sua', source: 'manual' },
      { id: '2', amount: 35000, timestamp: new Date('2024-01-02T15:00:00'), note: 'Tra sua', source: 'manual' },
      { id: '3', amount: 35000, timestamp: new Date('2024-01-03T15:00:00'), note: 'Tra sua', source: 'manual' },
      { id: '4', amount: 1500000, timestamp: new Date('2024-01-01T09:00:00'), note: 'Tien nha', source: 'manual' },
      { id: '5', amount: 6000000, timestamp: new Date('2024-01-02T10:00:00'), note: 'Mua laptop', source: 'manual' },
    ];

    const clusters = kmeans(transactions, 3);
    expect(clusters.length).toBeLessThanOrEqual(3);
    const totalAssigned = clusters.reduce((s, c) => s + c.transactions.length, 0);
    expect(totalAssigned).toBe(transactions.length);
  });

  it('should handle edge cases like empty transactions', () => {
    const clusters = kmeans([], 3);
    expect(clusters).toEqual([]);
  });
});

describe('2. Naive Bayes Classifier & NLP', () => {
  it('should classify text correctly based on training data', () => {
    const clf = new NaiveBayesClassifier([
      { text: 'tra sua gong cha te amo boba', label: 'latte' },
      { text: 'tien nha dien nuoc internet y te', label: 'essential' },
    ]);

    const res1 = clf.predict('tra sua te amo');
    expect(res1.label).toBe('latte');

    const res2 = clf.predict('dong tien nha dien nuoc');
    expect(res2.label).toBe('essential');
  });

  it('should extract amount correctly from Vietnamese text', () => {
    expect(extractAmount('mua tra sua 35k')).toBe(35000);
    expect(extractAmount('tra sua 35.000đ')).toBe(35000);
    expect(extractAmount('mua ao 2 triệu')).toBe(2000000);
  });

  it('should detect intents accurately', () => {
    const intent1 = detectIntent('mua tra sua 35k luc 3h chieu');
    expect(intent1.intent).toBe('add_transaction');
    expect(intent1.extractedData?.amount).toBe(35000);

    const intent2 = detectIntent('thang nay toan chi bao nhieu tien?');
    expect(intent2.intent).toBe('query_report');
  });
});

describe('3. Linear Regression', () => {
  it('should calculate slope and intercept correctly', () => {
    const transactions: Transaction[] = [
      { id: '1', amount: 100, timestamp: new Date('2024-01-01'), note: 't1', source: 'manual' },
      { id: '2', amount: 200, timestamp: new Date('2024-01-02'), note: 't2', source: 'manual' },
      { id: '3', amount: 300, timestamp: new Date('2024-01-03'), note: 't3', source: 'manual' },
    ];

    const res = linearRegression(transactions, 5);
    expect(res.w1).toBeGreaterThan(0);
    expect(res.forecastPoints.length).toBe(5);
  });
});

describe('4. Future Value of Annuity', () => {
  it('should calculate correct compound interest and savings', () => {
    const res = futureValueAnnuity(1000000, 0.01, 12);
    expect(res.totalSaved).toBe(12000000);
    expect(res.fv).toBeGreaterThan(12000000);
    expect(res.schedule.length).toBe(12);
  });
});

describe('5. 0/1 Knapsack DP', () => {
  it('should optimize budget item selection within capacity W', () => {
    const items: BudgetItem[] = [
      { id: '1', name: 'Trà sữa', weight: 300000, value: 80 },
      { id: '2', name: 'Ăn vặt', weight: 200000, value: 60 },
      { id: '3', name: 'Xem phim', weight: 400000, value: 70 },
    ];

    const res = knapsack01(items, 500000);
    expect(res.totalWeight).toBeLessThanOrEqual(500000);
    expect(res.selectedItems.length).toBe(2);
  });
});

describe('6. Apriori Association Rules', () => {
  it('should extract rules from transaction patterns', () => {
    const transactions: Transaction[] = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      amount: 35000,
      timestamp: new Date('2024-01-05T15:00:00'),
      category: 'Trà sữa',
      label: 'latte' as const,
      note: 'Tra sua',
      source: 'manual' as const,
    }));

    const rules = apriori(transactions, 0.1, 0.5);
    expect(rules.length).toBeGreaterThan(0);
  });
});
