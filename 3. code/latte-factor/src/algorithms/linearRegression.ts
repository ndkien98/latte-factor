// src/algorithms/linearRegression.ts — Linear Regression

import type { Transaction, RegressionResult } from '../types';

export function linearRegression(
  transactions: Transaction[],
  forecastDays: number = 30
): RegressionResult {
  if (transactions.length < 2) {
    const predict = () => 0;
    return {
      w0: 0, w1: 0, r2: 0, predict,
      dataPoints: [], forecastPoints: [],
    };
  }

  const dayMap = new Map<string, { sum: number; date: Date }>();
  transactions.forEach(t => {
    const d = new Date(t.timestamp);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!dayMap.has(key)) dayMap.set(key, { sum: 0, date: d });
    dayMap.get(key)!.sum += t.amount;
  });

  const sorted = Array.from(dayMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  const t0 = sorted[0].date.getTime();
  const MS_PER_DAY = 86400000;

  const points = sorted.map(({ sum, date }) => ({
    x: (date.getTime() - t0) / MS_PER_DAY,
    y: sum,
    date,
  }));

  const N = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);

  const denom = N * sumX2 - sumX * sumX;
  const w1 = denom === 0 ? 0 : (N * sumXY - sumX * sumY) / denom;
  const w0 = (sumY - w1 * sumX) / N;

  const predict = (x: number) => Math.max(0, w0 + w1 * x);

  const meanY = sumY / N;
  const ssTot = points.reduce((s, p) => s + Math.pow(p.y - meanY, 2), 0);
  const ssRes = points.reduce((s, p) => s + Math.pow(p.y - predict(p.x), 2), 0);
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  const lastX = points[points.length - 1].x;
  const lastDate = points[points.length - 1].date;
  const forecastPoints = Array.from({ length: forecastDays }, (_, i) => {
    const x = lastX + i + 1;
    const date = new Date(lastDate.getTime() + (i + 1) * MS_PER_DAY);
    return { x, y: predict(x), date };
  });

  return { w0, w1, r2, predict, dataPoints: points, forecastPoints };
}
