// src/pages/ChatbotPage.tsx — AI Chatbot with Vietnamese NLP

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useTransactionStore } from '../store/transactionStore';
import { NaiveBayesClassifier } from '../algorithms/naiveBayes';
import { detectIntent } from '../nlp/intentDetector';
import type { ChatMessage, Transaction, TransactionLabel } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { IconBot, IconUser, IconCheck, IconMicrophone } from '../components/common/Icons';

function buildClassifier(transactions: Transaction[]): NaiveBayesClassifier {
  const clf = new NaiveBayesClassifier();
  const labeled = transactions.filter(t => t.label && t.label !== 'unknown');
  if (labeled.length > 0) {
    clf.train(labeled.map(t => ({ text: t.note, label: t.label! })));
  }
  const defaults = [
    { text: 'tra sua te amo gong cha', label: 'latte' as TransactionLabel },
    { text: 'bun dau mam tom an vat', label: 'latte' as TransactionLabel },
    { text: 'nuoc mia banh mi op la', label: 'latte' as TransactionLabel },
    { text: 'tien nha dien nuoc internet y te', label: 'essential' as TransactionLabel },
    { text: 'xang xe mua thuc pham sieu thi', label: 'essential' as TransactionLabel },
    { text: 'vien phi y te thuoc', label: 'essential' as TransactionLabel },
  ];
  clf.train(defaults);
  return clf;
}

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

function generateBotResponse(
  input: string,
  intent: ReturnType<typeof detectIntent>,
  transactions: Transaction[],
  clf: NaiveBayesClassifier
): { text: string; transaction?: Transaction } {
  if (intent.intent === 'add_transaction' && intent.extractedData?.amount) {
    const prediction = clf.predict(input);
    const tx: Transaction = {
      ...intent.extractedData as Transaction,
      id: uuidv4(),
      note: input,
      label: prediction.label !== 'unknown' ? prediction.label : 'latte',
      confidence: prediction.confidence,
      source: 'chatbot',
    };

    const labelText = tx.label === 'latte' ? 'Chi tiêu linh tinh (Latte Factor)' : 'Chi tiêu thiết yếu';
    const confText = `${(prediction.confidence * 100).toFixed(0)}%`;

    return {
      text: `Đã ghi nhận giao dịch: ${formatVND(tx.amount)} — ${new Date(tx.timestamp).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}\n\nPhân loại dự đoán: ${labelText} (Độ tin cậy: ${confText})\n\nBạn có thể điều chỉnh nhãn bên dưới để giúp mô hình AI nâng cao độ chính xác.`,
      transaction: tx,
    };
  }

  if (intent.intent === 'query_report') {
    const latteTotal = transactions.filter(t => t.label === 'latte').reduce((s, t) => s + t.amount, 0);
    const total = transactions.reduce((s, t) => s + t.amount, 0);
    const latteCount = transactions.filter(t => t.label === 'latte').length;
    return {
      text: `Báo cáo chi tiêu tổng hợp:\n\n• Tổng chi tiêu: ${formatVND(total)}\n• Chi tiêu linh tinh: ${formatVND(latteTotal)} (${latteCount} giao dịch)\n• Chi tiêu thiết yếu: ${formatVND(total - latteTotal)}\n• Tỷ lệ linh tinh: ${total > 0 ? ((latteTotal / total) * 100).toFixed(1) : 0}%`,
    };
  }

  if (intent.intent === 'query_transactions' && intent.extractedData) {
    const { startDate, endDate, description } = intent.extractedData;
    const filtered = transactions.filter(t => {
      const ts = new Date(t.timestamp).getTime();
      return ts >= startDate.getTime() && ts <= endDate.getTime();
    });

    if (filtered.length === 0) {
      return {
        text: `Tôi không tìm thấy giao dịch nào trong khoảng thời gian: ${description}.`,
      };
    }

    const txList = filtered
      .map(t => {
        const time = new Date(t.timestamp).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
        const labelText = t.label === 'latte' ? 'Linh tinh (Latte)' : 'Thiết yếu';
        return `• ${time}: ${t.note} (${formatVND(t.amount)}) — Phân loại: ${labelText}`;
      })
      .join('\n');

    const totalFiltered = filtered.reduce((sum, t) => sum + t.amount, 0);

    return {
      text: `Danh sách giao dịch tìm thấy ${description} (${filtered.length} giao dịch, tổng cộng ${formatVND(totalFiltered)}):\n\n${txList}`,
    };
  }

  if (intent.intent === 'set_budget') {
    return {
      text: `Đã ghi nhận ý định thiết lập ngân sách ${intent.extractedData?.amount ? formatVND(intent.extractedData.amount) : ''}. Bạn có thể vào phần Cấu hình để điều chỉnh bài toán 0/1 Knapsack.`,
    };
  }

  if (intent.intent === 'query_trend') {
    return {
      text: `Để xem chi tiết mô hình hồi quy tuyến tính (Linear Regression) và đường dự báo 30 ngày, vui lòng chọn tab Xu hướng trên Dashboard.`,
    };
  }

  if (intent.intent === 'query_savings') {
    return {
      text: `Để xem giá trị tích lũy dòng tiền (Future Value of Annuity) khi cắt giảm chi tiêu linh tinh, vui lòng chọn tab Tích lũy trên Dashboard.`,
    };
  }

  if (intent.intent === 'help') {
    return {
      text: `Hướng dẫn tương tác với Trợ lý AI:\n\n• Thêm giao dịch: "hôm nay mua trà sữa 35k lúc 3h chiều"\n• Lịch sử giao dịch: "lịch sử chi tiêu 3 ngày qua", "xem lại giao dịch tháng này"\n• Tra cứu báo cáo: "thống kê chi tiêu tháng này"\n• Hỏi xu hướng: "xu hướng chi tiêu của tôi thế nào"\n• Dự báo tích lũy: "nếu tiết kiệm trà sữa thì được bao nhiêu"\n\nHệ thống kết hợp thuật toán Naive Bayes NLP và bộ quy tắc nhận diện ý định.`,
    };
  }

  return {
    text: `Hệ thống chưa nhận diện rõ yêu cầu. Bạn có thể gõ "help" để xem câu lệnh mẫu hoặc nhập giao dịch trực tiếp (VD: "mua trà sữa 35k lúc 3h chiều").`,
  };
}

