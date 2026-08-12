// src/components/dashboard/FutureValueTab.tsx

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { FVResult } from '../../types';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const shortVND = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}tr` : `${(n / 1000).toFixed(0)}k`;

interface Props {
  futureValue: FVResult | null;
}

export default function FutureValueTab({ futureValue }: Props) {
  if (!futureValue) {
    return (
      <div style={{ color: '#64748b', textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
        <div>Cần dữ liệu linh tinh để tính tích lũy tương lai.</div>
      </div>
    );
  }

  const { fv, totalSaved, interestEarned, schedule, params } = futureValue;
  const chartData = schedule.map(s => ({
    month: `T${s.month}`,
    saved: Math.round(s.saved),
    fv: Math.round(s.fv),
    interest: Math.round(s.fv - s.saved),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          <span className="gradient-text">Tích lũy Tương lai (Future Value of Annuity)</span>
        </h2>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          FV = C × [(1+r)ⁿ − 1] / r &nbsp;|&nbsp; Gửi {formatVND(params.C)}/tháng, lãi {(params.r * 100).toFixed(1)}%/tháng trong {params.n} tháng
        </p>
      </div>

      <div
        className="glass-card"
        style={{
          padding: 28,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))',
          borderTop: '3px solid #10b981',
        }}
      >
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Nếu bỏ thói quen linh tinh trong {params.n} tháng, bạn sẽ có
        </div>
        <div style={{ fontSize: 48, fontWeight: 800, color: '#10b981', marginBottom: 8 }}>
          {formatVND(fv)}
        </div>
        <div style={{ fontSize: 14, color: '#94a3b8' }}>
          Bao gồm {formatVND(totalSaved)} tiết kiệm + {formatVND(interestEarned)} lãi
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { label: 'Tiết kiệm/tháng', value: formatVND(params.C), color: '#6366f1' },
          { label: 'Lãi suất', value: `${(params.r * 100).toFixed(2)}%/tháng`, color: '#8b5cf6' },
          { label: 'Số tháng', value: `${params.n} tháng`, color: '#06b6d4' },
          { label: 'Lãi kiếm được', value: formatVND(interestEarned), color: '#10b981' },
        ].map(item => (
          <div key={item.label} className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{item.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: item.color, marginTop: 4 }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, fontWeight: 600 }}>
          Tăng trưởng tích lũy theo tháng
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <defs>
              <linearGradient id="fvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="savedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tickFormatter={shortVND} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: 'rgba(22,33,62,0.95)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v, name) => [formatVND(Number(v)), name === 'fv' ? 'FV tích lũy' : 'Đã tiết kiệm']}
            />
            <Legend formatter={v => v === 'fv' ? '💰 FV tích lũy' : '💵 Đã tiết kiệm'} wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="saved" stroke="#6366f1" fill="url(#savedGradient)" strokeWidth={2} />
            <Area type="monotone" dataKey="fv" stroke="#10b981" fill="url(#fvGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
