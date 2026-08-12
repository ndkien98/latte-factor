// src/algorithms/kmeans.ts — K-Means Clustering

import type { Transaction, Cluster } from '../types';

interface Point {
  amount: number;
  frequency: number;
  hour: number;
}

function normalize(transactions: Transaction[]): Point[] {
  if (transactions.length === 0) return [];

  const amounts = transactions.map(t => t.amount);
  const hours = transactions.map(t => new Date(t.timestamp).getHours());

  const monthMap = new Map<string, number>();
  transactions.forEach(t => {
    const key = `${t.category ?? t.note.slice(0, 10)}-${new Date(t.timestamp).getMonth()}`;
    monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
  });

  const frequencies = transactions.map(t => {
    const key = `${t.category ?? t.note.slice(0, 10)}-${new Date(t.timestamp).getMonth()}`;
    return monthMap.get(key) ?? 1;
  });

  const minAmount = Math.min(...amounts);
  const maxAmount = Math.max(...amounts);
  const minFreq = Math.min(...frequencies);
  const maxFreq = Math.max(...frequencies);

  return transactions.map((_, i) => ({
    amount: maxAmount === minAmount ? 0 : (amounts[i] - minAmount) / (maxAmount - minAmount),
    frequency: maxFreq === minFreq ? 0 : (frequencies[i] - minFreq) / (maxFreq - minFreq),
    hour: hours[i] / 23,
  }));
}

function euclideanDistance(a: Point, b: Point): number {
  return Math.sqrt(
    Math.pow(a.amount - b.amount, 2) +
    Math.pow(a.frequency - b.frequency, 2) +
    Math.pow(a.hour - b.hour, 2)
  );
}

function computeCentroid(points: Point[]): Point {
  if (points.length === 0) return { amount: 0, frequency: 0, hour: 0 };
  return {
    amount: points.reduce((s, p) => s + p.amount, 0) / points.length,
    frequency: points.reduce((s, p) => s + p.frequency, 0) / points.length,
    hour: points.reduce((s, p) => s + p.hour, 0) / points.length,
  };
}

const CLUSTER_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export function kmeans(
  transactions: Transaction[],
  k: number = 3,
  maxIterations: number = 100
): Cluster[] {
  if (transactions.length === 0) return [];
  k = Math.min(k, transactions.length);

  const normalizedPoints = normalize(transactions);

  let centroids: Point[] = [];
  const usedIndices = new Set<number>();
  const firstIdx = Math.floor(Math.random() * normalizedPoints.length);
  centroids.push({ ...normalizedPoints[firstIdx] });
  usedIndices.add(firstIdx);

  for (let c = 1; c < k; c++) {
    let maxDist = -1;
    let bestIdx = 0;
    normalizedPoints.forEach((p, i) => {
      if (usedIndices.has(i)) return;
      const minD = Math.min(...centroids.map(cent => euclideanDistance(p, cent)));
      if (minD > maxDist) {
        maxDist = minD;
        bestIdx = i;
      }
    });
    centroids.push({ ...normalizedPoints[bestIdx] });
    usedIndices.add(bestIdx);
  }

  let assignments: number[] = new Array(transactions.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    const newAssignments = normalizedPoints.map(p => {
      const distances = centroids.map(c => euclideanDistance(p, c));
      return distances.indexOf(Math.min(...distances));
    });

    const changed = newAssignments.some((a, i) => a !== assignments[i]);
    assignments = newAssignments;
    if (!changed) break;

    centroids = centroids.map((_, ci) => {
      const clusterPoints = normalizedPoints.filter((_, i) => assignments[i] === ci);
      return computeCentroid(clusterPoints);
    });
  }

  const clusters: Cluster[] = centroids.map((centroid, ci) => {
    const clusterTransactions = transactions.filter((_, i) => assignments[i] === ci);

    const isLatteFactor = centroid.amount < 0.35 && centroid.frequency > 0.6;
    const isLargeExpense = centroid.amount > 0.65;
    const name = isLatteFactor ? 'Latte Factor' : isLargeExpense ? 'Chi tiêu lớn' : 'Thiết yếu';

    return {
      id: ci,
      name,
      transactions: clusterTransactions,
      centroid,
      isLatteFactor,
      color: CLUSTER_COLORS[ci % CLUSTER_COLORS.length],
    };
  });

  return clusters.sort((a, b) => (b.isLatteFactor ? 1 : 0) - (a.isLatteFactor ? 1 : 0));
}
