// src/components/layout/Sidebar.tsx

import React from 'react';
import { IconDashboard, IconInput, IconChat, IconSettings, IconWallet } from '../common/Icons';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <IconDashboard size={18} /> },
  { id: 'input', label: 'Nhập liệu', icon: <IconInput size={18} /> },
  { id: 'chatbot', label: 'Trợ lý AI', icon: <IconChat size={18} /> },
  { id: 'config', label: 'Cấu hình', icon: <IconSettings size={18} /> },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside
      style={{
        width: 230,
        background: 'rgba(22, 33, 62, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '24px 14px',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '0 8px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}>
            <IconWallet size={20} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              Lỗ Thủng Ví
            </div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>AI Financial Assistant</div>
          </div>
        </div>
      </div>

      {NAV_ITEMS.map(item => {
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 10,
              border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
              background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: isActive ? '#a5b4fc' : '#94a3b8',
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
            }}
          >
            <span style={{ color: isActive ? '#818cf8' : '#64748b' }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}

      <div style={{ marginTop: 'auto', padding: '14px 8px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 11, color: '#475569', textAlign: 'center', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: '#64748b' }}>Latte Factor Engine v1.0</div>
          <div>Client-Side Analytics</div>
          <div style={{ marginTop: 2, color: '#4f5e74', fontWeight: 500 }}>Tác giả: kiennd25</div>
        </div>
      </div>
    </aside>
  );
}
