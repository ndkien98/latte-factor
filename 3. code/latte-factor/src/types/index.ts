// src/types/index.ts — Shared TypeScript interfaces

export type TransactionLabel = 'essential' | 'latte' | 'unknown';
export type TransactionSource = 'manual' | 'csv' | 'excel' | 'sms' | 'chatbot';

export interface Transaction {
  id: string;
  amount: number;
  timestamp: Date;
  note: string;
  category?: string;
  label?: TransactionLabel;
  source: TransactionSource;
  confidence?: number;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  defaultLabel: TransactionLabel;
  color: string;
}

export interface Cluster {
  id: number;
  name: string;       // "Latte Factor" | "Chi tiêu lớn" | "Thiết yếu"
  transactions: Transaction[];
  centroid: { amount: number; frequency: number; hour: number };
  isLatteFactor: boolean;
  color: string;
}

export interface RegressionResult {
  w0: number;
  w1: number;
  r2: number;
  predict: (x: number) => number;
  dataPoints: { x: number; y: number; date: Date }[];
  forecastPoints: { x: number; y: number; date: Date }[];
}

export interface FVResult {
  fv: number;
  totalSaved: number;
  interestEarned: number;
  schedule: { month: number; fv: number; saved: number }[];
  params: { C: number; r: number; n: number };
}

export interface BudgetItem {
  id: string;
  name: string;
  weight: number;   // chi phí (VNĐ)
  value: number;    // độ thỏa mãn (0-100)
  category?: string;
  selected?: boolean;
}

export interface KnapsackResult {
  selectedItems: BudgetItem[];
  totalValue: number;
  totalWeight: number;
  budget: number;
  remaining: number;
}

export interface AssociationRule {
  antecedent: string[];
  consequent: string[];
  support: number;
  confidence: number;
  lift: number;
  description: string;
}

export interface NaiveBayesResult {
  label: TransactionLabel;
  category?: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  relatedTransaction?: Transaction;
  intent?: string;
}

export interface AlgorithmParams {
  // K-Means
  k: number;
  kmeansWeightAmount: number;
  kmeansWeightFrequency: number;
  kmeansWeightHour: number;
  // Naive Bayes
  nbConfidenceThreshold: number;
  // Linear Regression
  lrForecastDays: number;
  // Future Value
  fvRate: number;
  fvMonths: number;
  // Knapsack
  budget: number;
  // Apriori
  minSupport: number;
  minConfidence: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  trigger: AssociationRule;
  timestamp: Date;
  read: boolean;
}
