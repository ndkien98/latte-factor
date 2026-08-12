// src/pages/SettingsPage.tsx — Algorithm Parameter Configuration

import React, { useState } from 'react';
import { useAlgorithmParamsStore } from '../store/algorithmParamsStore';
import type { AlgorithmParams } from '../types';

interface SliderProps {
  label: string;
  paramKey: keyof AlgorithmParams;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
}

function ParamSlider({ label, paramKey, min, max, step, format }: SliderProps) {
  const { params, setParam } = useAlgorithmParamsStore();
  const value = params[paramKey] as number;
  const display = format ? format(value) : String(value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: 13, color: '#94a3b8' }}>{label}</label>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#a5b4fc',
          background: 'rgba(99,102,241,0.15)',
          padding: '2px 10px',
          borderRadius: 6,
          minWidth: 70,
          textAlign: 'center',
        }}>
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => setParam(paramKey, parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#6366f1' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#475569' }}>
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}

function NumberInput({ label, paramKey, min, max, step, prefix, suffix }: {
  label: string;
  paramKey: keyof AlgorithmParams;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}) {
  const { params, setParam } = useAlgorithmParamsStore();
  const value = params[paramKey] as number;

  return (
    <div>
      <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {prefix && <span style={{ fontSize: 13, color: '#64748b' }}>{prefix}</span>}
        <input
          type="number"
          className="input-field"
          value={value}
          min={min}
          max={max}
          step={step ?? 1}
          onChange={e => setParam(paramKey, parseFloat(e.target.value))}
          style={{ flex: 1 }}
        />
        {suffix && <span style={{ fontSize: 13, color: '#64748b' }}>{suffix}</span>}
      </div>
    </div>
  );
}

const SECTION_STYLE = { marginBottom: 32 };
const SECTION_TITLE: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: '#a5b4fc',
  marginBottom: 16,
  paddingBottom: 8,
  borderBottom: '1px solid rgba(99,102,241,0.2)',
};

export default function SettingsPage() {
  const { resetParams, setParam } = useAlgorithmParamsStore();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
              <span className="gradient-text">Cấu hình Tham số</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: 13 }}>
              Điều chỉnh tham số — Dashboard sẽ tự động cập nhật ngay lập tức (không cần reload)
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" onClick={resetParams}>🔄 Reset mặc định</button>
            <button className="btn-primary" onClick={handleSave}>
              {saved ? '✅ Đã lưu!' : '💾 Lưu cấu hình'}
            </button>
          </div>
        </div>

        {/* K-Means */}
        <div className="glass-card" style={{ padding: 24, ...SECTION_STYLE }}>
          <div style={SECTION_TITLE}>🔮 K-Means Clustering</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ParamSlider label="Số cụm k" paramKey="k" min={2} max={8} step={1} />
            <ParamSlider label="Trọng số Số tiền" paramKey="kmeansWeightAmount" min={0.1} max={3} step={0.1} format={v => v.toFixed(1)} />
            <ParamSlider label="Trọng số Tần suất" paramKey="kmeansWeightFrequency" min={0.1} max={3} step={0.1} format={v => v.toFixed(1)} />
            <ParamSlider label="Trọng số Giờ giao dịch" paramKey="kmeansWeightHour" min={0} max={2} step={0.1} format={v => v.toFixed(1)} />
          </div>
        </div>

        {/* Naive Bayes */}
        <div className="glass-card" style={{ padding: 24, ...SECTION_STYLE }}>
          <div style={SECTION_TITLE}>🧠 Naive Bayes (NLP)</div>
          <ParamSlider
            label="Ngưỡng độ tin cậy tối thiểu để auto-gắn nhãn"
            paramKey="nbConfidenceThreshold"
            min={0.3}
            max={0.99}
            step={0.01}
            format={v => `${(v * 100).toFixed(0)}%`}
          />
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
            Nếu độ tin cậy &lt; ngưỡng này → giao dịch được đánh dấu "Chưa phân loại" và cần xác nhận thủ công.
          </div>
        </div>

        {/* Linear Regression */}
        <div className="glass-card" style={{ padding: 24, ...SECTION_STYLE }}>
          <div style={SECTION_TITLE}>📈 Linear Regression</div>
          <NumberInput label="Số ngày dự báo tương lai" paramKey="lrForecastDays" min={7} max={180} suffix="ngày" />
        </div>

        {/* Future Value */}
        <div className="glass-card" style={{ padding: 24, ...SECTION_STYLE }}>
          <div style={SECTION_TITLE}>💰 Future Value of Annuity</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Lãi suất r (%/tháng)</label>
              <input
                type="number"
                className="input-field"
                value={useAlgorithmParamsStore.getState().params.fvRate * 100}
                min={0.1}
                max={5}
                step={0.1}
                onChange={e => setParam('fvRate', parseFloat(e.target.value) / 100)}
              />
            </div>
            <NumberInput label="Số kỳ n (tháng)" paramKey="fvMonths" min={1} max={240} suffix="tháng" />
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
            Lãi suất tiết kiệm ngân hàng phổ biến: 0.4–0.6%/tháng. Lãi kép trái phiếu: 0.8–1%/tháng.
          </div>
        </div>

        {/* Knapsack */}
        <div className="glass-card" style={{ padding: 24, ...SECTION_STYLE }}>
          <div style={SECTION_TITLE}>🎯 0/1 Knapsack</div>
          <NumberInput label="Ngân sách ăn chơi W (VNĐ/tháng)" paramKey="budget" min={100000} max={10000000} step={50000} suffix="đ" />
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
            Thuật toán sẽ gợi ý tối ưu danh mục chi tiêu để tối đa độ thỏa mãn trong ngân sách này.
          </div>
        </div>

        {/* Apriori */}
        <div className="glass-card" style={{ padding: 24, ...SECTION_STYLE }}>
          <div style={SECTION_TITLE}>🔗 Apriori (Association Rules)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ParamSlider
              label="minSupport — Ngưỡng độ hỗ trợ tối thiểu"
              paramKey="minSupport"
              min={0.01}
              max={0.5}
              step={0.01}
              format={v => `${(v * 100).toFixed(0)}%`}
            />
            <ParamSlider
              label="minConfidence — Ngưỡng độ tin cậy tối thiểu"
              paramKey="minConfidence"
              min={0.1}
              max={0.99}
              step={0.01}
              format={v => `${(v * 100).toFixed(0)}%`}
            />
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
            Dữ liệu cá nhân ít → nên đặt minSupport thấp (5-15%) để tìm được luật ý nghĩa.
          </div>
        </div>
      </div>
    </div>
  );
}
