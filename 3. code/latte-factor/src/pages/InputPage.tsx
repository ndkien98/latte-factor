// src/pages/InputPage.tsx — Manual transaction input + category manager + db.json file storage

import React, { useState, useRef } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import type { Transaction, Category } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { importCSV } from '../data/importers/csvImporter';
import { exportBackupJSON, importBackupJSON, resetFileDatabase } from '../services/backupService';
import { IconPlus, IconFileText, IconTrash, IconInput, IconCheck, IconDownload, IconRefresh } from '../components/common/Icons';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function InputPage() {
  const { transactions, categories, addTransaction, deleteTransaction, addCategory, deleteCategory } = useTransactionStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const backupRef = useRef<HTMLInputElement>(null);
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
        setImportMsg(`Đã nhập thành công ${txs.length} giao dịch và lưu vào db.json.`);
      }
    } catch (err) {
      setImportMsg('Lỗi khi đọc file: ' + String(err));
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleBackupRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const res = await importBackupJSON(file);
      setImportMsg(res.message);
    } finally {
      setImporting(false);
      if (backupRef.current) backupRef.current.value = '';
    }
  };

  const handleResetDatabase = async () => {
    if (confirm('XÁC NHẬN: Xóa sạch toàn bộ dữ liệu trong file db.json và khôi phục về trạng thái trống?')) {
      setImporting(true);
      try {
        await resetFileDatabase();
        setImportMsg('Đã xóa sạch dữ liệu trong file db.json.');
      } finally {
        setImporting(false);
      }
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
      setImportMsg(`Đã tải thành công ${txs.length} giao dịch mẫu vào db.json.`);
    } catch {
      setImportMsg('Hướng dẫn: Có thể tải file CSV mẫu từ thư mục docs/DATA_SCHEMA.md');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#f8fafc' }}>
            Nhập liệu & Quản lý File Database (db.json)
          </h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            Dữ liệu tự động lưu liên tục vào file <code>src/data/db.json</code> — không lo mất dữ liệu khi tắt project
          </p>
        </div>

        {/* File import & backup action card */}
        <div
          className="glass-card"
          style={{ padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
        >
          <IconFileText size={22} color="#818cf8" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>Cơ chế Lưu trữ File (db.json)</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Lưu trực tiếp vào ổ đĩa dự án + Hỗ trợ Import / Export JSON</div>
          </div>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleFileImport} />
          <input ref={backupRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleBackupRestore} />

          <button className="btn-secondary" onClick={() => fileRef.current?.click()} disabled={importing}>
            Import Sao kê CSV
          </button>
          <button className="btn-secondary" onClick={() => backupRef.current?.click()} disabled={importing}>
            Khôi phục File JSON
          </button>
          <button className="btn-secondary" onClick={exportBackupJSON} disabled={transactions.length === 0} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconDownload size={14} /> Tải File Backup
          </button>
          <button className="btn-secondary" onClick={handleLoadSample} disabled={importing}>
            Nạp Dữ liệu Mẫu
          </button>
          <button
            className="btn-danger"
            onClick={handleResetDatabase}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <IconRefresh size={14} /> Reset Database
          </button>
        </div>

        {importMsg && (
          <div className="glass-card" style={{
            padding: 12,
            marginBottom: 16,
            fontSize: 13,
            color: '#a5b4fc',
            borderLeft: '4px solid #6366f1',
          }}>
            {importMsg}
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {[
            { id: 'form', label: 'Nhập thủ công', icon: <IconInput size={15} /> },
            { id: 'list', label: `Danh sách giao dịch (${transactions.length})`, icon: <IconFileText size={15} /> },
            { id: 'categories', label: `Danh mục (${categories.length})`, icon: <IconCheck size={15} /> },
          ].map(t => (
            <button
              key={t.id}
              className={`tab-button ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id as typeof tab)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {t.icon}
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
                    placeholder="VD: 35000 hoặc 35k"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Thời gian giao dịch
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
                  Nội dung chuyển khoản / Ghi chú
                </label>
                <input
                  className="input-field"
                  placeholder="VD: Mua trà sữa Te Amo..."
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Danh mục chi tiêu
                  </label>
                  <select
                    className="input-field"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Phân loại (bỏ trống để AI tự động dự đoán)
                  </label>
                  <select
                    className="input-field"
                    value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value as typeof form.label }))}
                  >
                    <option value="">Phân loại tự động (AI)</option>
                    <option value="essential">Thiết yếu</option>
                    <option value="latte">Chi tiêu linh tinh (Latte Factor)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconPlus size={16} /> Thêm giao dịch
              </button>
            </form>
          </div>
        )}

        {tab === 'list' && (
          <div className="glass-card" style={{ padding: 20 }}>
            {transactions.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>
                Chưa có dữ liệu. Vui lòng nhập thủ công, nạp dữ liệu mẫu hoặc khôi phục từ file JSON.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      {['Thời gian', 'Số tiền', 'Nội dung', 'Danh mục', 'Phân loại', ''].map(h => (
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
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            title="Xóa"
                          >
                            <IconTrash size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactions.length > 100 && (
                  <div style={{ fontSize: 12, color: '#64748b', padding: '10px 12px' }}>
                    Hiển thị 100/{transactions.length} giao dịch gần nhất
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
  const [form, setForm] = useState({ label: '', defaultLabel: 'latte' as 'latte' | 'essential', color: '#6366f1' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) return;
    addCategory({
      id: form.label.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      label: form.label,
      icon: '',
      defaultLabel: form.defaultLabel,
      color: form.color,
    });
    setForm({ label: '', defaultLabel: 'latte', color: '#6366f1' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 14 }}>Thêm danh mục mới</div>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Tên danh mục</label>
            <input className="input-field" placeholder="VD: Trà sữa, Ăn vặt..." value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Nhãn mặc định</label>
            <select className="input-field" value={form.defaultLabel} onChange={e => setForm(f => ({ ...f, defaultLabel: e.target.value as 'latte' | 'essential' }))}>
              <option value="latte">Chi tiêu linh tinh</option>
              <option value="essential">Thiết yếu</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconPlus size={16} /> Thêm
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {categories.map(c => (
          <div
            key={c.id}
            className="glass-card"
            style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10, borderLeft: `3px solid ${c.color}` }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{c.label}</div>
              <div style={{ fontSize: 11, marginTop: 2 }}>
                {c.defaultLabel === 'latte'
                  ? <span className="badge-latte">Linh tinh</span>
                  : <span className="badge-essential">Thiết yếu</span>}
              </div>
            </div>
            <button
              onClick={() => deleteCategory(c.id)}
              style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}
              title="Xóa danh mục"
            >
              <IconTrash size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