export default function ChatbotPage() {
  const { messages, addMessage } = useChatStore();
  const { transactions, addTransaction, updateTransaction } = useTransactionStore();
  const [input, setInput] = useState('');
  const [pendingTx, setPendingTx] = useState<{ msgId: string; tx: Transaction } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'vi-VN';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói Web Speech API (khuyên dùng Chrome, Edge hoặc Safari).');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const clf = React.useMemo(() => buildClassifier(transactions), [transactions.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        id: uuidv4(),
        role: 'bot',
        content: 'Xin chào! Tôi là Trợ lý Tài chính AI — hỗ trợ bạn ghi nhận và phân loại giao dịch bằng thuật toán NLP Naive Bayes.\n\nNhập giao dịch mẫu: "hôm nay mua trà sữa 35k lúc 3h chiều"\n\nBạn cũng có thể xem lại lịch sử giao dịch bằng các câu như: "lịch sử chi tiêu 3 ngày qua", "xem lại giao dịch tháng này", "danh sách đã chi hôm nay"...',
        timestamp: new Date(),
      });
    }
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    addMessage(userMsg);

    const intent = detectIntent(text);
    const { text: botText, transaction } = generateBotResponse(text, intent, transactions, clf);

    const botMsg: ChatMessage = {
      id: uuidv4(),
      role: 'bot',
      content: botText,
      timestamp: new Date(),
      intent: intent.intent,
      relatedTransaction: transaction,
    };
    addMessage(botMsg);

    if (transaction) {
      setPendingTx({ msgId: botMsg.id, tx: transaction });
    }
  };

  const confirmTransaction = (tx: Transaction) => {
    addTransaction(tx);
    setPendingTx(null);
    addMessage({
      id: uuidv4(),
      role: 'bot',
      content: `Đã lưu giao dịch ${formatVND(tx.amount)} vào hệ thống!`,
      timestamp: new Date(),
    });
  };

  const correctLabel = (tx: Transaction, label: TransactionLabel) => {
    clf.updateWithExample(tx.note, label);
    const updated = { ...tx, label };
    if (transactions.find(t => t.id === tx.id)) {
      updateTransaction(tx.id, { label });
    } else {
      addTransaction(updated);
    }
    setPendingTx(null);
    addMessage({
      id: uuidv4(),
      role: 'bot',
      content: `Đã cập nhật phản hồi: "${tx.note}" → ${label === 'latte' ? 'Chi tiêu linh tinh' : 'Thiết yếu'}. Mô hình Naive Bayes đã học thành công từ ví dụ này.`,
      timestamp: new Date(),
    });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        padding: '14px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(22,33,62,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'rgba(99,102,241,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#818cf8',
        }}>
          <IconBot size={18} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc' }}>Trợ lý Phân loại AI</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Mô hình Naive Bayes NLP · Online Learning Enabled</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: 10,
              alignItems: 'flex-start',
              animation: 'fadeSlideUp 0.3s ease both',
            }}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}>
              {msg.role === 'user' ? <IconUser size={16} /> : <IconBot size={16} />}
            </div>
            <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user'
                  ? 'rgba(99,102,241,0.25)'
                  : 'rgba(255,255,255,0.05)',
                border: msg.role === 'user'
                  ? '1px solid rgba(99,102,241,0.35)'
                  : '1px solid rgba(255,255,255,0.07)',
                fontSize: 13,
                color: '#e2e8f0',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>

              {pendingTx && pendingTx.msgId === msg.id && pendingTx.tx && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => confirmTransaction(pendingTx.tx)}
                    className="btn-primary"
                    style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <IconCheck size={14} /> Xác nhận
                  </button>
                  <button
                    onClick={() => correctLabel(pendingTx.tx, 'essential')}
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: '6px 12px' }}
                  >
                    Gắn nhãn: Thiết yếu
                  </button>
                  <button
                    onClick={() => correctLabel(pendingTx.tx, 'latte')}
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: '6px 12px' }}
                  >
                    Gắn nhãn: Linh tinh
                  </button>
                  <button
                    onClick={() => setPendingTx(null)}
                    className="btn-danger"
                    style={{ fontSize: 12, padding: '6px 12px' }}
                  >
                    Hủy
                  </button>
                </div>
              )}

              <div style={{ fontSize: 10, color: '#475569', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: '8px 24px',
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        {[
          'hôm nay mua trà sữa 35k lúc 3h chiều',
          'thống kê chi tiêu tháng này',
          'lịch sử chi tiêu 3 ngày qua',
          'help',
        ].map(s => (
          <button
            key={s}
            onClick={() => { setInput(s); }}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 12,
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: '#a5b4fc',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{
        padding: '12px 24px 20px',
        display: 'flex',
        gap: 10,
        background: 'rgba(22,33,62,0.5)',
      }}>
        <input
          className="input-field"
          placeholder="Nhập nội dung giao dịch hoặc câu hỏi..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          style={{ flex: 1 }}
        />
        <button
          className={`btn-secondary ${isListening ? 'animate-mic-pulse' : ''}`}
          onClick={toggleListen}
          title={isListening ? 'Đang nghe... Nhấp để dừng' : 'Nhập liệu bằng giọng nói'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 12px',
            borderRadius: 8,
          }}
        >
          <IconMicrophone size={18} color={isListening ? '#ef4444' : '#94a3b8'} />
        </button>
        <button className="btn-primary" onClick={handleSend} disabled={!input.trim()}>
          Gửi
        </button>
      </div>
    </div>
  );
}
