// src/components/dashboard/AlertsTab.tsx

import { useState } from 'react';
import type { AssociationRule } from '../../types';
import { requestNotificationPermission, checkAndSendAprioriAlert } from '../../services/notification';
import { IconBell, IconAlertTriangle } from '../common/Icons';

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
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#f8fafc' }}>
          Cảnh báo Hành vi (Apriori)
        </h2>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          Nhận diện quy luật thói quen chi tiêu thông qua chỉ số Support, Confidence và Lift
        </p>
      </div>

      <div
        className="glass-card flex flex-col sm:flex-row sm:items-center p-4 gap-4"
        style={{
          borderLeft: `4px solid ${notifGranted ? '#10b981' : '#f59e0b'}`,
        }}
      >
        <div style={{ color: notifGranted ? '#10b981' : '#f59e0b' }}>
          <IconBell size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
            Thông báo đẩy Trình duyệt (Web Push)
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            {notifGranted ? 'Đã bật — tự động cảnh báo khi phát hiện nguy cơ chi tiêu bốc đồng' : 'Chưa bật — nhấp để cấp quyền thông báo'}
          </div>
        </div>
        {notifGranted ? (
          <button className="btn-secondary" onClick={handleTestAlert}>
            Kiểm tra Thông báo
          </button>
        ) : (
          <button className="btn-primary" onClick={handleEnableNotif}>
            Cấp quyền Thông báo
          </button>
        )}
      </div>

      {alertSent && (
        <div className="glass-card" style={{ padding: 12, borderLeft: '4px solid #10b981', fontSize: 13, color: '#10b981' }}>
          Đã gửi thông báo thử nghiệm thành công!
        </div>
      )}

      {rules.length === 0 ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 40, fontSize: 13 }}>
          <IconAlertTriangle size={36} color="#475569" style={{ marginBottom: 10 }} />
          <div>Chưa tìm thấy luật kết hợp phù hợp. Cần thêm dữ liệu giao dịch hoặc hạ thấp ngưỡng Support.</div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 14 }}>
            Danh sách {rules.length} quy luật phát hiện
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Tiền đề (A)', 'Kết quả (B)', 'Support', 'Confidence', 'Lift'].map(h => (
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
                        {(r.confidence * 100).toFixed(1)}%
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
