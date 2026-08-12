// src/services/exportExcel.ts — Export to Excel using exceljs

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Transaction, Cluster, RegressionResult, FVResult, KnapsackResult, AssociationRule, ChatMessage } from '../types';

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

const HEADER_STYLE: Partial<ExcelJS.Style> = {
  font: { bold: true, color: { argb: 'FFFFFFFF' } },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: {
    bottom: { style: 'thin', color: { argb: 'FF8B5CF6' } },
  },
};

function applyHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    Object.assign(cell, { style: HEADER_STYLE });
  });
  row.height = 28;
}

export async function exportToExcel(data: {
  transactions: Transaction[];
  clusters: Cluster[];
  regression: RegressionResult | null;
  futureValue: FVResult | null;
  knapsackResult: KnapsackResult | null;
  rules: AssociationRule[];
  chatMessages: ChatMessage[];
  totalAmount: number;
  latteAmount: number;
}) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Lỗ Thủng Ví App';
  wb.created = new Date();

  // Sheet 1: Tổng quan
  {
    const ws = wb.addWorksheet('Tổng quan');
    ws.columns = [
      { header: 'Chỉ số', key: 'metric', width: 30 },
      { header: 'Giá trị', key: 'value', width: 25 },
    ];
    applyHeader(ws.getRow(1));
    const latteCount = data.transactions.filter(t => t.label === 'latte').length;
    ws.addRows([
      { metric: 'Tổng chi tiêu', value: formatVND(data.totalAmount) },
      { metric: 'Chi tiêu linh tinh (Latte)', value: formatVND(data.latteAmount) },
      { metric: 'Chi tiêu thiết yếu', value: formatVND(data.totalAmount - data.latteAmount) },
      { metric: '% Linh tinh', value: `${data.totalAmount > 0 ? ((data.latteAmount / data.totalAmount) * 100).toFixed(1) : 0}%` },
      { metric: 'Số giao dịch linh tinh', value: latteCount },
      { metric: 'Tổng số giao dịch', value: data.transactions.length },
    ]);
  }

  // Sheet 2: Lịch sử giao dịch
  {
    const ws = wb.addWorksheet('Giao dịch');
    ws.columns = [
      { header: 'Ngày giờ', key: 'date', width: 20 },
      { header: 'Số tiền', key: 'amount', width: 15 },
      { header: 'Nội dung', key: 'note', width: 35 },
      { header: 'Danh mục', key: 'category', width: 15 },
      { header: 'Phân loại', key: 'label', width: 15 },
      { header: 'Nguồn', key: 'source', width: 12 },
    ];
    applyHeader(ws.getRow(1));
    data.transactions.forEach(t => {
      ws.addRow({
        date: new Date(t.timestamp).toLocaleString('vi-VN'),
        amount: t.amount,
        note: t.note,
        category: t.category ?? '',
        label: t.label === 'latte' ? 'Linh tinh' : t.label === 'essential' ? 'Thiết yếu' : 'Chưa phân loại',
        source: t.source,
      });
    });
    ws.getColumn('amount').numFmt = '#,##0 "₫"';
  }

  // Sheet 3: Phân cụm K-Means
  {
    const ws = wb.addWorksheet('Phân cụm K-Means');
    ws.columns = [
      { header: 'Cụm', key: 'cluster', width: 20 },
      { header: 'Số giao dịch', key: 'count', width: 15 },
      { header: 'Tổng tiền', key: 'total', width: 20 },
      { header: 'Latte Factor?', key: 'isLatte', width: 15 },
    ];
    applyHeader(ws.getRow(1));
    data.clusters.forEach(c => {
      ws.addRow({
        cluster: c.name,
        count: c.transactions.length,
        total: c.transactions.reduce((s, t) => s + t.amount, 0),
        isLatte: c.isLatteFactor ? 'Có ⚠️' : 'Không',
      });
    });
    ws.getColumn('total').numFmt = '#,##0 "₫"';
  }

  // Sheet 4: Xu hướng (Linear Regression)
  {
    const ws = wb.addWorksheet('Xu hướng');
    ws.columns = [
      { header: 'Ngày', key: 'date', width: 20 },
      { header: 'Chi tiêu thực', key: 'actual', width: 18 },
      { header: 'Dự báo', key: 'forecast', width: 18 },
      { header: 'Loại', key: 'type', width: 12 },
    ];
    applyHeader(ws.getRow(1));
    if (data.regression) {
      data.regression.dataPoints.forEach(p => {
        ws.addRow({
          date: p.date.toLocaleDateString('vi-VN'),
          actual: p.y,
          forecast: data.regression!.predict(p.x),
          type: 'Thực tế',
        });
      });
      data.regression.forecastPoints.forEach(p => {
        ws.addRow({
          date: p.date.toLocaleDateString('vi-VN'),
          actual: '',
          forecast: p.y,
          type: 'Dự báo',
        });
      });
    }
    ws.getColumn('actual').numFmt = '#,##0 "₫"';
    ws.getColumn('forecast').numFmt = '#,##0 "₫"';
  }

  // Sheet 5: Tích lũy tương lai (FV)
  {
    const ws = wb.addWorksheet('Tích lũy tương lai');
    ws.columns = [
      { header: 'Tháng', key: 'month', width: 10 },
      { header: 'Đã tiết kiệm', key: 'saved', width: 20 },
      { header: 'Giá trị tương lai (FV)', key: 'fv', width: 25 },
      { header: 'Lãi kiếm được', key: 'interest', width: 20 },
    ];
    applyHeader(ws.getRow(1));
    if (data.futureValue) {
      data.futureValue.schedule.forEach(s => {
        ws.addRow({
          month: s.month,
          saved: s.saved,
          fv: s.fv,
          interest: s.fv - s.saved,
        });
      });
    }
    ['saved', 'fv', 'interest'].forEach(col => {
      ws.getColumn(col).numFmt = '#,##0 "₫"';
    });
  }

  // Sheet 6: Ngân sách tối ưu (Knapsack)
  {
    const ws = wb.addWorksheet('Ngân sách tối ưu');
    ws.columns = [
      { header: 'Món', key: 'name', width: 25 },
      { header: 'Chi phí', key: 'weight', width: 15 },
      { header: 'Độ thỏa mãn', key: 'value', width: 15 },
      { header: 'Được chọn', key: 'selected', width: 12 },
    ];
    applyHeader(ws.getRow(1));
    if (data.knapsackResult) {
      data.knapsackResult.selectedItems.forEach(item => {
        ws.addRow({
          name: item.name,
          weight: item.weight,
          value: item.value,
          selected: '✓',
        });
      });
    }
    ws.getColumn('weight').numFmt = '#,##0 "₫"';
  }

  // Sheet 7: Luật kết hợp (Apriori)
  {
    const ws = wb.addWorksheet('Cảnh báo hành vi');
    ws.columns = [
      { header: 'Nguyên nhân (A)', key: 'ant', width: 25 },
      { header: 'Kết quả (B)', key: 'cons', width: 25 },
      { header: 'Support', key: 'support', width: 12 },
      { header: 'Confidence', key: 'confidence', width: 12 },
      { header: 'Lift', key: 'lift', width: 10 },
    ];
    applyHeader(ws.getRow(1));
    data.rules.forEach(r => {
      ws.addRow({
        ant: r.antecedent.join(', '),
        cons: r.consequent.join(', '),
        support: `${(r.support * 100).toFixed(1)}%`,
        confidence: `${(r.confidence * 100).toFixed(1)}%`,
        lift: r.lift.toFixed(2),
      });
    });
  }

  // Sheet 8: Lịch sử chatbot
  {
    const ws = wb.addWorksheet('Lịch sử Chatbot');
    ws.columns = [
      { header: 'Thời gian', key: 'time', width: 20 },
      { header: 'Vai trò', key: 'role', width: 10 },
      { header: 'Nội dung', key: 'content', width: 60 },
    ];
    applyHeader(ws.getRow(1));
    data.chatMessages.slice(-500).forEach(m => {
      ws.addRow({
        time: new Date(m.timestamp).toLocaleString('vi-VN'),
        role: m.role === 'user' ? 'Người dùng' : 'Chatbot',
        content: m.content,
      });
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `lo-thung-vi-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
