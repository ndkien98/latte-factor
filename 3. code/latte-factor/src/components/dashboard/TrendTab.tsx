// src/components/dashboard/TrendTab.tsx

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { RegressionResult } from '../../types';

const formatVND = (n: number) => `${(n / 1000).toFixed(0)}k`;

interface Props {
  regression: RegressionResult | null;
}

export default function TrendTab({ regression }: Props) {
  if (!regression) {
    return (
      <div style={{ color: '#64748b', textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
        <div>Cần ít nhất 2 ngày dữ liệu để vẽ xu hướng.</div>
      </div>
    );
  }

  const chartData = [
    ...regression.dataPoints.map(p => ({
      date: p.date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
      actual: Math.round(p.y),
      forecast: Math.round(regression.predict(p.x)),
      type: 'actual',
    })),
    ...regression.forecastPoints.slice(0, 14).map(p => ({
      date: p.date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
      actual: undefined,
      forecast: Math.round(p.y),
      type: 'forecast',
    })),
  ];

  const trend = regression.w1 > 0 ? 'tăng' : 'giảm';
  const trendColor = regression.w1 > 0 ? '#ef4444' : '#10b981';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          <span className="gradient-text">Xu hướng Chi tiêu (Linear Regression)</span>
        </h2>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          ŷ = {regression.w0.toFixed(0)} + {regression.w1.toFixed(2)}×ngày &nbsp;|&nbsp; R² = {(regression.r2 * 100).toFixed(1)}%
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { label: 'Tốc độ tăng/ngày', value: `${regression.w1 > 0 ? '+' : ''}${regression.w1.toFixed(0)}đ`, color: trendColor },
          { label: 'Xu hướng', value: `Đang ${trend}`, color: trendColor },
          { label: 'Độ chính xác (R²)', value: `${(regression.r2 * 100).toFixed(1)}%`, color: '#6366f1' },
          { label: 'Dự báo 30 ngày', value: formatVND(regression.predict(regression.dataPoints.length + 30) * 30), color: '#f59e0b' },
        ].map(item => (
          <div key={item.label} className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: item.color, marginTop: 4 }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatVND}
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(22,33,62,0.95)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v, name) => [
                v ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v)) : '—',
                name === 'actual' ? 'Thực tế' : 'Dự báo',
              ]}
            />
            <Legend
              formatter={v => v === 'actual' ? '📍 Thực tế' : '📊 Dự báo'}
              wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3, fill: '#6366f1' }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        className="glass-card"
        style={{
          padding: 16,
          borderLeft: `4px solid ${trendColor}`,
          background: `rgba(${regression.w1 > 0 ? '239,68,68' : '16,185,129'},0.05)`,
        }}
      >
        <span style={{ fontSize: 14, color: '#94a3b8' }}>
          💡 <strong style={{ color: '#e2e8f0' }}>Nhận xét:</strong>{' '}
          {regression.w1 > 0
            ? `Chi tiêu linh tinh đang tăng ${regression.w1.toFixed(0)}đ/ngày. Nếu tiếp tục, sau 30 ngày bạn sẽ tốn thêm ${formatVND(regression.w1 * 30)} so với hiện tại!`
            : `Tốt lắm! Chi tiêu linh tinh đang giảm ${Math.abs(regression.w1).toFixed(0)}đ/ngày. Tiếp tục duy trì!`}
        </span>
      </div>
    </div>
  );
}
