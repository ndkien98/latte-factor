// src/services/notification.ts — Web Push Notification service

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function sendNotification(title: string, body: string, icon = '/wallet.svg') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification(title, { body, icon });
}

export function checkAndSendAprioriAlert(
  rules: { antecedent: string[]; consequent: string[]; confidence: number; description: string }[],
  threshold = 0.8
): boolean {
  const now = new Date();
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const currentDay = `Thứ:${days[now.getDay()]}`;

  const hour = now.getHours();
  let slot = 'Đêm';
  if (hour >= 6 && hour < 10) slot = 'Sáng sớm';
  else if (hour >= 10 && hour < 12) slot = 'Buổi sáng';
  else if (hour >= 12 && hour < 14) slot = 'Buổi trưa';
  else if (hour >= 14 && hour < 17) slot = 'Chiều';
  else if (hour >= 17 && hour < 20) slot = 'Buổi tối';

  const triggered = rules.find(r =>
    r.confidence >= threshold &&
    (r.antecedent.includes(currentDay) || r.antecedent.includes(`Giờ:${slot}`))
  );

  if (triggered) {
    sendNotification(
      '⚠️ Cảnh báo chi tiêu — Lỗ Thủng Ví',
      `${triggered.description}\n💡 Hãy uống 1 ly nước lọc thay vì trà sữa!`
    );
    return true;
  }
  return false;
}
