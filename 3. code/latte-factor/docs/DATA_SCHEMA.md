# DATA_SCHEMA.md — Schema Giao dịch & Format File Import

## Schema giao dịch (Transaction)

```typescript
interface Transaction {
  id: string;           // UUID, tự generate
  amount: number;       // Số tiền (VNĐ), luôn dương
  timestamp: Date;      // Ngày giờ giao dịch
  note: string;         // Nội dung/ghi chú (VD: "Tiem tra sua Te Amo")
  category?: string;    // Danh mục (VD: "Trà sữa", "Ăn vặt")
  label?: 'essential' | 'latte';  // Nhãn Thiết yếu / Linh tinh
  source: 'manual' | 'csv' | 'excel' | 'sms' | 'chatbot';
  confidence?: number;  // Độ tin cậy Naive Bayes (0-1)
}
```

## Format file CSV/Excel import

### Định dạng cột bắt buộc:
| Cột          | Tên gợi ý            | Ví dụ                      |
|--------------|----------------------|---------------------------|
| Ngày giờ     | date, ngay, datetime | 2024-01-15, 15/01/2024     |
| Số tiền      | amount, sotien       | 35000, 35.000, 35k         |
| Nội dung     | note, noidung, desc  | "Tiem tra sua Te Amo"      |
| Danh mục     | category (optional)  | Trà sữa                    |

### Ví dụ file CSV:
```
date,amount,note,category
2024-01-15 15:30,35000,Tiem tra sua Te Amo,Trà sữa
2024-01-16 12:00,25000,Bun dau mam tom,Ăn vặt
2024-01-20 08:00,50000,Xang xe,Xăng xe
```

### Sao kê ngân hàng phổ biến (auto-detect columns):
- **VCB (Vietcombank)**: cột "Ngày GD", "Số tiền", "Mô tả"
- **Techcombank**: cột "Transaction Date", "Amount", "Description"
- **MBBank**: cột "Ngày giao dịch", "Số tiền", "Nội dung"
- **BIDV**: cột "Ngày", "Số tiền Nợ/Có", "Mô tả giao dịch"

## Dataset mẫu

File: `src/data/sampleDatasets/transactions_vi.csv`  
Số dòng: ~300 giao dịch giả lập trong 3 tháng  
Nhãn: đã gắn nhãn "essential"/"latte" cho training Naive Bayes
