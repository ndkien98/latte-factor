// src/pages/SettingsPage.tsx — Algorithm Parameter Configuration

import React, { useState } from 'react';
import { useAlgorithmParamsStore } from '../store/algorithmParamsStore';
import type { AlgorithmParams } from '../types';
import { IconRefresh, IconCheck } from '../components/common/Icons';

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
          fontSize: 12,
          fontWeight: 700,
          color: '#a5b4fc',
          background: 'rgba(99,102,241,0.15)',
          padding: '2px 10px',
          borderRadius: 6,
          minWidth: 64,
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

const SECTION_STYLE = { marginBottom: 28 };
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
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#f8fafc' }}>
              Cấu hình Tham số Thuật toán
            </h1>
            <p style={{ color: '#64748b', fontSize: 13 }}>
              Cấu hình mô hình — Dashboard tự động cập nhật ngay lập tức theo cơ chế Reactive State
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" onClick={resetParams} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconRefresh size={14} /> Khôi phục mặc định
            </button>
            <button className="btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconCheck size={14} /> {saved ? 'Đã lưu!' : 'Lưu cấu hình'}
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 24, ...SECTION_STYLE }}>
          <div style={SECTION_TITLE}>1. K-Means Clustering</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ParamSlider label="Số cụm k (Cluster count)" paramKey="k" min={2} max={8} step={1} />
            <ParamSlider label="Trọng số Số tiền (Amount Weight)" paramKey="kmeansWeightAmount" min={0.1} max={3} step={0.1} format={v => v.toFixed(1)} />
            <ParamSlider label="Trọng số Tần suất (Frequency Weight)" paramKey="kmeansWeightFrequency" min={0.1} max={3} step={0.1} format={v => v.toFixed(1)} />
            <ParamSlider label="Trọng số Giờ giao dịch (Hour Weight)" paramKey="kmeansWeightHour" min={0} max={2} step={0.1} format={v => v.toFixed(1)} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: 24, ...SECTION_STYLE }}>
          <div style={SECTION_TITLE}>2. Naive Bayes Classifier</div>
          <ParamSlider
            label="Ngưỡng độ tin cậy tối thiểu (Confidence Threshold)"
            paramKey="nbConfidenceThreshold"
            min={0.3}
            max={0.99}
            step={0.01}
            format={v => `${(v * 100).toFixed(0)}%`}
          />
        </div>

        <div className="glass-card" style={{ padding: 24, ...SECTION_STYLE }}>
          <div style={SECTION_TITLE}>3. Linear Regression</div>
          <NumberInput label="Số ngày dự báo tương lai (Forecast Range)" paramKey="lrForecastDays" min={7} max={180} suffix="ngày" />
        </div>

        <div className="glass-card" style={{ padding: 24, ...SECTION_STYLE }}>
          <div style={SECTION_TITLE}>4. Future Value of Annuity</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Lãi suất định kỳ r (%/tháng)</label>
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
            <NumberInput label="Số kỳ hạn n (tháng)" paramKey="fvMonths" min={1} max={240} suffix="tháng" />
          </div>
        </div>

        <div className="glass-card" style={{ padding: 24, ...SECTION_STYLE }}>
          <div style={SECTION_TITLE}>5. 0/1 Knapsack (Dynamic Programming)</div>
          <NumberInput label="Ngân sách hạn mức W (VNĐ/tháng)" paramKey="budget" min={100000} max={10000000} step={50000} suffix="đ" />
        </div>

        <div className="glass-card" style={{ padding: 24, ...SECTION_STYLE }}>
          <div style={SECTION_TITLE}>6. Apriori Association Rules</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ParamSlider
              label="Ngưỡng hỗ trợ tối thiểu (minSupport)"
              paramKey="minSupport"
              min={0.01}
              max={0.5}
              step={0.01}
              format={v => `${(v * 100).toFixed(0)}%`}
            />
            <ParamSlider
              label="Ngưỡng độ tin cậy tối thiểu (minConfidence)"
              paramKey="minConfidence"
              min={0.1}
              max={0.99}
              step={0.01}
              format={v => `${(v * 100).toFixed(0)}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
