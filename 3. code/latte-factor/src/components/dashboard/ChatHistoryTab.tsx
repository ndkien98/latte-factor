// src/components/dashboard/ChatHistoryTab.tsx

import type { ChatMessage } from '../../types';
import { useChatStore } from '../../store/chatStore';

interface Props {
  messages: ChatMessage[];
}

export default function ChatHistoryTab({ messages }: Props) {
  const { clearMessages } = useChatStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            <span className="gradient-text">Lịch sử Chatbot</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            {messages.length} tin nhắn trong lịch sử (xuất Excel để lưu trữ lâu dài)
          </p>
        </div>
        {messages.length > 0 && (
          <button
            className="btn-danger"
            onClick={() => { if (confirm('Xóa toàn bộ lịch sử chat?')) clearMessages(); }}
          >
            🗑️ Xóa lịch sử
          </button>
        )}
      </div>

      {messages.length === 0 ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
          <div>Chưa có lịch sử chat. Hãy thử Chatbot AI!</div>
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
                  gap: 8,
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>
                  {msg.role === 'user' ? '👤' : '🤖'}
                </span>
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
