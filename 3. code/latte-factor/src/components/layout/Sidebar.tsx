// src/components/layout/Sidebar.tsx

import React, { useState } from 'react';
import { IconDashboard, IconInput, IconChat, IconSettings, IconWallet, IconChevronLeft, IconChevronRight } from '../common/Icons';

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="sidebar-desktop"
        style={{
          width: isCollapsed ? 72 : 230,
          background: 'rgba(22, 33, 62, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: isCollapsed ? '24px 8px' : '24px 14px',
          flexShrink: 0,
          transition: 'width 0.2s ease, padding 0.2s ease',
        }}
      >
        <div style={{
          padding: isCollapsed ? '0 0 24px' : '0 8px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCollapsed ? 'center' : 'stretch',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', width: '100%' }}>
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
                flexShrink: 0,
              }}>
                <IconWallet size={20} />
              </div>
              {!isCollapsed && (
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                    Lỗ Thủng Ví
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>AI Financial Assistant</div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="Thu nhỏ menu"
              >
                <IconChevronLeft size={14} />
              </button>
            )}
          </div>

          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Mở rộng menu"
            >
              <IconChevronRight size={14} />
            </button>
          )}
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
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: isCollapsed ? 0 : 12,
                padding: isCollapsed ? '10px' : '10px 14px',
                borderRadius: 10,
                border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: isActive ? '#a5b4fc' : '#94a3b8',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                width: '100%',
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <span style={{ color: isActive ? '#818cf8' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </span>
              {!isCollapsed && item.label}
            </button>
          );
        })}

        <div style={{ marginTop: 'auto', padding: isCollapsed ? '14px 0 0' : '14px 8px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {isCollapsed ? (
            <div style={{ textAlign: 'center', color: '#475569', fontSize: 10, fontWeight: 600 }} title="Tác giả: kiennd25">
              v1.0
            </div>
          ) : (
            <div style={{ fontSize: 11, color: '#475569', textAlign: 'center', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 600, color: '#64748b' }}>Latte Factor Engine v1.0</div>
              <div>Client-Side Analytics</div>
              <div style={{ marginTop: 2, color: '#4f5e74', fontWeight: 500 }}>Tác giả: kiennd25</div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        className="sidebar-mobile"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'rgba(22, 33, 62, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 1000,
          padding: '0 8px',
        }}
      >
        {NAV_ITEMS.map(item => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                color: isActive ? '#a5b4fc' : '#64748b',
                fontSize: 10,
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flex: 1,
                height: '100%',
              }}
            >
              <span style={{ color: isActive ? '#818cf8' : '#475569' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
