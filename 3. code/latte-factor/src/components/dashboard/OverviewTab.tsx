// src/components/dashboard/OverviewTab.tsx

import type { ComputedResults } from '../../hooks/useRecomputeOnParamsChange';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

interface StatCardProps {
  icon: string;
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
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        borderTop: `2px solid ${color}`,
        boxShadow: glow ? `0 4px 30px ${glow}` : undefined,
      }}
    >
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
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
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          <span className="gradient-text">Tổng quan Chi tiêu</span>
        </h2>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Phân tích toàn bộ {totalCount} giao dịch — phát hiện {latteCount} giao dịch "Lỗ Thủng Ví"
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard
          icon="💸"
          label="Tổng chi tiêu"
          value={formatVND(totalAmount)}
          sub="Toàn bộ giao dịch"
          color="#6366f1"
          glow="rgba(99,102,241,0.1)"
        />
        <StatCard
          icon="☕"
          label="Lỗ Thủng Ví"
          value={formatVND(latteAmount)}
          sub={`${lattePercent.toFixed(1)}% tổng chi tiêu`}
          color="#f59e0b"
          glow="rgba(245,158,11,0.1)"
        />
        <StatCard
          icon="🏠"
          label="Thiết yếu"
          value={formatVND(essentialAmount)}
          sub={`${(100 - lattePercent).toFixed(1)}% tổng chi tiêu`}
          color="#10b981"
        />
        <StatCard
          icon="⚠️"
          label="Số giao dịch linh tinh"
          value={`${latteCount}`}
          sub={`Trung bình ${latteCount > 0 ? formatVND(latteAmount / latteCount) : '0đ'}/lần`}
          color="#ef4444"
        />
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>Tỷ lệ Chi tiêu</span>
          <span style={{ fontSize: 14, color: '#f59e0b', fontWeight: 600 }}>
            {lattePercent.toFixed(1)}% Linh tinh
          </span>
        </div>
        <div style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${lattePercent}%`,
            background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
            borderRadius: 6,
            transition: 'width 0.8s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: '#10b981' }}>✓ Thiết yếu: {(100 - lattePercent).toFixed(1)}%</span>
          <span style={{ fontSize: 11, color: '#f59e0b' }}>⚠ Linh tinh: {lattePercent.toFixed(1)}%</span>
        </div>
      </div>

      {results.clusters.length > 0 && (
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>
            🔮 Phân cụm K-Means — {results.clusters.length} cụm phát hiện
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.clusters.map(c => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)',
                  border: c.isLatteFactor ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: c.isLatteFactor ? '#f59e0b' : '#94a3b8' }}>
                  {c.isLatteFactor && '⚠ '}{c.name}
                </span>
                <span style={{ fontSize: 12, color: '#64748b' }}>{c.transactions.length} giao dịch</span>
                <span style={{ fontSize: 12, color: c.color, fontWeight: 600 }}>
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
