// src/components/dashboard/OverviewTab.tsx

import React from 'react';
import type { ComputedResults } from '../../hooks/useRecomputeOnParamsChange';
import { IconWallet, IconPieChart, IconAlertTriangle, IconCheck } from '../common/Icons';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
  glow?: string;
}

function StatCard({ icon, label, value, sub, color = '#6366f1', glow }: StatCardProps) {
  return (
    <div
      className="glass-card animate-fade-slide-up"
      style={{
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        borderTop: `2px solid ${color}`,
        boxShadow: glow ? `0 4px 30px ${glow}` : undefined,
      }}
    >
      <div style={{ color }}>{icon}</div>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</div>}
    </div>
  );
}

interface Props {
  results: ComputedResults;
}

export default function OverviewTab({ results }: Props) {
  const { totalAmount, latteAmount, essentialAmount, lattePercent, latteTransactions, clusters } = results;
  const latteCount = latteTransactions.length;
  const totalCount = clusters.flatMap(c => c.transactions).length || latteCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#f8fafc' }}>
          Tổng quan Chi tiêu
        </h2>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          Phân tích toàn bộ {totalCount} giao dịch — phát hiện {latteCount} giao dịch Latte Factor
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard
          icon={<IconWallet size={24} />}
          label="Tổng chi tiêu"
          value={formatVND(totalAmount)}
          sub="Toàn bộ giao dịch"
          color="#6366f1"
          glow="rgba(99,102,241,0.1)"
        />
        <StatCard
          icon={<IconPieChart size={24} />}
          label="Chi tiêu linh tinh"
          value={formatVND(latteAmount)}
          sub={`${lattePercent.toFixed(1)}% tổng chi tiêu`}
          color="#f59e0b"
          glow="rgba(245,158,11,0.1)"
        />
        <StatCard
          icon={<IconCheck size={24} />}
          label="Thiết yếu"
          value={formatVND(essentialAmount)}
          sub={`${(100 - lattePercent).toFixed(1)}% tổng chi tiêu`}
          color="#10b981"
        />
        <StatCard
          icon={<IconAlertTriangle size={24} />}
          label="Số lần chi linh tinh"
          value={`${latteCount}`}
          sub={`Trung bình ${latteCount > 0 ? formatVND(latteAmount / latteCount) : '0đ'}/lần`}
          color="#ef4444"
        />
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Tỷ lệ Cơ cấu Chi tiêu</span>
          <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
            {lattePercent.toFixed(1)}% Linh tinh
          </span>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${lattePercent}%`,
            background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
            borderRadius: 5,
            transition: 'width 0.8s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontSize: 12, color: '#10b981' }}>Thiết yếu: {(100 - lattePercent).toFixed(1)}%</span>
          <span style={{ fontSize: 12, color: '#f59e0b' }}>Linh tinh: {lattePercent.toFixed(1)}%</span>
        </div>
      </div>

      {results.clusters.length > 0 && (
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconPieChart size={16} color="#818cf8" />
            Phân cụm K-Means — {results.clusters.length} cụm phát hiện
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.clusters.map(c => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)',
                  border: c.isLatteFactor ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: c.isLatteFactor ? '#f59e0b' : '#e2e8f0' }}>
                  {c.name}
                </span>
                <span style={{ fontSize: 12, color: '#64748b' }}>{c.transactions.length} giao dịch</span>
                <span style={{ fontSize: 13, color: c.color, fontWeight: 600 }}>
                  {formatVND(c.transactions.reduce((s, t) => s + t.amount, 0))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
