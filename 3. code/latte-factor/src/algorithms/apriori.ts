// src/algorithms/apriori.ts — Apriori Association Rules

import type { Transaction, AssociationRule } from '../types';

function getDayOfWeek(date: Date): string {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[date.getDay()];
}

function getTimeSlot(hour: number): string {
  if (hour >= 6 && hour < 10) return 'Sáng sớm';
  if (hour >= 10 && hour < 12) return 'Buổi sáng';
  if (hour >= 12 && hour < 14) return 'Buổi trưa';
  if (hour >= 14 && hour < 17) return 'Chiều';
  if (hour >= 17 && hour < 20) return 'Buổi tối';
  return 'Đêm';
}

function getTransactionItems(t: Transaction): string[] {
  const date = new Date(t.timestamp);
  const items: string[] = [];

  items.push(`Thứ:${getDayOfWeek(date)}`);
  items.push(`Giờ:${getTimeSlot(date.getHours())}`);
  if (t.category) items.push(`Danh mục:${t.category}`);
  if (t.label) items.push(`Nhãn:${t.label === 'latte' ? 'Linh tinh' : 'Thiết yếu'}`);
  if (t.amount < 50000) items.push('Giá:Rẻ');
  else if (t.amount < 200000) items.push('Giá:Vừa');
  else items.push('Giá:Đắt');

  return items;
}

export function apriori(
  transactions: Transaction[],
  minSupport: number = 0.1,
  minConfidence: number = 0.5
): AssociationRule[] {
  if (transactions.length < 5) return [];

  const total = transactions.length;
  const transactionItems = transactions.map(getTransactionItems);

  const itemCount = new Map<string, number>();
  transactionItems.forEach(items => {
    const unique = new Set(items);
    unique.forEach(item => itemCount.set(item, (itemCount.get(item) ?? 0) + 1));
  });

  const frequentItems = new Map<string, number>();
  itemCount.forEach((count, item) => {
    if (count / total >= minSupport) frequentItems.set(item, count);
  });

  const rules: AssociationRule[] = [];
  const freqItemList = Array.from(frequentItems.keys());

  for (const antItem of freqItemList) {
    for (const consItem of freqItemList) {
      if (antItem === consItem) continue;

      let coCount = 0;
      transactionItems.forEach(items => {
        if (items.includes(antItem) && items.includes(consItem)) coCount++;
      });

      const support = coCount / total;
      if (support < minSupport) continue;

      const antCount = frequentItems.get(antItem) ?? 0;
      const confidence = antCount === 0 ? 0 : coCount / antCount;
      if (confidence < minConfidence) continue;

      const consCount = frequentItems.get(consItem) ?? 0;
      const lift = consCount === 0 ? 0 : confidence / (consCount / total);

      const description = `Khi ${antItem.replace(':', ' ')} → ${consItem.replace(':', ' ')} (tin cậy: ${(confidence * 100).toFixed(0)}%)`;

      rules.push({
        antecedent: [antItem],
        consequent: [consItem],
        support,
        confidence,
        lift,
        description,
      });
    }
  }

  return rules
    .sort((a, b) => b.confidence - a.confidence || b.lift - a.lift)
    .slice(0, 20);
}

export function checkNotificationTriggers(
  rules: AssociationRule[],
  confidenceThreshold: number = 0.8
): AssociationRule[] {
  const now = new Date();
  const currentDay = `Thứ:${getDayOfWeek(now)}`;
  const currentSlot = `Giờ:${getTimeSlot(now.getHours())}`;

  return rules.filter(rule =>
    rule.confidence >= confidenceThreshold &&
    (rule.antecedent.includes(currentDay) || rule.antecedent.includes(currentSlot))
  );
}
