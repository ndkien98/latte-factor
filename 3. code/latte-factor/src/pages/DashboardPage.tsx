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
import {
  IconDashboard,
  IconPieChart,
  IconTrendingUp,
  IconSavings,
  IconTarget,
  IconAlertTriangle,
  IconChat,
  IconDownload,
  IconFileText,
} from '../components/common/Icons';

const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: <IconDashboard size={15} /> },
  { id: 'cluster', label: 'Phân cụm', icon: <IconPieChart size={15} /> },
  { id: 'trend', label: 'Xu hướng', icon: <IconTrendingUp size={15} /> },
  { id: 'future', label: 'Tích lũy', icon: <IconSavings size={15} /> },
  { id: 'budget', label: 'Ngân sách', icon: <IconTarget size={15} /> },
  { id: 'alerts', label: 'Cảnh báo', icon: <IconAlertTriangle size={15} /> },
  { id: 'chat-history', label: 'Lịch sử Chat', icon: <IconChat size={15} /> },
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
        padding: '14px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(22,33,62,0.5)',
        backdropFilter: 'blur(10px)',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          flexWrap: 'nowrap',
          width: '100%',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 4
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${isActive ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span style={{ color: isActive ? '#a5b4fc' : '#64748b' }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || transactions.length === 0}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: transactions.length === 0 ? 0.5 : 1 }}
        >
          <IconDownload size={16} />
          {exporting ? 'Đang xuất...' : 'Xuất Excel'}
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
            <IconFileText size={48} color="#475569" />
            <div style={{ fontSize: 18, fontWeight: 600, color: '#94a3b8' }}>Chưa có dữ liệu giao dịch</div>
            <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 420, lineHeight: 1.6 }}>
              Vui lòng chuyển sang tab <strong style={{ color: '#a5b4fc' }}>Nhập liệu</strong> để thêm dữ liệu hoặc tải dataset mẫu, 
              hoặc sử dụng <strong style={{ color: '#a5b4fc' }}>Trợ lý AI</strong>.
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
