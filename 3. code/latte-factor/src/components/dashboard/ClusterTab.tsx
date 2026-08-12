// src/components/dashboard/ClusterTab.tsx

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Cluster } from '../../types';
import { IconAlertTriangle } from '../common/Icons';

const formatVND = (n: number) => `${(n / 1000).toFixed(0)}k`;

interface Props {
  clusters: Cluster[];
}

export default function ClusterTab({ clusters }: Props) {
  if (clusters.length === 0) {
    return <div style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Không đủ dữ liệu để phân cụm.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#f8fafc' }}>
          Phân cụm K-Means
        </h2>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          Giao dịch được gom thành {clusters.length} nhóm theo (số tiền × tần suất × giờ giao dịch)
        </p>
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, fontWeight: 600 }}>
          Biểu đồ phân tán — Số tiền vs Tần suất
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 45, left: 10 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis
              type="number"
              dataKey="amount"
              name="Số tiền"
              tickFormatter={formatVND}
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{
                value: 'Số tiền (nghìn đ)',
                position: 'insideBottom',
                offset: -20,
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="frequency"
              name="Tần suất"
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{ value: 'Tần suất/tháng', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                background: 'rgba(22,33,62,0.95)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value, name) => [
                name === 'amount' ? formatVND(Number(value)) : value,
                name === 'amount' ? 'Số tiền' : 'Tần suất',
              ]}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: 25, fontSize: 12, color: '#94a3b8' }}
              formatter={(value) => clusters.find(c => c.name === value)?.name ?? value}
            />
            {clusters.map(cluster => {
              const scatterData = cluster.transactions.map(t => ({
                amount: t.amount,
                frequency: (() => {
                  const monthKey = `${new Date(t.timestamp).getFullYear()}-${new Date(t.timestamp).getMonth()}`;
                  return cluster.transactions.filter(tx =>
                    `${new Date(tx.timestamp).getFullYear()}-${new Date(tx.timestamp).getMonth()}` === monthKey &&
                    tx.category === t.category
                  ).length;
                })(),
                note: t.note,
              }));
              return (
                <Scatter
                  key={cluster.id}
                  name={cluster.name}
                  data={scatterData}
                  fill={cluster.color}
                  opacity={0.8}
                />
              );
            })}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {clusters.map(c => {
          const total = c.transactions.reduce((s, t) => s + t.amount, 0);
          const avg = c.transactions.length > 0 ? total / c.transactions.length : 0;
          return (
            <div
              key={c.id}
              className="glass-card"
              style={{
                padding: 20,
                borderTop: `3px solid ${c.color}`,
                boxShadow: c.isLatteFactor ? `0 0 20px rgba(245,158,11,0.15)` : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.color }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: c.isLatteFactor ? '#f59e0b' : '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {c.isLatteFactor && <IconAlertTriangle size={15} color="#f59e0b" />}
                  {c.name}
                </span>
                {c.isLatteFactor && <span className="badge-latte">Latte Factor</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Số giao dịch', c.transactions.length],
                  ['Tổng tiền', new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)],
                  ['Trung bình/lần', new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(avg)],
                  ['Chiếm', `${(c.centroid.amount * 100).toFixed(0)}% (chuẩn hoá)`],
                ].map(([label, val]) => (
                  <div key={String(label)}>
                    <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginTop: 2 }}>{val}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>3 giao dịch gần nhất</div>
                {c.transactions.slice(0, 3).map(t => (
                  <div
                    key={t.id}
                    style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', padding: '2px 0' }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>
                      {t.note}
                    </span>
                    <span style={{ color: c.color, fontWeight: 600, flexShrink: 0 }}>
                      {(t.amount / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
