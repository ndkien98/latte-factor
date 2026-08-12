// src/pages/InputPage.tsx — Manual transaction input + category manager

import React, { useState, useRef } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import type { Transaction, Category } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { importCSV } from '../data/importers/csvImporter';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function InputPage() {
  const { transactions, categories, addTransaction, deleteTransaction, addCategory, deleteCategory, setTransactions } = useTransactionStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<'form' | 'list' | 'categories'>('form');
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().slice(0, 16),
    note: '',
    category: '',
    label: '' as '' | 'essential' | 'latte',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount.replace(/[^\d.]/g, ''));
    if (!amount || amount <= 0) return;

    const cat = categories.find(c => c.id === form.category);
    const newTx: Transaction = {
      id: uuidv4(),
      amount,
      timestamp: new Date(form.date),
      note: form.note || form.category || 'Chi tiêu',
      category: cat?.label,
      label: form.label || cat?.defaultLabel || 'unknown',
      source: 'manual',
    };

    addTransaction(newTx);
    setForm(f => ({ ...f, amount: '', note: '' }));
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg('');
    try {
      const txs = await importCSV(file);
      if (txs.length === 0) {
        setImportMsg('Không tìm thấy giao dịch hợp lệ trong file.');
      } else {
        txs.forEach(t => addTransaction(t));
        setImportMsg(`✅ Đã nhập ${txs.length} giao dịch từ file.`);
      }
    } catch (err) {
      setImportMsg('❌ Lỗi khi đọc file: ' + String(err));
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleLoadSample = async () => {
    setImporting(true);
    try {
      const resp = await fetch('/src/data/sampleDatasets/transactions_vi.csv');
      if (!resp.ok) throw new Error('Không thể tải dataset mẫu');
      const text = await resp.text();
      const blob = new Blob([text], { type: 'text/csv' });
      const file = new File([blob], 'sample.csv', { type: 'text/csv' });
      const txs = await importCSV(file);
      txs.forEach(t => addTransaction(t));
      setImportMsg(`✅ Đã tải ${txs.length} giao dịch mẫu.`);
    } catch {
      setImportMsg('ℹ️ Hãy tải file CSV mẫu từ docs/DATA_SCHEMA.md');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
            <span className="gradient-text">Nhập liệu</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            Nhập giao dịch thủ công, import CSV/Excel, hoặc tải dataset mẫu
          </p>
        </div>

        <div
          className="glass-card"
          style={{ padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
        >
          <span style={{ fontSize: 20 }}>📁</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>Import từ file CSV/Excel</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Hỗ trợ sao kê VCB, Techcombank, MBBank, BIDV</div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleFileImport}
          />
          <button className="btn-secondary" onClick={() => fileRef.current?.click()} disabled={importing}>
            {importing ? '⏳ Đang nhập...' : '📂 Chọn file'}
          </button>
          <button className="btn-secondary" onClick={handleLoadSample} disabled={importing}>
            🎲 Dữ liệu mẫu
          </button>
          {transactions.length > 0 && (
            <button
              className="btn-danger"
              onClick={() => { if (confirm('Xóa toàn bộ dữ liệu?')) setTransactions([]); }}
            >
              🗑️ Xóa tất cả
            </button>
          )}
        </div>
        {importMsg && (
          <div className="glass-card" style={{
            padding: 10,
            marginBottom: 16,
            fontSize: 13,
            color: importMsg.startsWith('✅') ? '#10b981' : importMsg.startsWith('ℹ️') ? '#6366f1' : '#ef4444',
          }}>
            {importMsg}
          </div>
        )}

        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {[
            { id: 'form', label: '✏️ Nhập tay' },
            { id: 'list', label: `📋 Danh sách (${transactions.length})` },
            { id: 'categories', label: `🏷️ Danh mục (${categories.length})` },
          ].map(t => (
            <button
              key={t.id}
              className={`tab-button ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id as typeof tab)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'form' && (
          <div className="glass-card" style={{ padding: 24 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Số tiền (VNĐ) *
                  </label>
                  <input
                    className="input-field"
                    placeholder="35000 hoặc 35k"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Ngày giờ
                  </label>
                  <input
                    className="input-field"
                    type="datetime-local"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                  Nội dung / Ghi chú
                </label>
                <input
                  className="input-field"
                  placeholder="Tiem tra sua Te Amo..."
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Danh mục
                  </label>
                  <select
                    className="input-field"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Phân loại (để AI tự đoán nếu bỏ trống)
                  </label>
                  <select
                    className="input-field"
                    value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value as typeof form.label }))}
                  >
                    <option value="">🤖 AI tự đoán</option>
                    <option value="essential">✅ Thiết yếu</option>
                    <option value="latte">☕ Linh tinh (Latte)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                ➕ Thêm giao dịch
              </button>
            </form>
          </div>
        )}

        {tab === 'list' && (
          <div className="glass-card" style={{ padding: 20 }}>
            {transactions.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>
                Chưa có giao dịch. Hãy nhập tay hoặc import file.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      {['Ngày giờ', 'Số tiền', 'Nội dung', 'Danh mục', 'Phân loại', ''].map(h => (
                        <th key={h} style={{
                          padding: '8px 12px',
                          textAlign: 'left',
                          color: '#64748b',
                          fontWeight: 600,
                          fontSize: 11,
                          textTransform: 'uppercase',
                          borderBottom: '1px solid rgba(255,255,255,0.07)',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 100).map(t => (
                      <tr
                        key={t.id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <td style={{ padding: '8px 12px', color: '#94a3b8' }}>
                          {new Date(t.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#f59e0b', fontWeight: 600 }}>
                          {formatVND(t.amount)}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#e2e8f0', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.note}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#94a3b8' }}>
                          {t.category ?? '—'}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          {t.label === 'latte' ? <span className="badge-latte">Linh tinh</span> :
                           t.label === 'essential' ? <span className="badge-essential">Thiết yếu</span> :
                           <span style={{ color: '#64748b', fontSize: 11 }}>Chưa phân loại</span>}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <button
                            onClick={() => deleteTransaction(t.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14 }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactions.length > 100 && (
                  <div style={{ fontSize: 12, color: '#64748b', padding: '10px 12px' }}>
                    Hiển thị 100/{transactions.length} giao dịch
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'categories' && (
          <CategoryManager categories={categories} addCategory={addCategory} deleteCategory={deleteCategory} />
        )}
      </div>
    </div>
  );
}

function CategoryManager({
  categories,
  addCategory,
  deleteCategory,
}: {
  categories: Category[];
  addCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
}) {
  const [form, setForm] = useState({ label: '', icon: '📦', defaultLabel: 'latte' as 'latte' | 'essential', color: '#6366f1' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) return;
    addCategory({
      id: form.label.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      label: form.label,
      icon: form.icon,
      defaultLabel: form.defaultLabel,
      color: form.color,
    });
    setForm({ label: '', icon: '📦', defaultLabel: 'latte', color: '#6366f1' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 14 }}>➕ Thêm danh mục mới</div>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Icon</label>
            <input className="input-field" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} style={{ width: 60 }} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Tên danh mục</label>
            <input className="input-field" placeholder="Trà sữa" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Mặc định</label>
            <select className="input-field" value={form.defaultLabel} onChange={e => setForm(f => ({ ...f, defaultLabel: e.target.value as 'latte' | 'essential' }))}>
              <option value="latte">Linh tinh</option>
              <option value="essential">Thiết yếu</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Thêm</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {categories.map(c => (
          <div
            key={c.id}
            className="glass-card"
            style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10, borderLeft: `3px solid ${c.color}` }}
          >
            <span style={{ fontSize: 22 }}>{c.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{c.label}</div>
              <div style={{ fontSize: 11 }}>
                {c.defaultLabel === 'latte'
                  ? <span className="badge-latte">Linh tinh</span>
                  : <span className="badge-essential">Thiết yếu</span>}
              </div>
            </div>
            <button
              onClick={() => deleteCategory(c.id)}
              style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 14 }}
              title="Xóa danh mục"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
