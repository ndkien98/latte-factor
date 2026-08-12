// src/components/layout/Sidebar.tsx

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'input', label: 'Nhập liệu', icon: '✏️' },
  { id: 'chatbot', label: 'Chatbot AI', icon: '🤖' },
  { id: 'config', label: 'Cấu hình', icon: '⚙️' },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside
      style={{
        width: 220,
        background: 'rgba(22, 33, 62, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '24px 12px',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '0 8px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>💸</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Lỗ Thủng Ví
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>AI Trợ Lý Chi Tiêu</div>
          </div>
        </div>
      </div>

      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 10,
            border: activePage === item.id ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
            background: activePage === item.id ? 'rgba(99,102,241,0.15)' : 'transparent',
            color: activePage === item.id ? '#a5b4fc' : '#64748b',
            fontSize: 14,
            fontWeight: activePage === item.id ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'left',
          }}
          onMouseEnter={e => {
            if (activePage !== item.id) {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
              (e.currentTarget as HTMLElement).style.color = '#94a3b8';
            }
          }}
          onMouseLeave={e => {
            if (activePage !== item.id) {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = '#64748b';
            }
          }}
        >
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}

      <div style={{ marginTop: 'auto', padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: 10, color: '#475569', textAlign: 'center', lineHeight: 1.5 }}>
          <div>6 thuật toán ML</div>
          <div>100% client-side</div>
        </div>
      </div>
    </aside>
  );
}
