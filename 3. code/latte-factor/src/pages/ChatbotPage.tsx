// src/pages/ChatbotPage.tsx — AI Chatbot with Vietnamese NLP

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useTransactionStore } from '../store/transactionStore';
import { NaiveBayesClassifier } from '../algorithms/naiveBayes';
import { detectIntent } from '../nlp/intentDetector';
import type { ChatMessage, Transaction, TransactionLabel } from '../types';
import { v4 as uuidv4 } from 'uuid';

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

    const labelText = tx.label === 'latte' ? '☕ Linh tinh' : '✅ Thiết yếu';
    const confText = `${(prediction.confidence * 100).toFixed(0)}%`;

    return {
      text: `Đã ghi nhận: **${formatVND(tx.amount)}** — ${new Date(tx.timestamp).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}\n\nPhân loại: ${labelText} (độ tin cậy: ${confText})\n\nBấm ✏️ nếu phân loại sai để AI học thêm.`,
      transaction: tx,
    };
  }

  if (intent.intent === 'query_report') {
    const latteTotal = transactions.filter(t => t.label === 'latte').reduce((s, t) => s + t.amount, 0);
    const total = transactions.reduce((s, t) => s + t.amount, 0);
    const latteCount = transactions.filter(t => t.label === 'latte').length;
    return {
      text: `📊 **Báo cáo chi tiêu:**\n\n• Tổng: ${formatVND(total)}\n• Linh tinh: ${formatVND(latteTotal)} (${latteCount} lần)\n• Thiết yếu: ${formatVND(total - latteTotal)}\n• % Linh tinh: ${total > 0 ? ((latteTotal / total) * 100).toFixed(1) : 0}%`,
    };
  }

  if (intent.intent === 'set_budget') {
    return {
      text: `💰 Đã hiểu! Bạn muốn đặt ngân sách ${intent.extractedData?.amount ? formatVND(intent.extractedData.amount) : 'mới'}. Hãy vào tab **Cấu hình** để thiết lập ngân sách Knapsack.`,
    };
  }

  if (intent.intent === 'query_trend') {
    return {
      text: `📈 Để xem xu hướng chi tiêu và dự báo, hãy vào **Dashboard → tab Xu hướng**. Thuật toán Linear Regression sẽ phân tích và dự đoán chi tiêu trong 30 ngày tới.`,
    };
  }

  if (intent.intent === 'query_savings') {
    return {
      text: `💎 Để xem số tiền bạn có thể tiết kiệm được, vào **Dashboard → tab Tích lũy tương lai**. Công thức FV Annuity sẽ tính toán dựa trên chi tiêu linh tinh hiện tại của bạn.`,
    };
  }

  if (intent.intent === 'help') {
    return {
      text: `🤖 **Hướng dẫn sử dụng Chatbot:**\n\n• **Thêm giao dịch:** "hôm nay mua trà sữa 35k lúc 3h chiều"\n• **Xem báo cáo:** "tháng này tôi tốn bao nhiêu tiền linh tinh?"\n• **Cảnh báo:** "xu hướng chi tiêu của tôi thế nào?"\n• **Tiết kiệm:** "nếu tôi bỏ uống trà sữa thì tiết kiệm được bao nhiêu?"\n\nChatbot dùng Naive Bayes + rule-based NLP (không phải LLM thật) nên chỉ hiểu các câu theo mẫu trên.`,
    };
  }

  return {
    text: `🤔 Xin lỗi, tôi chưa hiểu câu hỏi này. Gõ "help" để xem hướng dẫn, hoặc thử nhập giao dịch như: "mua trà sữa 35k lúc 3h chiều".`,
  };
}

export default function ChatbotPage() {
  const { messages, addMessage } = useChatStore();
  const { transactions, addTransaction, updateTransaction } = useTransactionStore();
  const [input, setInput] = useState('');
  const [pendingTx, setPendingTx] = useState<{ msgId: string; tx: Transaction } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const clf = React.useMemo(() => buildClassifier(transactions), [transactions.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        id: uuidv4(),
        role: 'bot',
        content: '👋 Xin chào! Tôi là **Lỗ Thủng Ví Bot** — trợ lý AI giúp bạn phát hiện thói quen chi tiêu lãng phí.\n\nGõ "help" để xem hướng dẫn, hoặc thử nhập: "hôm nay mua trà sữa 35k"',
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
      content: `✅ Đã lưu giao dịch ${formatVND(tx.amount)} vào danh sách!`,
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
      content: `🧠 Cảm ơn! AI đã học được: "${tx.note}" → ${label === 'latte' ? '☕ Linh tinh' : '✅ Thiết yếu'}. Lần sau tôi sẽ phân loại chính xác hơn.`,
      timestamp: new Date(),
    });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(22,33,62,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <span style={{ fontSize: 24 }}>🤖</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Lỗ Thủng Ví Bot</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Naive Bayes NLP + Rule-based Intent · {transactions.length} giao dịch trong bộ nhớ</div>
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
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              flexShrink: 0,
            }}>
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))'
                  : 'rgba(255,255,255,0.05)',
                border: msg.role === 'user'
                  ? '1px solid rgba(99,102,241,0.3)'
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
                    style={{ fontSize: 12, padding: '6px 12px' }}
                  >
                    ✅ Xác nhận & Lưu
                  </button>
                  <button
                    onClick={() => correctLabel(pendingTx.tx, 'essential')}
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: '6px 12px' }}
                  >
                    ✏️ Thiết yếu
                  </button>
                  <button
                    onClick={() => correctLabel(pendingTx.tx, 'latte')}
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: '6px 12px' }}
                  >
                    ✏️ Linh tinh
                  </button>
                  <button
                    onClick={() => setPendingTx(null)}
                    className="btn-danger"
                    style={{ fontSize: 12, padding: '6px 12px' }}
                  >
                    ❌ Hủy
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
          'tháng này tốn bao nhiêu tiền linh tinh?',
          'xu hướng chi tiêu của tôi?',
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
            {s.length > 30 ? s.slice(0, 30) + '...' : s}
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
          placeholder="Nhập giao dịch hoặc câu hỏi... (VD: mua trà sữa 35k lúc 3h chiều)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          style={{ flex: 1 }}
        />
        <button className="btn-primary" onClick={handleSend} disabled={!input.trim()}>
          Gửi ↑
        </button>
      </div>
    </div>
  );
}
