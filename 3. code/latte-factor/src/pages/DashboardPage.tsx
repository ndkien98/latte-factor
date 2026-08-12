// src/pages/DashboardPage.tsx — Main dashboard with 7 tabs

import { useState } from 'react';
import { useComputedResults } from '../hooks/useRecomputeOnParamsChange';
import { useTransactionStore } from '../store/transactionStore';
import { useChatStore } from '../store/chatStore';
import OverviewTab from '../components/dashboard/OverviewTab';
import ClusterTab from '../components/dashboard/ClusterTab';
import TrendTab from '../components/dashboard/TrendTab';
import FutureValueTab from '../components/dashboard/FutureValueTab';
import BudgetTab from '../components/dashboard/BudgetTab';
import AlertsTab from '../components/dashboard/AlertsTab';
import ChatHistoryTab from '../components/dashboard/ChatHistoryTab';
import { exportToExcel } from '../services/exportExcel';

const TABS = [
  { id: 'overview', label: '🏠 Tổng quan' },
  { id: 'cluster', label: '🔮 Phân cụm' },
  { id: 'trend', label: '📈 Xu hướng' },
  { id: 'future', label: '💰 Tích lũy' },
  { id: 'budget', label: '🎯 Ngân sách' },
  { id: 'alerts', label: '🚨 Cảnh báo' },
  { id: 'chat-history', label: '💬 Chat log' },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [exporting, setExporting] = useState(false);
  const results = useComputedResults();
  const { transactions } = useTransactionStore();
  const { messages } = useChatStore();

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToExcel({
        transactions,
        clusters: results.clusters,
        regression: results.regression,
        futureValue: results.futureValue,
        knapsackResult: results.knapsackResult,
        rules: results.rules,
        chatMessages: messages,
        totalAmount: results.totalAmount,
        latteAmount: results.latteAmount,
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(22,33,62,0.5)',
        backdropFilter: 'blur(10px)',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || transactions.length === 0}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: transactions.length === 0 ? 0.5 : 1 }}
        >
          {exporting ? '⏳ Đang xuất...' : '📥 Xuất Excel'}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {transactions.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 16,
            color: '#64748b',
          }}>
            <div style={{ fontSize: 64 }}>📊</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#94a3b8' }}>Chưa có dữ liệu</div>
            <div style={{ fontSize: 14, textAlign: 'center', maxWidth: 400 }}>
              Hãy nhập dữ liệu giao dịch ở tab <strong style={{ color: '#a5b4fc' }}>Nhập liệu</strong>, 
              hoặc nói chuyện với <strong style={{ color: '#a5b4fc' }}>Chatbot AI</strong> để bắt đầu.
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab results={results} />}
            {activeTab === 'cluster' && <ClusterTab clusters={results.clusters} />}
            {activeTab === 'trend' && <TrendTab regression={results.regression} />}
            {activeTab === 'future' && <FutureValueTab futureValue={results.futureValue} />}
            {activeTab === 'budget' && <BudgetTab knapsackResult={results.knapsackResult} />}
            {activeTab === 'alerts' && <AlertsTab rules={results.rules} />}
            {activeTab === 'chat-history' && <ChatHistoryTab messages={messages} />}
          </>
        )}
      </div>
    </div>
  );
}
