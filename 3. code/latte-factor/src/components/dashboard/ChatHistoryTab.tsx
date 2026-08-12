// src/components/dashboard/ChatHistoryTab.tsx

import type { ChatMessage } from '../../types';
import { useChatStore } from '../../store/chatStore';
import { IconTrash, IconBot, IconUser } from '../common/Icons';

interface Props {
  messages: ChatMessage[];
}

export default function ChatHistoryTab({ messages }: Props) {
  const { clearMessages } = useChatStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#f8fafc' }}>
            Lịch sử Trò chuyện Trợ lý AI
          </h2>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            {messages.length} tin nhắn được lưu trữ trong phiên làm việc
          </p>
        </div>
        {messages.length > 0 && (
          <button
            className="btn-danger"
            onClick={() => { if (confirm('Xóa toàn bộ lịch sử trò chuyện?')) clearMessages(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <IconTrash size={15} /> Xóa lịch sử
          </button>
        )}
      </div>

      {messages.length === 0 ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 60 }}>
          <IconBot size={40} color="#475569" style={{ marginBottom: 12 }} />
          <div>Chưa có dữ liệu trò chuyện.</div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 20, maxHeight: 600, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: msg.role === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: msg.role === 'user' ? '#a5b4fc' : '#94a3b8',
                  flexShrink: 0,
                }}>
                  {msg.role === 'user' ? <IconUser size={16} /> : <IconBot size={16} />}
                </div>
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user'
                    ? 'rgba(99,102,241,0.2)'
                    : 'rgba(255,255,255,0.05)',
                  border: msg.role === 'user'
                    ? '1px solid rgba(99,102,241,0.3)'
                    : '1px solid rgba(255,255,255,0.07)',
                  fontSize: 13,
                  color: '#e2e8f0',
                  lineHeight: 1.5,
                }}>
                  {msg.content}
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {new Date(msg.timestamp).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
