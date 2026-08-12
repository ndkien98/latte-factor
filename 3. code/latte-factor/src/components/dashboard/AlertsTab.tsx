// src/components/dashboard/AlertsTab.tsx

import { useState } from 'react';
import type { AssociationRule } from '../../types';
import { requestNotificationPermission, checkAndSendAprioriAlert } from '../../services/notification';

interface Props {
  rules: AssociationRule[];
}

export default function AlertsTab({ rules }: Props) {
  const [notifGranted, setNotifGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [alertSent, setAlertSent] = useState(false);

  const handleEnableNotif = async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
  };

  const handleTestAlert = () => {
    const sent = checkAndSendAprioriAlert(rules, 0.3);
    setAlertSent(sent);
    if (!sent) alert('Không có luật nào khớp với thời điểm hiện tại.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          <span className="gradient-text">Cảnh báo Hành vi (Apriori)</span>
        </h2>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          Tìm "ngòi nổ" hành vi chi tiêu — Support/Confidence/Lift của các luật kết hợp
        </p>
      </div>

      <div
        className="glass-card"
        style={{
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderLeft: `4px solid ${notifGranted ? '#10b981' : '#f59e0b'}`,
        }}
      >
        <span style={{ fontSize: 20 }}>{notifGranted ? '🔔' : '🔕'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
            Thông báo đẩy (Web Push)
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            {notifGranted ? 'Đang bật — sẽ cảnh báo khi phát hiện hành vi nguy hiểm' : 'Chưa bật — bấm để cấp quyền'}
          </div>
        </div>
        {notifGranted ? (
          <button className="btn-secondary" onClick={handleTestAlert}>
            🧪 Test Alert
          </button>
        ) : (
          <button className="btn-primary" onClick={handleEnableNotif}>
            Bật thông báo
          </button>
        )}
      </div>

      {alertSent && (
        <div className="glass-card" style={{ padding: 12, borderLeft: '4px solid #10b981', fontSize: 13, color: '#10b981' }}>
          ✅ Đã gửi thông báo thử nghiệm!
        </div>
      )}

      {rules.length === 0 ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 40, fontSize: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
          Chưa tìm được luật kết hợp nào. Hãy thêm nhiều dữ liệu hơn hoặc giảm ngưỡng minSupport.
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 14 }}>
            {rules.length} luật kết hợp tìm được
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Nguyên nhân (A)', 'Kết quả (B)', 'Support', 'Confidence', 'Lift'].map(h => (
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
                {rules.map((r, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: r.confidence >= 0.8 ? 'rgba(245,158,11,0.04)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '8px 12px', color: '#a5b4fc' }}>
                      {r.antecedent.map(a => a.replace(':', ' ')).join(', ')}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>
                      {r.consequent.map(c => c.replace(':', ' ')).join(', ')}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#94a3b8' }}>
                      {(r.support * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        color: r.confidence >= 0.8 ? '#f59e0b' : '#94a3b8',
                        fontWeight: r.confidence >= 0.8 ? 700 : 400,
                      }}>
                        {(r.confidence * 100).toFixed(1)}% {r.confidence >= 0.8 && '⚠️'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: r.lift > 1.2 ? '#10b981' : '#94a3b8' }}>
                      {r.lift.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
