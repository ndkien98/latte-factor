// src/components/dashboard/BudgetTab.tsx

import type { KnapsackResult } from '../../types';
import { IconTarget, IconCheck } from '../common/Icons';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

interface Props {
  knapsackResult: KnapsackResult | null;
}

export default function BudgetTab({ knapsackResult }: Props) {
  if (!knapsackResult) {
    return (
      <div style={{ color: '#64748b', textAlign: 'center', padding: 60 }}>
        <IconTarget size={40} color="#475569" style={{ marginBottom: 12 }} />
        <div>Cần dữ liệu linh tinh để tối ưu ngân sách.</div>
      </div>
    );
  }

  const { selectedItems, totalValue, totalWeight, budget, remaining } = knapsackResult;
  const usedPercent = (totalWeight / budget) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#f8fafc' }}>
          Ngân sách Tối ưu (0/1 Knapsack DP)
        </h2>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          Tối đa hóa điểm thỏa mãn trong hạn mức ngân sách {formatVND(budget)}/tháng
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { label: 'Ngân sách', value: formatVND(budget), color: '#6366f1' },
          { label: 'Đã phân bổ', value: formatVND(totalWeight), color: '#f59e0b' },
          { label: 'Còn dư', value: formatVND(remaining), color: '#10b981' },
          { label: 'Tổng điểm thỏa mãn', value: `${totalValue} pts`, color: '#8b5cf6' },
        ].map(item => (
          <div key={item.label} className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{item.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: item.color, marginTop: 4 }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Mức sử dụng ngân sách</span>
          <span style={{ fontSize: 13, color: usedPercent > 90 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
            {usedPercent.toFixed(1)}%
          </span>
        </div>
        <div style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(usedPercent, 100)}%`,
            background: usedPercent > 90
              ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
              : 'linear-gradient(90deg, #6366f1, #10b981)',
            borderRadius: 6,
            transition: 'width 0.8s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#64748b' }}>
          <span>0đ</span>
          <span>{formatVND(budget)}</span>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 14 }}>
          Danh mục được chọn tối ưu ({selectedItems.length} mục)
        </div>
        {selectedItems.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: 13 }}>Không có danh mục nào phù hợp trong ngân sách.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedItems.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  gap: 12,
                }}
              >
                <IconCheck size={16} color="#10b981" />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{item.name}</span>
                <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                  <span style={{ color: '#f59e0b' }}>{formatVND(item.weight)}</span>
                  <span style={{ color: '#8b5cf6' }}>{item.value} điểm</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
